import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faFire, 
  faBolt, 
  faForward,
  faCapsules,
  faStar,
  faVolumeUp,
  faVolumeMute,
  faStopwatch
} from '@fortawesome/free-solid-svg-icons';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import { fetchPokemonDetails } from '../data/pokemonService';
import './GameScreen.css';

function GameScreen() {
  const { state, actions } = useGame();
  const { play, isMuted, toggleMute } = useSound();
  const [timer, setTimer] = useState(state.settings.timerDuration);
  const [pokemonImage, setPokemonImage] = useState(null);
  const timedOutRef = useRef(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const question = state.currentQuestion;

  // Reset timer when question changes
  useEffect(() => {
    if (state.gameStatus === 'playing' && question) {
      setTimer(state.settings.timerDuration);
      setPokemonImage(null);
      timedOutRef.current = false;
      
      // Prefetch Pokemon image if it's a Pokemon question
      if (question.type === 'pokemon' && !question.imageUrl) {
        const pokemonName = question.name.toLowerCase().replace(/ /g, '-');
        fetchPokemonDetails(pokemonName)
          .then(details => {
            if (details && details.sprite) {
              setPokemonImage(details.sprite);
              // Store it in the question for reveal
              question.imageUrl = details.sprite;
            }
          })
          .catch(err => {
            console.warn('Could not load Pokemon image:', err.message);
          });
      }
    }
  }, [question?.id, state.gameStatus]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (!timedOutRef.current) {
      timedOutRef.current = true;
      play('wrong');
      const timeTaken = Date.now() - (state.questionStartTime || Date.now());
      actions.submitAnswer('timeout', timeTaken);
    }
  }, [actions, state.questionStartTime, play]);

  // Timer countdown
  useEffect(() => {
    if (state.gameStatus !== 'playing' || !question) return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Schedule the timeout action after render
          setTimeout(handleTimeout, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.gameStatus, question?.id, handleTimeout]);

  const handleAnswer = (answer) => {
    if (state.gameStatus !== 'playing' || !question) return;
    
    const isCorrect = answer === question.type;
    play(isCorrect ? 'correct' : 'wrong');

    // Make sure Pokemon image is stored before submitting
    if (question.type === 'pokemon' && pokemonImage) {
      question.imageUrl = pokemonImage;
    }
    const timeTaken = Date.now() - (state.questionStartTime || Date.now());
    actions.submitAnswer(answer, timeTaken);
  };

  const handleSkip = () => {
    if (state.powerUps.skip > 0) {
      play('powerup');
      actions.skipQuestion();
    }
  };

  const getTimerColor = () => {
    if (timer > 10) return 'var(--success-green)';
    if (timer > 5) return 'var(--pokemon-yellow)';
    return 'var(--danger-red)';
  };

  if (!currentPlayer || !question) return null;

  return (
    <div className="game-screen">
      <button 
        className="mute-toggle-game" 
        onClick={toggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
      </button>

      {/* Header */}
      <motion.header 
        className="game-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="round-info">
          <span className="round-label">Round</span>
          <span className="round-number">{state.currentRound}/{state.settings.totalRounds}</span>
        </div>

        <div className="current-player">
          <div className="player-turn-wrapper">
            <span className="turn-label">Current Turn</span>
            <span className="player-turn">
              <span className="player-icon">{currentPlayer.icon || '🎮'}</span>
              {currentPlayer.name}
            </span>
          </div>
          <div className="player-stats">
            <div className="lives">
              {[...Array(state.settings.livesPerPlayer)].map((_, i) => (
                <FontAwesomeIcon 
                  key={i}
                  icon={faHeart}
                  className={`heart ${i < currentPlayer.lives ? 'active' : 'empty'}`}
                />
              ))}
            </div>
            <div className="score">
              <FontAwesomeIcon icon={faStar} />
              <span>{currentPlayer.score}</span>
            </div>
            {currentPlayer.avgResponseTime !== null && (
              <div className="speed-stat">
                <FontAwesomeIcon icon={faStopwatch} />
                <span>{(currentPlayer.avgResponseTime / 1000).toFixed(1)}s avg</span>
              </div>
            )}
          </div>
        </div>

        <div className="streak-display">
          {currentPlayer.streak > 0 && (
            <motion.div 
              className="streak"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={currentPlayer.streak}
            >
              <FontAwesomeIcon icon={faFire} />
              <span>{currentPlayer.streak}x</span>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Timer */}
      <motion.div 
        className="timer-container"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <svg className="timer-circle" viewBox="0 0 100 100">
          <circle className="timer-bg" cx="50" cy="50" r="45" />
          <circle
            className="timer-progress"
            cx="50"
            cy="50"
            r="45"
            style={{
              strokeDashoffset: 283 - (283 * timer) / state.settings.timerDuration,
              stroke: getTimerColor(),
            }}
          />
        </svg>
        <span className="timer-text" style={{ color: getTimerColor() }}>
          {timer}
        </span>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="question-card"
          key={question.id}
          initial={{ opacity: 0, y: 50, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="question-mark">?</div>
          <h2 className="mystery-name">{question.name}</h2>
        </motion.div>
      </AnimatePresence>

      {/* Answer Buttons */}
      <div className="answer-buttons">
        <motion.button
          className="answer-btn pokemon"
          onClick={() => handleAnswer('pokemon')}
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="btn-emoji">⚡</span>
          <span className="btn-text">Pokémon</span>
        </motion.button>

        <motion.button
          className="answer-btn drug"
          onClick={() => handleAnswer('drug')}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FontAwesomeIcon icon={faCapsules} className="btn-icon" />
          <span className="btn-text">Drug</span>
        </motion.button>
      </div>

      {/* Power-ups */}
      <motion.div 
        className="powerups"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button 
          className={`powerup-btn ${state.powerUps.skip === 0 ? 'disabled' : ''}`}
          onClick={handleSkip}
          disabled={state.powerUps.skip === 0}
        >
          <FontAwesomeIcon icon={faForward} />
          <span>Skip ({state.powerUps.skip})</span>
        </button>
        <button 
          className={`powerup-btn ${state.powerUps.extraLife === 0 ? 'disabled' : ''}`}
          onClick={() => {
            play('powerup');
            actions.usePowerUp('extraLife');
          }}
          disabled={state.powerUps.extraLife === 0}
        >
          <FontAwesomeIcon icon={faBolt} />
          <span>+Life ({state.powerUps.extraLife})</span>
        </button>
      </motion.div>

      {/* Multiplayer scoreboard */}
      {state.gameMode === 'multiplayer' && state.players.length > 1 && (
        <motion.div 
          className="mini-scoreboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {state.players.map((player, index) => (
            <div 
              key={player.id}
              className={`mini-player ${index === state.currentPlayerIndex ? 'active' : ''} ${player.lives === 0 ? 'eliminated' : ''}`}
            >
              <span className="mini-name">
                <span className="mini-icon">{player.icon || '🎮'}</span>
                {player.name}
              </span>
              <span className="mini-score">{player.score}</span>
              {player.avgResponseTime !== null && (
                <span className="mini-speed">{(player.avgResponseTime / 1000).toFixed(1)}s</span>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default GameScreen;
