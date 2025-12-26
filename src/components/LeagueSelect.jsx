import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faClock, faGift, faChevronLeft, faQuestionCircle, faCog, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useGame, LEAGUES } from '../context/GameContext';
import { useSound } from '../context/SoundContext';

// Import badge SVGs
import BoulderBadge from '../assets/badges/boulder.svg';
import CascadeBadge from '../assets/badges/cascade.svg';
import VolcanoBadge from '../assets/badges/volcano.svg';
import EarthBadge from '../assets/badges/earth.svg';

import './LeagueSelect.css';

const badgeImages = {
  boulder: BoulderBadge,
  cascade: CascadeBadge,
  volcano: VolcanoBadge,
  earth: EarthBadge,
};

function LeagueSelect() {
  const { state, actions } = useGame();
  const { play } = useSound();
  const [showUnrankedSettings, setShowUnrankedSettings] = useState(false);

  const handleLeagueSelect = (leagueId) => {
    play('start');
    actions.setLeague(leagueId);
    actions.startGame();
  };

  const handleUnrankedSelect = () => {
    play('start');
    actions.setLeague(null);
    // Start unranked game with default/custom settings
    actions.startGame();
  };

  const handleBack = () => {
    play('select');
    // Go back to player setup (set gameStatus to idle)
    actions.resetGame();
  };

  const handleSettingChange = (key, value) => {
    play('select');
    actions.updateSettings({ [key]: value });
  };

  const leagueOrder = ['boulder', 'cascade', 'volcano', 'earth'];

  return (
    <div className="league-select">
      <motion.div
        className="league-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>🏆 Compete for Your Badge!</h1>
        <p className="league-subtitle">Choose a challenge and climb the global leaderboard</p>

        <div className="league-grid">
          {leagueOrder.map((leagueId, index) => {
            const league = LEAGUES[leagueId];
            return (
              <motion.div
                key={leagueId}
                className={`league-card league-${leagueId}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLeagueSelect(leagueId)}
                style={{ '--league-color': league.color }}
              >
                <div className="badge-container">
                  <img src={badgeImages[leagueId]} alt={league.badge} className="badge-image" />
                </div>
                <div className="league-info">
                  <h3>{league.name}</h3>
                  <p className="gym-leader">Gym Leader: {league.gymLeader}</p>
                  <p className="gym-arena">{league.arena}</p>
                  <span className={`difficulty-badge difficulty-${leagueId}`}>
                    {league.difficulty}
                  </span>
                </div>
                <div className="league-stats">
                  <div className="stat">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span>{league.settings.totalRounds} rounds</span>
                  </div>
                  <div className="stat">
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{league.settings.livesPerPlayer === 0 ? 'No life loss' : `${league.settings.livesPerPlayer} lives`}</span>
                  </div>
                  <div className="stat">
                    <FontAwesomeIcon icon={faClock} />
                    <span>{league.settings.timerDuration}s timer</span>
                  </div>
                  <div className="stat">
                    <FontAwesomeIcon icon={faGift} />
                    <span>{league.settings.bonusProbability}% bonus</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="league-actions">
          <div className="unranked-section">
            <motion.button
              className="unranked-btn"
              onClick={handleUnrankedSelect}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Play Unranked
            </motion.button>
            <div className="unranked-info">
              <span className="unranked-settings-preview">
                {state.settings.totalRounds} rounds • {state.settings.livesPerPlayer} lives • {state.settings.timerDuration}s • {state.settings.bonusProbability}% bonus
              </span>
              <button 
                className="edit-settings-btn"
                onClick={() => { play('select'); setShowUnrankedSettings(!showUnrankedSettings); }}
              >
                <FontAwesomeIcon icon={faCog} /> {showUnrankedSettings ? 'Hide' : 'Edit'}
              </button>
            </div>
            
            {showUnrankedSettings && (
              <motion.div 
                className="unranked-settings-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="setting-row">
                  <label><FontAwesomeIcon icon={faQuestionCircle} /> Rounds</label>
                  <div className="setting-controls">
                    <button onClick={() => handleSettingChange('totalRounds', Math.max(5, state.settings.totalRounds - 5))}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span>{state.settings.totalRounds}</span>
                    <button onClick={() => handleSettingChange('totalRounds', Math.min(50, state.settings.totalRounds + 5))}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                <div className="setting-row">
                  <label><FontAwesomeIcon icon={faHeart} /> Lives</label>
                  <div className="setting-controls">
                    <button onClick={() => handleSettingChange('livesPerPlayer', Math.max(1, state.settings.livesPerPlayer - 1))}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span>{state.settings.livesPerPlayer}</span>
                    <button onClick={() => handleSettingChange('livesPerPlayer', Math.min(10, state.settings.livesPerPlayer + 1))}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                <div className="setting-row">
                  <label><FontAwesomeIcon icon={faClock} /> Timer</label>
                  <div className="setting-controls">
                    <button onClick={() => handleSettingChange('timerDuration', Math.max(5, state.settings.timerDuration - 5))}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span>{state.settings.timerDuration}s</span>
                    <button onClick={() => handleSettingChange('timerDuration', Math.min(60, state.settings.timerDuration + 5))}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
                <div className="setting-row">
                  <label><FontAwesomeIcon icon={faGift} /> Bonus %</label>
                  <div className="setting-controls">
                    <button onClick={() => handleSettingChange('bonusProbability', Math.max(0, state.settings.bonusProbability - 5))}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span>{state.settings.bonusProbability}%</span>
                    <button onClick={() => handleSettingChange('bonusProbability', Math.min(100, state.settings.bonusProbability + 5))}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <motion.button
            className="back-btn"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default LeagueSelect;

