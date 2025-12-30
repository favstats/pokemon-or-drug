// Global High Scores using Google Sheets + Apps Script
// LAZY LOADING: Only fetch what's needed, when needed

const API_URL = 'https://script.google.com/macros/s/AKfycbx2xuBfJE6j4b44xHR7MTqT-ZTLyyK1nrFzT_EPtuzjKZaDrAyKki0M_yMOj9Ns3fTk/exec';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minute cache
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// In-memory cache: Map of "league_period" -> { scores, timestamp }
const cache = new Map();

// Track pending fetches to prevent duplicates
const pendingFetches = new Map();

// Retry fetch with exponential backoff
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
      
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      
      if (attempt < retries - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Get cache key
function getCacheKey(league, period) {
  return `${league || 'all'}_${period || 'global'}`;
}

// Get cached data if still fresh
function getCached(league, period) {
  const key = getCacheKey(league, period);
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.scores;
  }
  
  // Also try localStorage as backup
  try {
    const stored = localStorage.getItem(`pord_scores_${key}`);
    if (stored) {
      const { scores, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < CACHE_DURATION) {
        cache.set(key, { scores, timestamp });
        return scores;
      }
    }
  } catch (e) {
    // Ignore
  }
  
  return null;
}

// Save to cache
function setCache(league, period, scores) {
  const key = getCacheKey(league, period);
  const data = { scores, timestamp: Date.now() };
  
  cache.set(key, data);
  
  try {
    localStorage.setItem(`pord_scores_${key}`, JSON.stringify(data));
  } catch (e) {
    // Ignore quota errors
  }
}

// Filter for today's scores (German timezone)
function filterDaily(scores) {
  const now = new Date();
  const germanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
  const today = new Date(germanTime.getFullYear(), germanTime.getMonth(), germanTime.getDate());

  return scores.filter(entry => {
    let entryDate = entry.timestamp || entry.date || entry.createdAt;
    if (!entryDate) return false;
    
    entryDate = new Date(entryDate);
    if (isNaN(entryDate.getTime())) return false;
    
    const germanEntry = new Date(entryDate.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const entryDay = new Date(germanEntry.getFullYear(), germanEntry.getMonth(), germanEntry.getDate());
    return entryDay.getTime() === today.getTime();
  });
}

// Fetch scores for a specific league (lazy loading)
export async function fetchGlobalScores(forceRefresh = false, league = null, period = null) {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCached(league, period);
    if (cached) {
      console.log(`Cache hit for ${league || 'all'} ${period || 'global'}`);
      return cached;
    }
  }
  
  // Check if already fetching
  const fetchKey = getCacheKey(league, period);
  if (pendingFetches.has(fetchKey)) {
    return pendingFetches.get(fetchKey);
  }
  
  // Build URL
  const params = new URLSearchParams();
  if (league) params.append('league', league);
  
  const url = params.toString() ? `${API_URL}?${params}` : API_URL;
  
  console.log(`Fetching ${league || 'all'} ${period || 'global'}...`);
  
  const fetchPromise = (async () => {
    try {
      const response = await fetchWithRetry(url);
      const data = await response.json();
      let scores = data.success ? data.scores : [];
      
      // Filter for daily if needed
      if (period === 'daily') {
        scores = filterDaily(scores);
      }
      
      // Cache the results
      setCache(league, period, scores);
      
      console.log(`Fetched ${scores.length} scores for ${league || 'all'} ${period || 'global'}`);
      return scores;
    } catch (error) {
      console.warn(`Failed to fetch ${league} ${period}:`, error);
      // Return cached data as fallback (even if stale)
      const stale = getCached(league, period);
      return stale || [];
    } finally {
      pendingFetches.delete(fetchKey);
    }
  })();
  
  pendingFetches.set(fetchKey, fetchPromise);
  return fetchPromise;
}

// Submit a new score
export async function submitGlobalScore(scoreData) {
  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        name: scoreData.name,
        icon: scoreData.icon || '🎮',
        score: scoreData.score,
        accuracy: scoreData.accuracy || 0,
        avgSpeed: scoreData.avgSpeed || null,
        league: scoreData.league || null,
        gameId: scoreData.gameId || null,
        gameDuration: scoreData.gameDuration || null,
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
      console.warn('Could not save score');
      return [];
    }
    
    // Clear cache for this league so next view gets fresh data
    const key = getCacheKey(scoreData.league, null);
    cache.delete(key);
    cache.delete(getCacheKey(scoreData.league, 'daily'));
    
    return await fetchGlobalScores(true, scoreData.league);
  } catch (error) {
    console.warn('Error submitting score:', error);
    return [];
  }
}
