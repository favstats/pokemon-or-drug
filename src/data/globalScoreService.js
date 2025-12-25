// Global High Scores using Google Sheets + Apps Script
// Free, permanent, no limits!

const API_URL = 'https://script.google.com/macros/s/AKfycbx2xuBfJE6j4b44xHR7MTqT-ZTLyyK1nrFzT_EPtuzjKZaDrAyKki0M_yMOj9Ns3fTk/exec';

// Fetch global high scores
export async function fetchGlobalScores() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.warn('Could not fetch global scores');
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.scores : [];
  } catch (error) {
    console.warn('Error fetching global scores:', error);
    return [];
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
      }),
    });
    
    if (!response.ok) {
      console.warn('Could not save global score');
      return [];
    }
    
    // Fetch updated scores after submission
    return await fetchGlobalScores();
  } catch (error) {
    console.warn('Error submitting global score:', error);
    return [];
  }
}

