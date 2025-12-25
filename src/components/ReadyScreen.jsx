import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faHeart, faStar } from '@fortawesome/free-solid-svg-icons';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import './ReadyScreen.css';

function ReadyScreen() {
  const { state, actions } = useGame();
  const { play } = useSound();
  
  const currentPlayer = state.players[state.currentPlayerIndex];

  // Play sound and auto-continue after delay
  useEffect(() => {
    play('select');
    
    const timer = setTimeout(() => {
      actions.startPlaying();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [actions, play]);

  if (!currentPlayer) return null;

  return (
    <motion.div 
      className="ready-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ready-content"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
      >
        <motion.div
          className="ready-icon"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FontAwesomeIcon icon={faGamepad} />
        </motion.div>
        
        <motion.div
          className="ready-label"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          GET READY
        </motion.div>
        
        <motion.div
          className="ready-player-name"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, delay: 0.4 }}
        >
          {currentPlayer.name}
        </motion.div>
        
        <motion.div
          className="ready-stats"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="ready-stat">
            <FontAwesomeIcon icon={faStar} />
            <span>{currentPlayer.score} pts</span>
          </div>
          <div className="ready-stat">
            <FontAwesomeIcon icon={faHeart} />
            <span>{currentPlayer.lives} {currentPlayer.lives === 1 ? 'life' : 'lives'}</span>
          </div>
        </motion.div>
        
        <motion.div
          className="ready-round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Round {state.currentRound} of {state.settings.totalRounds}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ReadyScreen;

