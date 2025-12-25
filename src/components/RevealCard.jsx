import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faArrowRight,
  faStar,
  faFire,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import DrugImage from './DrugImage';
import { getDrugLink } from '../data/drugService';
import './RevealCard.css';

function RevealCard() {
  const { state, actions } = useGame();
  const confettiFired = useRef(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const question = state.currentQuestion;
  const isCorrect = state.isCorrect;

  // Fire SUBTLE confetti on correct answer (reduced from before)
  useEffect(() => {
    if (isCorrect && !confettiFired.current) {
      confettiFired.current = true;
      
      // Subtle confetti - much less than before
      const colors = question?.type === 'pokemon' 
        ? ['#FFCB05', '#3B4CCA'] 
        : ['#FF6B9D', '#9B59B6'];
      
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors,
        gravity: 1.2,
        scalar: 0.8,
      });
    }
    
    return () => {
      confettiFired.current = false;
    };
  }, [isCorrect, question?.type]);

  const handleContinue = () => {
    actions.nextRound();
  };

  if (!question) return null;

  // Calculate points earned/lost
  const getPointsDisplay = () => {
    if (!isCorrect) {
      return state.gameMode === 'multiplayer' ? '-50' : '0';
    }
    const basePoints = 100;
    const streakMultiplier = 
      currentPlayer.streak >= 10 ? 3 :
      currentPlayer.streak >= 5 ? 2 :
      currentPlayer.streak >= 3 ? 1.5 : 1;
    return `+${Math.floor(basePoints * streakMultiplier)}`;
  };

  return (
    <motion.div 
      className="reveal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={`reveal-card ${isCorrect ? 'correct' : 'wrong'}`}
        initial={{ scale: 0.5, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ 
          type: 'spring', 
          damping: 15,
          delay: 0.2 
        }}
      >
        {/* Result indicator */}
        <motion.div 
          className={`result-badge ${isCorrect ? 'correct' : 'wrong'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <FontAwesomeIcon icon={isCorrect ? faCheck : faTimes} />
          <span>{isCorrect ? 'Correct!' : 'Nope!'}</span>
        </motion.div>

        {/* Image/Visual reveal */}
        <motion.div 
          className="reveal-image-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {question.type === 'pokemon' ? (
            <div className="pokemon-reveal">
              {question.imageUrl ? (
                <motion.img 
                  src={question.imageUrl} 
                  alt={question.name}
                  className="pokemon-image"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                  }}
                />
              ) : null}
              <div className="pokemon-placeholder" style={{ display: question.imageUrl ? 'none' : 'flex' }}>
                <span className="pokeball-icon">🔴</span>
                <span className="pokemon-label">Pokémon</span>
              </div>
            </div>
          ) : (
            <DrugImage drug={question} />
          )}
        </motion.div>

        {/* Name and type */}
        <motion.div 
          className="reveal-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="reveal-name">{question.name}</h2>
          <p className="reveal-type">
            is a <span className={question.type}>{question.type === 'pokemon' ? 'Pokémon' : 'Drug'}</span>!
          </p>
          
          {/* Drug description */}
          {question.type === 'drug' && question.description && (
            <motion.p 
              className="drug-description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              💊 {question.description}
            </motion.p>
          )}
          
          {/* Drug category badge */}
          {question.type === 'drug' && question.category && (
            <motion.span 
              className="category-badge"
              style={{ backgroundColor: question.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              {question.category}
            </motion.span>
          )}
          
          {/* Drug link */}
          {question.type === 'drug' && (
            <motion.a 
              className="drug-link"
              href={getDrugLink(question.name)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              Learn more about {question.name}
            </motion.a>
          )}
        </motion.div>

        {/* Score info */}
        <motion.div 
          className="score-update"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className={`points ${isCorrect ? 'gain' : 'loss'}`}>
            <FontAwesomeIcon icon={faStar} />
            <span>{getPointsDisplay()}</span>
          </div>
          
          {isCorrect && currentPlayer.streak >= 3 && (
            <div className="streak-bonus">
              <FontAwesomeIcon icon={faFire} />
              <span>{currentPlayer.streak}x Streak!</span>
            </div>
          )}
        </motion.div>

        {/* Player status */}
        <motion.div 
          className="player-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p>
            <strong>{currentPlayer.name}</strong>: {currentPlayer.score} pts | 
            {' '}{Math.max(0, currentPlayer.lives)} {currentPlayer.lives === 1 ? 'life' : 'lives'} left
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          className="continue-btn"
          onClick={handleContinue}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currentPlayer.lives === 0 && state.gameMode === 'single' ? (
            'Game Over'
          ) : state.currentRound >= state.totalRounds ? (
            'See Results'
          ) : (
            <>
              Next <FontAwesomeIcon icon={faArrowRight} />
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default RevealCard;
