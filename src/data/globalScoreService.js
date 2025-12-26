// Global High Scores using Google Sheets + Apps Script
// Free, permanent, no limits!

const API_URL = 'https://script.google.com/macros/s/AKfycbx2xuBfJE6j4b44xHR7MTqT-ZTLyyK1nrFzT_EPtuzjKZaDrAyKki0M_yMOj9Ns3fTk/exec';
const CACHE_KEY_PREFIX = 'pord_global_scores_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Get cache key for a specific league
function getCacheKey(league) {
  return `${CACHE_KEY_PREFIX}_${league || 'all'}`;
}

// Get cached scores if still valid
function getCachedScores(league) {
  try {
    const cached = localStorage.getItem(getCacheKey(league));
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
function setCachedScores(scores, league) {
  try {
    localStorage.setItem(getCacheKey(league), JSON.stringify({
      scores,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore cache errors
  }
}

// Fetch global high scores (with caching and optional league filter)
export async function fetchGlobalScores(forceRefresh = false, league = null) {
  // Return cached if available and not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedScores(league);
    if (cached) {
      return cached;
    }
  }
  
  try {
    // Build URL with league parameter if specified
    let url = API_URL;
    if (league) {
      url += `?league=${encodeURIComponent(league)}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.warn('Could not fetch global scores');
      return getCachedScores(league) || [];
    }
    
    const data = await response.json();
    const scores = data.success ? data.scores : [];
    
    // Cache the results
    setCachedScores(scores, league);
    
    return scores;
  } catch (error) {
    console.warn('Error fetching global scores:', error);
    // Return cached scores as fallback
    return getCachedScores(league) || [];
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
    return await fetchGlobalScores(true, scoreData.league);
  } catch (error) {
    console.warn('Error submitting global score:', error);
    return [];
  }
}
