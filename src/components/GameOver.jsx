import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faMedal,
  faRedo,
  faHome,
  faStar,
  faCheck,
  faTimes,
  faFire,
  faCrown,
  faStopwatch,
  faBolt,
  faShareAlt,
  faCoffee,
  faChartLine,
  faHeartBroken,
  faCalendarAlt,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import confetti from 'canvas-confetti';
import { useGame, LEAGUES } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import ShareModal from './ShareModal';
import './GameOver.css';

// Import badge SVGs
import BoulderBadge from '../assets/badges/boulder.svg';
import CascadeBadge from '../assets/badges/cascade.svg';
import VolcanoBadge from '../assets/badges/volcano.svg';
import EarthBadge from '../assets/badges/earth.svg';

const badgeImages = {
  boulder: BoulderBadge,
  cascade: CascadeBadge,
  volcano: VolcanoBadge,
  earth: EarthBadge,
};

// ========== DEBUG MODE ==========
// Set to true to force winning a medal on next game
// Set DEBUG_MEDAL_TYPE to 'global', 'daily', or 'both'
const DEBUG_FORCE_MEDAL = false; // <-- SET TO true TO ENABLE
const DEBUG_MEDAL_TYPE = 'both'; // 'global', 'daily', or 'both'
const DEBUG_MEDAL_RANK = 3; // What rank to simulate (1-10)
// ================================

