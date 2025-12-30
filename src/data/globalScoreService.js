// Global High Scores using Google Sheets + Apps Script
// Free, permanent, no limits!

const API_URL = 'https://script.google.com/macros/s/AKfycbx2xuBfJE6j4b44xHR7MTqT-ZTLyyK1nrFzT_EPtuzjKZaDrAyKki0M_yMOj9Ns3fTk/exec';
const CACHE_KEY_PREFIX = 'pord_global_scores_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache (increased from 1 min)
const STALE_DURATION = 30 * 60 * 1000; // Serve stale data up to 30 minutes while refreshing
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 500; // 500ms

// In-memory cache for instant access (no localStorage parsing overhead)
const memoryCache = new Map();

// Track ongoing fetch promises to prevent duplicate requests
const pendingFetches = new Map();

// Retry fetch with exponential backoff (helps with intermittent CORS issues)
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
      });
      
      if (response.ok) {
        return response;
      }
      
      // If response is not OK but we got a response, might still work
      if (response.status === 200) {
        return response;
      }
      
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < retries - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Get cache key for a specific league and period
function getCacheKey(league, period = null) {
  const timezone = period === 'daily' ? '_cet' : '';
  return `${CACHE_KEY_PREFIX}_${league || 'all'}_${period || 'alltime'}${timezone}`;
}

// Get cached scores - checks memory first, then localStorage
function getCachedScores(league, period = null, allowStale = false) {
  const key = getCacheKey(league, period);
  const maxAge = allowStale ? STALE_DURATION : CACHE_DURATION;
  
  // Check memory cache first (instant access)
  if (memoryCache.has(key)) {
    const { scores, timestamp } = memoryCache.get(key);
    if (Date.now() - timestamp < maxAge) {
      return { scores, isStale: Date.now() - timestamp >= CACHE_DURATION };
    }
  }
  
  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { scores, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < maxAge) {
        // Populate memory cache from localStorage
        memoryCache.set(key, { scores, timestamp });
        return { scores, isStale: Date.now() - timestamp >= CACHE_DURATION };
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null;
}

// Save scores to both memory and localStorage cache
function setCachedScores(scores, league, period = null) {
  const key = getCacheKey(league, period);
  const cacheData = { scores, timestamp: Date.now() };
  
  // Save to memory cache (instant)
  memoryCache.set(key, cacheData);
  
  // Save to localStorage (persistent)
  try {
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (e) {
    // Ignore cache errors
  }
}

// Actual fetch implementation
async function doFetchScores(league, period) {
  // Build URL with league and period parameters if specified
  let url = API_URL;
  const params = new URLSearchParams();

  if (league) {
    params.append('league', league);
  }

  if (period) {
    params.append('period', period);
    // For daily filtering, specify German timezone (CET/CEST)
    if (period === 'daily') {
      params.append('timezone', 'Europe/Berlin');
    }
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetchWithRetry(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Could not fetch global scores');
  }

  const data = await response.json();
  const scores = data.success ? data.scores : [];

  // For daily filtering, apply client-side date filtering as fallback
  let filteredScores = scores;
  if (period === 'daily') {
    try {
      const now = new Date();
      const germanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
      const today = new Date(germanTime.getFullYear(), germanTime.getMonth(), germanTime.getDate());

      filteredScores = scores.filter(entry => {
        let entryDate = null;

        // Try different timestamp fields
        if (entry.timestamp) {
          entryDate = new Date(entry.timestamp);
        } else if (entry.date) {
          entryDate = new Date(entry.date);
        } else if (entry.createdAt) {
          entryDate = new Date(entry.createdAt);
        }

        if (entryDate && !isNaN(entryDate.getTime())) {
          // Convert to German timezone for comparison
          const germanEntryDate = new Date(entryDate.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
          const entryDay = new Date(germanEntryDate.getFullYear(), germanEntryDate.getMonth(), germanEntryDate.getDate());

          const isToday = entryDay.getTime() === today.getTime();
          return isToday;
        } else {
          // Keep entries without valid timestamps (backwards compatibility)
          return true;
        }
      });
    } catch (error) {
      console.error('Error in daily filtering:', error);
      filteredScores = scores; // Fallback to original scores if filtering fails
    }
  }

  return filteredScores;
}

// Fetch global high scores with stale-while-revalidate caching
export async function fetchGlobalScores(forceRefresh = false, league = null, period = null) {
  const cacheKey = getCacheKey(league, period);
  
  // Check for fresh cache first
  if (!forceRefresh) {
    const cached = getCachedScores(league, period, true); // Allow stale data
    if (cached) {
      // If data is fresh, return immediately
      if (!cached.isStale) {
        return cached.scores;
      }
      
      // If data is stale but usable, return it AND refresh in background
      // Prevent duplicate fetches using pendingFetches map
      if (!pendingFetches.has(cacheKey)) {
        const refreshPromise = doFetchScores(league, period)
          .then(freshScores => {
            setCachedScores(freshScores, league, period);
            pendingFetches.delete(cacheKey);
            return freshScores;
          })
          .catch(err => {
            console.warn('Background refresh failed:', err);
            pendingFetches.delete(cacheKey);
          });
        pendingFetches.set(cacheKey, refreshPromise);
      }
      
      // Return stale data immediately while refreshing in background
      return cached.scores;
    }
  }

  // No cache or force refresh - need to fetch
  // Check if there's already a pending fetch for this key
  if (pendingFetches.has(cacheKey)) {
    return pendingFetches.get(cacheKey);
  }

  // Create new fetch promise
  const fetchPromise = doFetchScores(league, period)
    .then(scores => {
      setCachedScores(scores, league, period);
      pendingFetches.delete(cacheKey);
      return scores;
    })
    .catch(error => {
      console.warn('Error fetching global scores:', error);
      pendingFetches.delete(cacheKey);
      // Return any cached data as fallback
      const fallback = getCachedScores(league, period, true);
      return fallback?.scores || [];
    });
  
  pendingFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// Submit a new score to global leaderboard
export async function submitGlobalScore(scoreData) {
  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Apps Script needs this for CORS
      },
      body: JSON.stringify({
        // Core score data
        name: scoreData.name,
        icon: scoreData.icon || '🎮',
        score: scoreData.score,
        accuracy: scoreData.accuracy || 0,
        avgSpeed: scoreData.avgSpeed || null,
        league: scoreData.league || null,
        // Game metadata
        gameId: scoreData.gameId || null,
        gameDuration: scoreData.gameDuration || null, // in milliseconds
        playerCount: scoreData.playerCount || 1,
        livesLost: scoreData.livesLost || 0,
        totalRounds: scoreData.totalRounds || null,
        bonusRoundsPlayed: scoreData.bonusRoundsPlayed || 0,
        correctAnswers: scoreData.correctAnswers || 0,
        wrongAnswers: scoreData.wrongAnswers || 0,
        bestStreak: scoreData.bestStreak || 0,
        gameMode: scoreData.gameMode || 'single',
      }),
    });
    
    if (!response.ok) {
      console.warn('Could not save global score');
      return [];
    }
    
    // Fetch updated scores after submission (force refresh for this league)
    return await fetchGlobalScores(true, scoreData.league, null);
  } catch (error) {
    console.warn('Error submitting global score:', error);
    return [];
  }
}
