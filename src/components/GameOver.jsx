import { useEffect, useRef } from 'react';
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
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import './GameOver.css';

function GameOver() {
  const { state, actions } = useGame();
  const { play } = useSound();
  const confettiFired = useRef(false);
  const scoresSaved = useRef(false);

  // Sort players by score
  const rankedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const winner = rankedPlayers[0];
  const isMultiplayer = state.gameMode === 'multiplayer';

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
        
        // Submit to global leaderboard (if sharing is enabled)
        if (state.settings.shareGlobally) {
          actions.submitToGlobalLeaderboard({
            name: player.name,
            score: player.score,
            accuracy: player.correctAnswers + player.wrongAnswers > 0
              ? Math.round((player.correctAnswers / (player.correctAnswers + player.wrongAnswers)) * 100)
              : 0,
            avgSpeed: player.avgResponseTime ? Math.round(player.avgResponseTime) : null,
            mode: state.gameMode,
          });
        }
      });
    }
  }, []);

  // Subtle celebration confetti for winner
  useEffect(() => {
    if (!confettiFired.current) {
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
  }, []);

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
          <FontAwesomeIcon icon={faTrophy} className="trophy-icon" />
          <h1>Game Over!</h1>
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
              className={`player-row ${getMedalClass(index)} ${player.lives === 0 ? 'eliminated' : ''}`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.15 }}
            >
              <div className="rank">
                <FontAwesomeIcon 
                  icon={getMedalIcon(index)} 
                  className={`medal-icon ${getMedalClass(index)}`}
                />
                <span className="rank-number">#{index + 1}</span>
              </div>
              
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <div className="player-stats">
                  <span className="stat correct">
                    <FontAwesomeIcon icon={faCheck} /> {player.correctAnswers}
                  </span>
                  <span className="stat wrong">
                    <FontAwesomeIcon icon={faTimes} /> {player.wrongAnswers}
                  </span>
                  {player.streak > 0 && (
                    <span className="stat streak">
                      <FontAwesomeIcon icon={faFire} /> Best: {player.streak}
                    </span>
                  )}
                  {player.avgResponseTime !== null && (
                    <span className="stat speed">
                      <FontAwesomeIcon icon={faStopwatch} /> {(player.avgResponseTime / 1000).toFixed(2)}s avg
                    </span>
                  )}
                  {player.fastestResponse !== null && (
                    <span className="stat fastest">
                      <FontAwesomeIcon icon={faBolt} /> {(player.fastestResponse / 1000).toFixed(2)}s best
                    </span>
                  )}
                </div>
              </div>
              
              <div className="player-score">
                <FontAwesomeIcon icon={faStar} />
                <span>{player.score}</span>
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

        {/* High Scores Leaderboard */}
        {state.highScores.length > 0 && (
          <motion.div 
            className="highscores-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h3><FontAwesomeIcon icon={faTrophy} /> High Scores</h3>
            <div className="highscores-list">
              {state.highScores.slice(0, 5).map((entry, index) => (
                <div key={index} className={`highscore-entry ${index < 3 ? getMedalClass(index) : ''}`}>
                  <span className="hs-rank">#{index + 1}</span>
                  <span className="hs-name">{entry.name}</span>
                  <span className="hs-score">{entry.score}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="gameover-actions"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
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
      </motion.div>
    </motion.div>
  );
}

export default GameOver;