// Bell Curve Component
function BellCurve({ percentile, label, color }) {
  // Generate bell curve points
  const points = [];
  for (let x = -3; x <= 3; x += 0.1) {
    const y = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    points.push({ x, y });
  }
  
  // Convert percentile (0-100) to x position (-3 to 3)
  const playerX = ((percentile / 100) * 6) - 3;
  const playerY = Math.exp(-0.5 * playerX * playerX) / Math.sqrt(2 * Math.PI);
  
  // SVG dimensions
  const width = 280;
  const height = 100;
  const padding = 10;
  
  const scaleX = (x) => ((x + 3) / 6) * (width - 2 * padding) + padding;
  const scaleY = (y) => height - padding - (y / 0.4) * (height - 2 * padding);
  
  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`
  ).join(' ');
  
  // Fill area under curve FROM player position to the RIGHT (the "top" zone you're in)
  const fillPoints = points.filter(p => p.x >= playerX);
  const fillD = `M ${scaleX(playerX).toFixed(1)} ${height - padding} ` +
    `L ${scaleX(playerX).toFixed(1)} ${scaleY(playerY).toFixed(1)} ` +
    fillPoints.map((p) => 
      `L ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`
    ).join(' ') + 
    ` L ${scaleX(3)} ${height - padding} Z`;

  return (
    <div className="bell-curve-container">
      <div className="bell-curve-label">{label}</div>
      <svg width={width} height={height} className="bell-curve-svg">
        {/* Filled area - the "top X%" you're in */}
        <path d={fillD} fill={color} opacity="0.3" />
        {/* Curve line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
        {/* Player position marker */}
        <circle cx={scaleX(playerX)} cy={scaleY(playerY)} r="6" fill={color} />
        <line 
          x1={scaleX(playerX)} y1={scaleY(playerY)} 
          x2={scaleX(playerX)} y2={height - padding} 
          stroke={color} strokeWidth="2" strokeDasharray="4"
        />
      </svg>
      <div className="percentile-value" style={{ color }}>
        Top {Math.round(100 - percentile)}%
      </div>
    </div>
  );
}

function GameOver() {
  const { state, actions } = useGame();
  const { play } = useSound();
  const confettiFired = useRef(false);
  const scoresSaved = useRef(false);
  const [scoreTab, setScoreTab] = useState('daily');
  const [leagueFilter, setLeagueFilter] = useState(state.selectedLeague || 'boulder');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlayer, setSharePlayer] = useState(null); // Which player to share
  
  // Sort players by score
  const rankedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const winner = rankedPlayers[0];
  
  // Helper function to keep only the top score per player
  const getUniquePlayerScores = (scores) => {
    if (!scores || !Array.isArray(scores)) return [];
    
    const playerBestScores = new Map();
    
    // Sort by score descending first
    const sortedScores = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Keep only the best score for each player (by name)
    for (const entry of sortedScores) {
      const nameStr = typeof entry.name === 'string' ? entry.name : String(entry.name || 'unknown');
      const playerKey = nameStr.toLowerCase();
      if (!playerBestScores.has(playerKey)) {
        playerBestScores.set(playerKey, entry);
      }
    }
    
    // Return sorted by score
    return Array.from(playerBestScores.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
  };
  
  // Calculate percentiles from global scores and top 10 feedback
  const playerStats = useMemo(() => {
    const player = winner; // Use winner (top player) for top 10 calculations
    const globalScores = state.globalScores;
    const dailyScores = state.dailyScores;

    if (!player) {
      return { scorePercentile: 50, speedPercentile: 50, totalPlayers: 0, loading: false };
    }

    // Filter scores by the selected league for proper comparison
    const selectedLeague = state.selectedLeague;
    const leagueFilteredGlobalScores = selectedLeague 
      ? globalScores.filter(s => s.league === selectedLeague)
      : globalScores;
    const leagueFilteredDailyScores = selectedLeague 
      ? dailyScores.filter(s => s.league === selectedLeague)
      : dailyScores;

    if (!leagueFilteredGlobalScores.length) {
      return {
        scorePercentile: 50,
        speedPercentile: 50,
        totalPlayers: 0,
        loading: state.globalScoresLoading,
        playerScore: player.score,
        playerSpeed: player.avgResponseTime,
        top10Rank: null,
        dailyTop10Rank: null,
        pointsFromTop10: null,
        dailyPointsFromTop10: null,
        dailyPlayerRank: null,
        selectedLeague: selectedLeague,
      };
    }
    
    // Use league-filtered scores for comparison, with unique players only
    const leagueScores = getUniquePlayerScores(leagueFilteredGlobalScores);
    
    // Calculate score percentile
    const scoresBelowPlayer = leagueScores.filter(s => s.score < player.score).length;
    const scorePercentile = (scoresBelowPlayer / leagueScores.length) * 100;
    
    // Calculate speed percentile (lower is better, so invert)
    const speedScores = leagueScores.filter(s => s.avgSpeed && s.avgSpeed > 0);
    let speedPercentile = 50;
    if (speedScores.length > 0 && player.avgResponseTime) {
      const fasterThanPlayer = speedScores.filter(s => s.avgSpeed > player.avgResponseTime).length;
      speedPercentile = (fasterThanPlayer / speedScores.length) * 100;
    }
    
    // Calculate top 10 position (using unique player scores)
    const sortedScores = [...leagueScores].sort((a, b) => b.score - a.score);
    // Count how many unique players have higher scores
    const playersWithHigherScore = sortedScores.filter(s => s.score > player.score).length;
    const playerRank = playersWithHigherScore + 1; // Rank is 1-indexed
    
    // Player is in top 10 if rank <= 10 OR if there are less than 10 total unique players
    const isInTop10 = playerRank <= 10 || sortedScores.length < 10;
    const top10Rank = isInTop10 ? playerRank : null;
    
    // Calculate points needed to reach top 10
    let pointsFromTop10 = null;
    if (!isInTop10 && sortedScores.length >= 10) {
      // There are at least 10 unique players, check what's needed to beat #10
      const top10Score = sortedScores[9].score;
      pointsFromTop10 = Math.max(0, top10Score - player.score + 1);
    }

    // Calculate points needed for daily top 10 (using league-filtered daily scores with unique players)
    let dailyPointsFromTop10 = null;
    let dailyTop10Rank = null;
    let dailyPlayerRank = null;
    const uniqueDailyScores = getUniquePlayerScores(leagueFilteredDailyScores);
    if (uniqueDailyScores.length > 0) {
      const dailySortedScores = [...uniqueDailyScores].sort((a, b) => b.score - a.score);
      const dailyPlayersWithHigherScore = dailySortedScores.filter(s => s.score > player.score).length;
      dailyPlayerRank = dailyPlayersWithHigherScore + 1;
      const dailyIsInTop10 = dailyPlayerRank <= 10 || dailySortedScores.length < 10;

      if (dailyIsInTop10) {
        dailyTop10Rank = dailyPlayerRank;
      }

      if (!dailyIsInTop10 && dailySortedScores.length >= 10) {
        const dailyTop10Score = dailySortedScores[9].score;
        dailyPointsFromTop10 = Math.max(0, dailyTop10Score - player.score + 1);
      }
    }
    
    // DEBUG: Force top 10 rank for testing medal display
    const debugTop10Rank = DEBUG_FORCE_MEDAL && (DEBUG_MEDAL_TYPE === 'global' || DEBUG_MEDAL_TYPE === 'both') 
      ? DEBUG_MEDAL_RANK : top10Rank;
    const debugDailyTop10Rank = DEBUG_FORCE_MEDAL && (DEBUG_MEDAL_TYPE === 'daily' || DEBUG_MEDAL_TYPE === 'both') 
      ? DEBUG_MEDAL_RANK : dailyTop10Rank;
    
    return { 
      scorePercentile, 
      speedPercentile, 
      totalPlayers: DEBUG_FORCE_MEDAL ? Math.max(leagueScores.length, 100) : leagueScores.length,
      playerScore: player.score,
      playerSpeed: player.avgResponseTime,
      avgScore: Math.round(leagueScores.reduce((a, b) => a + b.score, 0) / (leagueScores.length || 1)),
      avgSpeed: speedScores.length > 0 
        ? Math.round(speedScores.reduce((a, b) => a + b.avgSpeed, 0) / speedScores.length) 
        : null,
      top10Rank: debugTop10Rank,
      dailyTop10Rank: debugDailyTop10Rank,
      pointsFromTop10: DEBUG_FORCE_MEDAL ? null : pointsFromTop10,
      dailyPointsFromTop10: DEBUG_FORCE_MEDAL ? null : dailyPointsFromTop10,
      playerRank: DEBUG_FORCE_MEDAL ? DEBUG_MEDAL_RANK : playerRank,
      dailyPlayerRank: DEBUG_FORCE_MEDAL ? DEBUG_MEDAL_RANK : dailyPlayerRank,
      loading: false,
      selectedLeague: selectedLeague,
    };
  }, [state.globalScores, state.dailyScores, state.globalScoresLoading, state.selectedLeague, state.players, winner]);

  const isMultiplayer = state.gameMode === 'multiplayer';
  
  // Check if playing a league (eligible for global leaderboard)
  const isLeagueGame = state.selectedLeague !== null;
  
  // Determine if game ended by completing all rounds (win) or losing all lives (lose)
  const completedAllRounds = state.currentRound > state.settings.totalRounds;
  const lostAllLives = rankedPlayers.some(p => p.lives <= 0);

  // Load all global scores for stats comparison and daily scores for default tab
  useEffect(() => {
    actions.loadGlobalScores(null);
    actions.loadDailyScores(null);
  }, []);

  // Award medals when player reaches top 10 (only for league games)
  useEffect(() => {
    // Only award medals if we're playing a league game
    if (!state.selectedLeague) return;
    
    const shouldAwardGlobal = DEBUG_FORCE_MEDAL && (DEBUG_MEDAL_TYPE === 'global' || DEBUG_MEDAL_TYPE === 'both');
    const actualRank = shouldAwardGlobal ? DEBUG_MEDAL_RANK : playerStats.top10Rank;
    
    if (actualRank && actualRank <= 10) {
      const medalData = {
        type: 'top10',
        league: state.selectedLeague,
        rank: actualRank,
        date: new Date().toISOString(),
        score: playerStats.playerScore || 1000,
        isDaily: false
      };
      actions.awardMedal(medalData);
    }
  }, [playerStats.top10Rank, state.selectedLeague, playerStats.playerScore]);

  useEffect(() => {
    // Only award medals if we're playing a league game
    if (!state.selectedLeague) return;
    
    const shouldAwardDaily = DEBUG_FORCE_MEDAL && (DEBUG_MEDAL_TYPE === 'daily' || DEBUG_MEDAL_TYPE === 'both');
    const actualRank = shouldAwardDaily ? DEBUG_MEDAL_RANK : playerStats.dailyTop10Rank;
    
    if (actualRank && actualRank <= 10) {
      const medalData = {
        type: 'dailyTop10',
        league: state.selectedLeague,
        rank: actualRank,
        date: new Date().toISOString(),
        score: playerStats.playerScore || 1000,
        isDaily: true
      };
      actions.awardMedal(medalData);
    }
  }, [playerStats.dailyTop10Rank, state.selectedLeague, playerStats.playerScore]);

  // Save scores once (local + global if enabled)
  useEffect(() => {
    if (!scoresSaved.current) {
      scoresSaved.current = true;
      state.players.forEach(player => {
        // Save to local storage
        actions.saveScore({
          name: player.name,
          score: player.score,
          date: new Date().toISOString(),
          mode: state.gameMode
        });
        
        // Submit to global leaderboard (if sharing is enabled AND playing a league)
        if (state.settings.shareGlobally && state.selectedLeague) {
          // Calculate game duration
          const gameDuration = state.gameMetadata?.endTime && state.gameMetadata?.startTime
            ? state.gameMetadata.endTime - state.gameMetadata.startTime
            : null;
          
          actions.submitToGlobalLeaderboard({
            // Core score data
            name: player.name,
            icon: player.icon || '🎮',
            score: player.score,
            accuracy: player.correctAnswers + player.wrongAnswers > 0
              ? Math.round((player.correctAnswers / (player.correctAnswers + player.wrongAnswers)) * 100)
              : 0,
            avgSpeed: player.avgResponseTime ? Math.round(player.avgResponseTime) : null,
            league: state.selectedLeague,
            // Game metadata
            gameId: state.gameMetadata?.gameId || null,
            gameDuration: gameDuration,
            playerCount: state.players.length,
            livesLost: state.gameMetadata?.totalLivesLost || 0,
            totalRounds: state.settings.totalRounds,
            bonusRoundsPlayed: state.bonusRound?.lastBonusType ? 1 : 0, // Simplified tracking
            correctAnswers: player.correctAnswers,
            wrongAnswers: player.wrongAnswers,
            bestStreak: player.streak,
            gameMode: state.gameMode,
          });
        }
      });
      
      // Note: Global scores are already loaded in a separate useEffect
    }
  }, []);

  // Subtle celebration confetti for winner (only if completed all rounds, not game over)
  useEffect(() => {
    if (!confettiFired.current && completedAllRounds) {
      confettiFired.current = true;
      play('gameOver');
      
      // Subtle celebration - just a few bursts
      const colors = ['#FFCB05', '#FF6B9D', '#3B4CCA'];

      // Initial burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors,
        gravity: 1.2,
      });

      // Side bursts after a delay
      setTimeout(() => {
        confetti({
          particleCount: 20,
          angle: 60,
          spread: 40,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 20,
          angle: 120,
          spread: 40,
          origin: { x: 1, y: 0.6 },
          colors,
        });
      }, 300);
    }
  }, [completedAllRounds, play]);

  const handlePlayAgain = () => {
    play('start');
    actions.playAgain();
  };

  const handleMainMenu = () => {
    play('select');
    actions.resetGame();
  };

  const getMedalIcon = (index) => {
    switch(index) {
      case 0: return faCrown;
      case 1: return faMedal;
      case 2: return faMedal;
      default: return faStar;
    }
  };

  const getMedalClass = (index) => {
    switch(index) {
      case 0: return 'gold';
      case 1: return 'silver';
      case 2: return 'bronze';
      default: return '';
    }
  };

  return (
    <motion.div
      className="gameover-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="gameover-content"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        {/* Title */}
        <motion.div 
          className="gameover-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FontAwesomeIcon 
            icon={completedAllRounds ? faTrophy : faHeartBroken} 
            className={completedAllRounds ? "trophy-icon" : "gameover-icon"} 
          />
          <h1>{lostAllLives ? 'Game Over!' : 'Final Score!'}</h1>
          {isMultiplayer && (
            <p className="winner-text">
              <FontAwesomeIcon icon={faCrown} /> {winner.name} Wins!
            </p>
          )}
        </motion.div>

        {/* Scoreboard */}
        <motion.div 
          className="final-scoreboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {rankedPlayers.map((player, index) => (
            <motion.div 
              key={player.id}
              className={`player-card ${getMedalClass(index)} ${player.lives === 0 ? 'eliminated' : ''}`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.15 }}
            >
              {/* Rank badge - top left (only for multiplayer) */}
              {rankedPlayers.length > 1 && (
                <div className="card-rank-badge">
                  <FontAwesomeIcon 
                    icon={getMedalIcon(index)} 
                    className={`rank-icon ${getMedalClass(index)}`}
                  />
                  <span>#{index + 1}</span>
                </div>
              )}

              {/* Share button - top right */}
              <button 
                className="card-share-btn"
                onClick={() => {
                  play('select');
                  setSharePlayer(player);
                  setShowShareModal(true);
                }}
                title="Share score"
              >
                <FontAwesomeIcon icon={faShareAlt} />
              </button>

              {/* Player name tab */}
              <div className="card-name-tab">
                <span className="card-icon">{player.icon || '🎮'}</span>
                <span>{player.name}</span>
              </div>

              {/* Big centered score */}
              <div className="card-score">{player.score}</div>
              <div className="card-score-label">POINTS</div>

              {/* Stats row */}
              <div className="card-stats">
                <span className="card-stat correct">✓ {player.correctAnswers} correct</span>
                <span className="card-stat wrong">✗ {player.wrongAnswers} wrong</span>
                <span className="card-stat accuracy">
                  {player.correctAnswers + player.wrongAnswers > 0 
                    ? Math.round((player.correctAnswers / (player.correctAnswers + player.wrongAnswers)) * 100)
                    : 0}% accuracy
                </span>
                {player.avgResponseTime !== null && (
                  <span className="card-stat speed">⚡ {(player.avgResponseTime / 1000).toFixed(1)}s avg</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>


        {/* Top 10 Feedback */}
        {isLeagueGame && !playerStats.loading && playerStats.totalPlayers > 0 && (
          <motion.div 
            className="top10-feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            {playerStats.top10Rank ? (
              <div className="top10-success">
                <div className="medal-earned-celebration">
                  <motion.div 
                    className="medal-earned-visual"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                  >
                    <div className="medal-glow"></div>
                    <div className="medal-badge">
                      {state.selectedLeague && badgeImages[state.selectedLeague] && (
                        <img 
                          src={badgeImages[state.selectedLeague]} 
                          alt={LEAGUES[state.selectedLeague]?.name} 
                          className="medal-league-badge"
                        />
                      )}
                    </div>
                    <div className="medal-rank-ribbon">
                      <span>#{scoreTab === 'daily' ? (playerStats.dailyTop10Rank || playerStats.top10Rank) : playerStats.top10Rank}</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="medal-earned-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="medal-earned-title">🎖️ BADGE EARNED! 🎖️</span>
                    <span className="medal-earned-type">
                      {scoreTab === 'daily' ? '☀️ Daily Champion' : '🌟 Global Legend'}
                    </span>
                    <span className="medal-earned-hint">
                      View in your Trophy Cabinet from the main menu
                    </span>
                  </motion.div>
                </div>
                <div className="top10-message">
                  <strong>Congratulations, {winner.name}!</strong>
                  <p>You've earned your place in <span className={scoreTab === 'daily' ? 'todays-highlight' : 'alltime-highlight'}>{scoreTab === 'daily' ? 'today\'s' : 'the all-time'}</span> Hall of Fame for the <span className="league-highlight">{LEAGUES[state.selectedLeague]?.name}</span>! Ranked #{scoreTab === 'daily' ? (playerStats.dailyTop10Rank || playerStats.top10Rank) : playerStats.top10Rank} out of {playerStats.totalPlayers} trainers. Your dedication has been recognized by the Pokémon League!</p>
                </div>
              </div>
            ) : playerStats.pointsFromTop10 !== null ? (
              <div className="top10-encouragement">
                {state.selectedLeague && badgeImages[state.selectedLeague] ? (
                  <img 
                    src={badgeImages[state.selectedLeague]} 
                    alt={LEAGUES[state.selectedLeague]?.name} 
                    className="top10-icon badge-icon" 
                  />
                ) : (
                  <span className="top10-icon">🔥</span>
                )}
                <div className="top10-message">
                  <strong>Keep Training, {winner.name}!</strong>
                  <p>You're just <span className="points-highlight">{
                    scoreTab === 'daily'
                      ? (playerStats.dailyPointsFromTop10 || playerStats.pointsFromTop10)
                      : playerStats.pointsFromTop10
                  }</span> points away from entering <span className={scoreTab === 'daily' ? 'todays-highlight' : 'alltime-highlight'}>{scoreTab === 'daily' ? 'today\'s' : 'the all-time'}</span> Top 10 for the <span className="league-highlight">{LEAGUES[state.selectedLeague]?.name}</span>{(scoreTab === 'daily' ? playerStats.dailyPlayerRank : playerStats.playerRank) && ` (#${scoreTab === 'daily' ? playerStats.dailyPlayerRank : playerStats.playerRank})`}! Like a Pokémon evolving, you're getting stronger with each battle. Train harder and <span className="very-best-highlight">you'll be the very best!</span></p>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* High Scores with Tabs */}
        <motion.div 
          className="highscores-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="highscores-header">
            <h3><FontAwesomeIcon icon={faTrophy} /> Leaderboard</h3>
            <div className="score-tabs">
              <button
                className={`score-tab ${scoreTab === 'daily' ? 'active' : ''}`}
                onClick={() => { setScoreTab('daily'); actions.loadDailyScores(null); }}
              >
                <FontAwesomeIcon icon={faCalendarAlt} /> Daily
              </button>
              <button
                className={`score-tab ${scoreTab === 'global' ? 'active' : ''}`}
                onClick={() => setScoreTab('global')}
              >
                <FontAwesomeIcon icon={faGlobe} /> Global
              </button>
              <button
                className={`score-tab ${scoreTab === 'local' ? 'active' : ''}`}
                onClick={() => setScoreTab('local')}
              >
                <FontAwesomeIcon icon={faHome} /> Local
              </button>
              <button
                className={`score-tab ${scoreTab === 'stats' ? 'active' : ''}`}
                onClick={() => { setScoreTab('stats'); actions.loadGlobalScores(null); }}
              >
                <FontAwesomeIcon icon={faChartLine} /> Stats
              </button>
            </div>
          </div>

          {scoreTab === 'daily' && (
            <div className="daily-date-display">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{(() => {
                try {
                  return new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'Europe/Berlin'
                  });
                } catch (e) {
                  console.error('Date formatting error:', e);
                  return 'December 28, 2025'; // fallback
                }
              })()}</span>
            </div>
          )}

          {(scoreTab === 'global' || scoreTab === 'daily') && (
            <div className="league-filter-tabs">
              {Object.keys(LEAGUES).map(leagueId => (
                <button
                  key={leagueId}
                  className={`league-filter-tab ${leagueFilter === leagueId ? 'active' : ''}`}
                  onClick={() => {
                    setLeagueFilter(leagueId);
                    if (scoreTab === 'global') {
                      actions.loadGlobalScores(leagueId);
                    } else {
                      actions.loadDailyScores(leagueId);
                    }
                  }}
                  title={LEAGUES[leagueId].name}
                >
                  <img src={badgeImages[leagueId]} alt={LEAGUES[leagueId].badge} className="filter-badge" />
                </button>
              ))}
            </div>
          )}
          
          <div className="highscores-list">
            {scoreTab === 'stats' ? (
              <div className="stats-comparison">
                {playerStats.loading ? (
                  <div className="loading-scores">Loading stats...</div>
                ) : playerStats.totalPlayers > 0 ? (
                  <>
                    <div className="stats-intro">
                      <span className="stats-count">
                        Compared to <strong>{playerStats.totalPlayers}</strong> players globally
                      </span>
                    </div>
                    <div className="bell-curves">
                      <BellCurve 
                        percentile={playerStats.scorePercentile}
                        label="Score"
                        color="#FFCB05"
                      />
                      {playerStats.playerSpeed && (
                        <BellCurve 
                          percentile={playerStats.speedPercentile}
                          label="Speed"
                          color="#60a5fa"
                        />
                      )}
                    </div>
                    <div className="stats-details">
                      <div className="stat-compare">
                        <span className="compare-label">Your Score</span>
                        <span className="compare-value yours">{playerStats.playerScore}</span>
                        <span className="compare-vs">vs</span>
                        <span className="compare-value avg">{playerStats.avgScore} avg</span>
                      </div>
                      {playerStats.avgSpeed && playerStats.playerSpeed && (
                        <div className="stat-compare">
                          <span className="compare-label">Your Speed</span>
                          <span className="compare-value yours">{(playerStats.playerSpeed / 1000).toFixed(2)}s</span>
                          <span className="compare-vs">vs</span>
                          <span className="compare-value avg">{(playerStats.avgSpeed / 1000).toFixed(2)}s avg</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-stats-yet">
                    <p>No global data to compare yet.</p>
                    <p className="your-score-preview">Your score: <strong>{playerStats.playerScore}</strong></p>
                    {playerStats.playerSpeed && (
                      <p className="your-score-preview">Your speed: <strong>{(playerStats.playerSpeed / 1000).toFixed(2)}s</strong></p>
                    )}
                  </div>
                )}
              </div>
            ) : scoreTab === 'daily' ? (
              state.dailyScoresLoading ? (
                <div className="loading-scores">Loading today's scores...</div>
              ) : state.dailyScores.length > 0 ? (
                getUniquePlayerScores(state.dailyScores).slice(0, 10).map((entry, index) => (
                  <div key={index} className={`highscore-entry ${index < 3 ? getMedalClass(index) : ''}`} title={
                    entry.timestamp || entry.date || entry.createdAt ?
                      `Submitted: ${new Date((entry.timestamp || entry.date || entry.createdAt)).toLocaleString('en-US', { timeZone: 'Europe/Berlin' })}` :
                      'No submission date available'
                  }>
                    <span className="hs-rank">#{index + 1}</span>
                    {entry.league && badgeImages[entry.league] && (
                      <img src={badgeImages[entry.league]} alt="" className="score-badge" />
                    )}
                    <span className="hs-name">
                      {entry.icon && <span className="hs-icon">{entry.icon}</span>}
                      {entry.name}
                    </span>
                    <span className="hs-score">{entry.score}</span>
                    {entry.accuracy !== undefined && (
                      <span className="hs-accuracy">{entry.accuracy}%</span>
                    )}
                    {entry.avgSpeed && (
                      <span className="hs-speed">{(entry.avgSpeed / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-scores">No scores today yet!</div>
              )
            ) : scoreTab === 'global' ? (
              state.globalScoresLoading ? (
                <div className="loading-scores">Loading...</div>
              ) : state.globalScores.length > 0 ? (
                getUniquePlayerScores(state.globalScores).slice(0, 10).map((entry, index) => (
                  <div key={index} className={`highscore-entry ${index < 3 ? getMedalClass(index) : ''}`} title={
                    entry.timestamp || entry.date || entry.createdAt ?
                      `Submitted: ${new Date((entry.timestamp || entry.date || entry.createdAt)).toLocaleString('en-US', { timeZone: 'Europe/Berlin' })}` :
                      'No submission date available'
                  }>
                    <span className="hs-rank">#{index + 1}</span>
                    {entry.league && badgeImages[entry.league] && (
                      <img src={badgeImages[entry.league]} alt="" className="score-badge" />
                    )}
                    <span className="hs-name">
                      {entry.icon && <span className="hs-icon">{entry.icon}</span>}
                      {entry.name}
                    </span>
                    <span className="hs-score">{entry.score}</span>
                    {entry.accuracy !== undefined && (
                      <span className="hs-accuracy">{entry.accuracy}%</span>
                    )}
                    {entry.avgSpeed && (
                      <span className="hs-speed">{(entry.avgSpeed / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-scores">No scores yet!</div>
              )
            ) : (
              state.highScores.length > 0 ? (
                getUniquePlayerScores(state.highScores).slice(0, 10).map((entry, index) => (
                  <div key={index} className={`highscore-entry ${index < 3 ? getMedalClass(index) : ''}`} title={
                    entry.date ?
                      `Submitted: ${new Date(entry.date).toLocaleString('en-US', { timeZone: 'Europe/Berlin' })}` :
                      'No submission date available'
                  }>
                    <span className="hs-rank">#{index + 1}</span>
                    <span className="hs-name">{entry.name}</span>
                    <span className="hs-score">{entry.score}</span>
                  </div>
                ))
              ) : (
                <div className="no-scores">No local scores yet!</div>
              )
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="gameover-actions"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            className="action-btn share"
            onClick={() => { play('select'); setSharePlayer(winner); setShowShareModal(true); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faShareAlt} /> Share
          </motion.button>
          <motion.button
            className="action-btn primary"
            onClick={handlePlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faRedo} /> Play Again
          </motion.button>
          <motion.button
            className="action-btn secondary"
            onClick={handleMainMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faHome} /> Main Menu
          </motion.button>
        </motion.div>
        
        {!isLeagueGame && state.settings.shareGlobally && (
          <motion.p 
            className="custom-settings-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Unranked game — not on global leaderboard
          </motion.p>
        )}

        {/* Support Section */}
        <motion.div 
          className="support-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <span>Enjoying the game? Consider supporting the development :)</span>
          <div className="support-buttons">
            <a 
              href="https://buymeacoffee.com/favstats" 
              target="_blank" 
              rel="noopener noreferrer"
              className="support-btn coffee"
            >
              <FontAwesomeIcon icon={faCoffee} /> Coffee
            </a>
            <a 
              href="https://paypal.me/favstats" 
              target="_blank" 
              rel="noopener noreferrer"
              className="support-btn paypal"
            >
              <FontAwesomeIcon icon={faPaypal} /> PayPal
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => { setShowShareModal(false); setSharePlayer(null); }}
        playerData={{
          name: (sharePlayer || winner).name,
          icon: (sharePlayer || winner).icon,
          score: (sharePlayer || winner).score,
          accuracy: (sharePlayer || winner).correctAnswers + (sharePlayer || winner).wrongAnswers > 0
            ? Math.round(((sharePlayer || winner).correctAnswers / ((sharePlayer || winner).correctAnswers + (sharePlayer || winner).wrongAnswers)) * 100)
            : 0,
          avgSpeed: (sharePlayer || winner).avgResponseTime,
          correctAnswers: (sharePlayer || winner).correctAnswers,
          wrongAnswers: (sharePlayer || winner).wrongAnswers,
          streak: (sharePlayer || winner).streak,
        }}
        gameData={{
          league: state.selectedLeague,
          gameMode: state.gameMode,
          totalRounds: state.settings.totalRounds,
        }}
      />
    </motion.div>
  );
}

export default GameOver;

