// Global High Scores using Google Sheets + Apps Script
// Free, permanent, no limits!

const API_URL = 'https://script.google.com/macros/s/AKfycbx2xuBfJE6j4b44xHR7MTqT-ZTLyyK1nrFzT_EPtuzjKZaDrAyKki0M_yMOj9Ns3fTk/exec';
const CACHE_KEY_PREFIX = 'pord_global_scores_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Get cache key for a specific league and period
function getCacheKey(league, period = null) {
  const timezone = period === 'daily' ? '_cet' : '';
  return `${CACHE_KEY_PREFIX}_${league || 'all'}_${period || 'alltime'}${timezone}`;
}

// Get cached scores if still valid
function getCachedScores(league, period = null) {
  try {
    const cached = localStorage.getItem(getCacheKey(league, period));
    if (cached) {
      const { scores, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return scores;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null;
}

// Save scores to cache
function setCachedScores(scores, league, period = null) {
  try {
    localStorage.setItem(getCacheKey(league, period), JSON.stringify({
      scores,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore cache errors
  }
}

// Fetch global high scores (with caching and optional league filter)
export async function fetchGlobalScores(forceRefresh = false, league = null, period = null) {
  // Return cached if available and not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedScores(league, period);
    if (cached) {
      return cached;
    }
  }

  try {
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

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.warn('Could not fetch global scores');
      return getCachedScores(league, period) || [];
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

    // Cache the results
    setCachedScores(filteredScores, league, period);

    return filteredScores;
  } catch (error) {
    console.warn('Error fetching global scores:', error);
    // Return cached scores as fallback
    return getCachedScores(league, period) || [];
  }
}

// Submit a new score to global leaderboard
export async function submitGlobalScore(scoreData) {
  try {
    const response = await fetch(API_URL, {
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
