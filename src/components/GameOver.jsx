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
  faHeartBroken
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
  const [scoreTab, setScoreTab] = useState('global');
  const [leagueFilter, setLeagueFilter] = useState(state.selectedLeague || 'all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePlayer, setSharePlayer] = useState(null); // Which player to share
  
  // Sort players by score
  const rankedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const winner = rankedPlayers[0];
  
  // Calculate percentiles from global scores and top 10 feedback
  const playerStats = useMemo(() => {
    const player = winner; // Use winner (top player) for top 10 calculations
    const scores = state.globalScores;
    
    if (!player) {
      return { scorePercentile: 50, speedPercentile: 50, totalPlayers: 0, loading: false };
    }
    
    if (!scores.length) {
      return { 
        scorePercentile: 50, 
        speedPercentile: 50, 
        totalPlayers: 0, 
        loading: state.globalScoresLoading,
        playerScore: player.score,
        playerSpeed: player.avgResponseTime,
        top10Rank: null,
        pointsFromTop10: null,
      };
    }
    
    // Use all scores - we compare against everyone
    const leagueScores = scores;
    
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
    
    // Calculate top 10 position
    const sortedScores = [...leagueScores].sort((a, b) => b.score - a.score);
    // Count how many players have higher scores (player's score might not be in list yet)
    const playersWithHigherScore = sortedScores.filter(s => s.score > player.score).length;
    const playerRank = playersWithHigherScore + 1; // Rank is 1-indexed
    
    // Player is in top 10 if rank <= 10 OR if there are less than 10 total scores
    const isInTop10 = playerRank <= 10 || sortedScores.length < 10;
    const top10Rank = isInTop10 ? playerRank : null;
    
    // Calculate points needed to reach top 10
    let pointsFromTop10 = null;
    if (!isInTop10 && sortedScores.length >= 10) {
      // There are at least 10 scores, check what's needed to beat #10
      const top10Score = sortedScores[9].score;
      pointsFromTop10 = Math.max(0, top10Score - player.score + 1);
    }
    
    return { 
      scorePercentile, 
      speedPercentile, 
      totalPlayers: leagueScores.length,
      playerScore: player.score,
      playerSpeed: player.avgResponseTime,
      avgScore: Math.round(leagueScores.reduce((a, b) => a + b.score, 0) / leagueScores.length),
      avgSpeed: speedScores.length > 0 
        ? Math.round(speedScores.reduce((a, b) => a + b.avgSpeed, 0) / speedScores.length) 
        : null,
      top10Rank,
      pointsFromTop10,
      playerRank, // Include player rank for display
      loading: false,
    };
  }, [state.globalScores, state.globalScoresLoading, state.players, winner]);

  const isMultiplayer = state.gameMode === 'multiplayer';
  
  // Check if playing a league (eligible for global leaderboard)
  const isLeagueGame = state.selectedLeague !== null;
  
  // Determine if game ended by completing all rounds (win) or losing all lives (lose)
  const completedAllRounds = state.currentRound > state.settings.totalRounds;
  const lostAllLives = rankedPlayers.some(p => p.lives <= 0);

  // Load all global scores for stats comparison
  useEffect(() => {
    actions.loadGlobalScores(null);
  }, []);

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

        {/* Stats Summary */}
        <motion.div 
          className="game-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="stat-box">
            <span className="stat-value">{state.currentRound}</span>
            <span className="stat-label">Rounds Played</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">
              {rankedPlayers.reduce((sum, p) => sum + p.correctAnswers, 0)}
            </span>
            <span className="stat-label">Total Correct</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">
              {Math.round(
                (rankedPlayers.reduce((sum, p) => sum + p.correctAnswers, 0) / 
                (rankedPlayers.reduce((sum, p) => sum + p.correctAnswers + p.wrongAnswers, 0) || 1)) * 100
              )}%
            </span>
            <span className="stat-label">Accuracy</span>
          </div>
          {(() => {
            const allFastest = rankedPlayers
              .filter(p => p.fastestResponse !== null)
              .map(p => p.fastestResponse);
            const fastest = allFastest.length > 0 ? Math.min(...allFastest) : null;
            return fastest !== null ? (
              <div className="stat-box fastest-stat">
                <span className="stat-value">{(fastest / 1000).toFixed(2)}s</span>
                <span className="stat-label">Fastest Click</span>
              </div>
            ) : null;
          })()}
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
                <span className="top10-icon">🏆</span>
                <div className="top10-message">
                  <strong>Congratulations, {winner.name}!</strong>
                  <p>You've earned your place in the Hall of Fame for the <span className="league-highlight">{LEAGUES[state.selectedLeague]?.name}</span>! Ranked #{playerStats.top10Rank} out of {playerStats.totalPlayers} trainers. Your dedication has been recognized by the Pokémon League!</p>
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
                  <p>You're just <span className="points-highlight">{playerStats.pointsFromTop10}</span> points away from entering the Top 10 for the <span className="league-highlight">{LEAGUES[state.selectedLeague]?.name}</span>{playerStats.playerRank && ` (#${playerStats.playerRank})`}! Like a Pokémon evolving, you're getting stronger with each battle. Train harder and <span className="very-best-highlight">you'll be the very best!</span></p>
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
                className={`score-tab ${scoreTab === 'global' ? 'active' : ''}`}
                onClick={() => setScoreTab('global')}
              >
                Global
              </button>
              <button 
                className={`score-tab ${scoreTab === 'local' ? 'active' : ''}`}
                onClick={() => setScoreTab('local')}
              >
                Local
              </button>
              <button 
                className={`score-tab ${scoreTab === 'stats' ? 'active' : ''}`}
                onClick={() => { setScoreTab('stats'); actions.loadGlobalScores(null); }}
              >
                <FontAwesomeIcon icon={faChartLine} /> Stats
              </button>
            </div>
          </div>
          
          {scoreTab === 'global' && (
            <div className="league-filter-tabs">
              <button 
                className={`league-filter-tab ${leagueFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setLeagueFilter('all'); actions.loadGlobalScores(null); }}
              >
                All
              </button>
              {Object.keys(LEAGUES).map(leagueId => (
                <button 
                  key={leagueId}
                  className={`league-filter-tab ${leagueFilter === leagueId ? 'active' : ''}`}
                  onClick={() => { setLeagueFilter(leagueId); actions.loadGlobalScores(leagueId); }}
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
            ) : scoreTab === 'global' ? (
              state.globalScoresLoading ? (
                <div className="loading-scores">Loading...</div>
              ) : state.globalScores.length > 0 ? (
                state.globalScores.slice(0, 10).map((entry, index) => (
                  <div key={index} className={`highscore-entry ${index < 3 ? getMedalClass(index) : ''}`}>
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
                state.highScores.slice(0, 10).map((entry, index) => (
                  <div key={index} className={`highscore-entry ${index < 3 ? getMedalClass(index) : ''}`}>
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

