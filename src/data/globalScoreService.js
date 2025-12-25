// Global High Scores using Google Sheets + Apps Script
// Free, permanent, no limits!

const API_URL = 'https://script.google.com/macros/s/AKfycbx2xuBfJE6j4b44xHR7MTqT-ZTLyyK1nrFzT_EPtuzjKZaDrAyKki0M_yMOj9Ns3fTk/exec';
const CACHE_KEY = 'pord_global_scores_cache';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Get cached scores if still valid
function getCachedScores() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
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
function setCachedScores(scores) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      scores,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore cache errors
  }
}

// Fetch global high scores (with caching)
export async function fetchGlobalScores(forceRefresh = false) {
  // Return cached if available and not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedScores();
    if (cached) {
      return cached;
    }
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.warn('Could not fetch global scores');
      return getCachedScores() || [];
    }
    
    const data = await response.json();
    const scores = data.success ? data.scores : [];
    
    // Cache the results
    setCachedScores(scores);
    
    return scores;
  } catch (error) {
    console.warn('Error fetching global scores:', error);
    // Return cached scores as fallback
    return getCachedScores() || [];
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
        name: scoreData.name,
        score: scoreData.score,
        accuracy: scoreData.accuracy || 0,
        avgSpeed: scoreData.avgSpeed || null,
      }),
    });
    
    if (!response.ok) {
      console.warn('Could not save global score');
      return [];
    }
    
    // Fetch updated scores after submission (force refresh)
    return await fetchGlobalScores(true);
  } catch (error) {
    console.warn('Error submitting global score:', error);
    return [];
  }
}

