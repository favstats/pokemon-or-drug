import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faStar,
  faVolumeUp,
  faVolumeMute,
  faCheck,
  faTimes,
  faGift,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import { fetchPokemonDetails } from '../data/pokemonService';
import './BonusRound.css';

function BonusRound() {
  const { state, actions } = useGame();
  const { play, isMuted, toggleMute } = useSound();
  const [timer, setTimer] = useState(20); // Bonus rounds get more time
  const [pokemonImage, setPokemonImage] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showIntro, setShowIntro] = useState(true);
  const timedOutRef = useRef(false);
  const revealSoundPlayed = useRef(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const bonusData = state.bonusRound.data;
  const bonusType = state.bonusRound.type;

  // Play intro sound and hide intro after delay
  useEffect(() => {
    if (state.gameStatus === 'bonus' && showIntro) {
      play('bonus');
      const introTimer = setTimeout(() => {
        setShowIntro(false);
      }, 2000);
      return () => clearTimeout(introTimer);
    }
  }, [state.gameStatus, showIntro, play]);

  // Play sound on reveal
  useEffect(() => {
    if (state.gameStatus === 'bonusReveal' && !revealSoundPlayed.current && state.bonusResult) {
      revealSoundPlayed.current = true;
      const result = state.bonusResult;
      if (result.isCorrect) {
        play('correct');
      } else if (result.isPartial) {
        play('select'); // Neutral sound for partial
      } else {
        play('wrong');
      }
    } else if (state.gameStatus === 'bonus') {
      revealSoundPlayed.current = false;
    }
  }, [state.gameStatus, state.bonusResult, play]);

  // Reset state when bonus round starts
  useEffect(() => {
    if (state.gameStatus === 'bonus' && bonusData) {
      setTimer(20);
      setSelectedItems(new Set());
      setPokemonImage(null);
      timedOutRef.current = false;
      setShowIntro(true);
      
      // Load Pokemon image for 'namePokemon' type
      if (bonusType === 'namePokemon' && bonusData.pokemonName) {
        const pokemonName = bonusData.pokemonName.toLowerCase().replace(/ /g, '-');
        fetchPokemonDetails(pokemonName)
          .then(details => {
            if (details && details.sprite) {
              setPokemonImage(details.sprite);
            }
          })
          .catch(err => {
            console.warn('Could not load Pokemon image:', err.message);
          });
      }
    }
  }, [state.gameStatus, bonusData?.type, bonusType]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (!timedOutRef.current && !showIntro) {
      timedOutRef.current = true;
      play('wrong');
      const timeTaken = Date.now() - (state.questionStartTime || Date.now());
      
      // Submit empty/timeout answer based on type
      if (bonusType === 'selectAll') {
        actions.submitBonusAnswer([], timeTaken);
      } else {
        actions.submitBonusAnswer('timeout', timeTaken);
      }
    }
  }, [actions, state.questionStartTime, play, bonusType, showIntro]);

  // Timer countdown
  useEffect(() => {
    if (state.gameStatus !== 'bonus' || !bonusData || showIntro) return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setTimeout(handleTimeout, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.gameStatus, bonusData, handleTimeout, showIntro]);

  // Handle single-select answer (oddOneOut, namePokemon)
  const handleSingleSelect = (itemName) => {
    if (state.gameStatus !== 'bonus' || showIntro) return;
    
    play('select');
    const timeTaken = Date.now() - (state.questionStartTime || Date.now());
    actions.submitBonusAnswer(itemName, timeTaken);
  };

  // Handle multi-select toggle (selectAll)
  const handleMultiToggle = (itemName) => {
    if (state.gameStatus !== 'bonus' || showIntro) return;
    
    play('select');
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  // Submit multi-select answer
  const handleSubmitMultiSelect = () => {
    if (state.gameStatus !== 'bonus' || showIntro) return;
    
    const timeTaken = Date.now() - (state.questionStartTime || Date.now());
    const selectedArray = Array.from(selectedItems);
    
    if (selectedArray.length === 0) {
      play('wrong');
    } else {
      play('select');
    }
    
    actions.submitBonusAnswer(selectedArray, timeTaken);
  };

  // Continue to next round after reveal
  const handleContinue = () => {
    play('select');
    actions.endBonusRound();
  };

  const getTimerColor = () => {
    if (timer > 10) return 'var(--success-green)';
    if (timer > 5) return 'var(--pokemon-yellow)';
    return 'var(--danger-red)';
  };

  const getBonusTypeName = () => {
    switch (bonusType) {
      case 'oddOneOut': return 'Find the Odd One Out!';
      case 'selectAll': return 'Select All That Apply!';
      case 'namePokemon': return 'Name That Pokémon!';
      default: return 'Bonus Round!';
    }
  };

  if (!currentPlayer || !bonusData) return null;

  // Show intro animation
  if (showIntro && state.gameStatus === 'bonus') {
    return (
      <div className="bonus-round bonus-intro">
        <motion.div
          className="bonus-intro-content"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <motion.div 
            className="player-ready-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="ready-label">GET READY</span>
            <span className="ready-player-name">
              <span className="ready-icon">{currentPlayer.icon || '🎮'}</span>
              {currentPlayer.name}!
            </span>
          </motion.div>
          <div className="bonus-sparkles">✨</div>
          <FontAwesomeIcon icon={faGift} className="bonus-icon" />
          <h1>BONUS ROUND!</h1>
          <p>{getBonusTypeName()}</p>
          <div className="bonus-multiplier">
            <FontAwesomeIcon icon={faBolt} /> 2x Points!
          </div>
        </motion.div>
      </div>
    );
  }

  // Show reveal screen
  if (state.gameStatus === 'bonusReveal') {
    const result = state.bonusResult;
    const resultClass = result.isCorrect ? 'correct' : result.isPartial ? 'partial' : 'wrong';
    const resultMessage = result.isCorrect ? 'Perfect!' : result.isPartial ? 'Partial!' : 'Not Quite!';
    
    return (
      <div className="bonus-round bonus-reveal">
        <motion.div
          className={`bonus-reveal-content ${resultClass}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <div className="reveal-icon">
            <FontAwesomeIcon icon={result.isCorrect ? faCheck : result.isPartial ? faStar : faTimes} />
          </div>
          <h2>{resultMessage}</h2>
          
          {bonusType === 'oddOneOut' && (
            <p className="reveal-answer">
              The odd one was: <strong>{bonusData.correctAnswer}</strong>
              <span className="answer-type">({bonusData.targetType})</span>
            </p>
          )}
          
          {bonusType === 'selectAll' && (
            <div className="reveal-list">
              <p>Correct answers:</p>
              <div className="answer-chips">
                {bonusData.correctAnswers.map(name => (
                  <span key={name} className="answer-chip">{name}</span>
                ))}
              </div>
            </div>
          )}
          
          {bonusType === 'namePokemon' && (
            <div className="reveal-pokemon">
              {pokemonImage && (
                <img src={pokemonImage} alt={bonusData.pokemonName} className="pokemon-reveal-img" />
              )}
              <p>It was: <strong>{bonusData.correctAnswer}</strong></p>
            </div>
          )}
          
          <div className="points-earned">
            {result.points > 0 ? `+${result.points}` : result.points} points
          </div>
          
          <motion.button
            className="continue-btn"
            onClick={handleContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Main bonus round gameplay
  return (
    <div className="bonus-round">
      <button 
        className="mute-toggle-game" 
        onClick={toggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
      </button>

      {/* Header */}
      <motion.header 
        className="bonus-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="bonus-badge">
          <FontAwesomeIcon icon={faGift} />
          <span>BONUS</span>
        </div>

        <div className="current-player">
          <span className="turn-label">Playing:</span>
          <span className="player-turn">
            <span className="player-icon">{currentPlayer.icon || '🎮'}</span>
            {currentPlayer.name}
          </span>
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
          </div>
        </div>

        <div className="multiplier-badge">
          <FontAwesomeIcon icon={faBolt} />
          <span>2x</span>
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
              strokeDashoffset: 283 - (283 * timer) / 20,
              stroke: getTimerColor(),
            }}
          />
        </svg>
        <span className="timer-text" style={{ color: getTimerColor() }}>
          {timer}
        </span>
      </motion.div>

      {/* Prompt */}
      <motion.div
        className="bonus-prompt"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2>{bonusData.prompt}</h2>
      </motion.div>

      {/* Bonus Type Specific Content */}
      <AnimatePresence mode="wait">
        {bonusType === 'oddOneOut' && (
          <motion.div
            className="bonus-grid odd-one-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {bonusData.items.map((item, index) => (
              <motion.button
                key={item.name}
                className="bonus-card"
                onClick={() => handleSingleSelect(item.name)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="card-name">{item.name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {bonusType === 'selectAll' && (
          <motion.div
            className="bonus-select-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bonus-grid select-all-grid">
              {bonusData.items.map((item, index) => (
                <motion.button
                  key={item.name}
                  className={`bonus-card selectable ${selectedItems.has(item.name) ? 'selected' : ''}`}
                  onClick={() => handleMultiToggle(item.name)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                >
                  <span className="card-name">{item.name}</span>
                  {selectedItems.has(item.name) && (
                    <div className="check-mark">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            <motion.button
              className="submit-selection-btn"
              onClick={handleSubmitMultiSelect}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              disabled={selectedItems.size === 0}
            >
              Submit ({selectedItems.size} selected)
            </motion.button>
          </motion.div>
        )}

        {bonusType === 'namePokemon' && (
          <motion.div
            className="bonus-name-pokemon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="pokemon-display">
              {pokemonImage ? (
                <motion.img
                  src={pokemonImage}
                  alt="Mystery Pokemon"
                  className="pokemon-image"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                />
              ) : (
                <div className="pokemon-loading">
                  <span>Loading...</span>
                </div>
              )}
            </div>
            <div className="name-options">
              {bonusData.options.map((option, index) => (
                <motion.button
                  key={option.name}
                  className="name-option-btn"
                  onClick={() => handleSingleSelect(option.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {option.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BonusRound;

