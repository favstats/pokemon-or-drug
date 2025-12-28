import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrophy, faCalendarAlt, faStar, faCrown, faMedal } from '@fortawesome/free-solid-svg-icons';
import { useGame, LEAGUES } from '../context/GameContext';
import BoulderBadge from '../assets/badges/boulder.svg';
import CascadeBadge from '../assets/badges/cascade.svg';
import VolcanoBadge from '../assets/badges/volcano.svg';
import EarthBadge from '../assets/badges/earth.svg';
import './PrizeCabinet.css';

const leagueImages = {
  boulder: BoulderBadge,
  cascade: CascadeBadge,
  volcano: VolcanoBadge,
  earth: EarthBadge,
};

// Medal ribbon colors based on type
const medalRibbonColors = {
  top10: { primary: '#DC143C', secondary: '#8B0000', accent: '#FFD700' }, // Red/Gold for Global
  dailyTop10: { primary: '#3B82F6', secondary: '#1E3A8A', accent: '#60A5FA' }, // Blue for Daily
};

// Get rank display with ordinal suffix
const getRankDisplay = (rank) => {
  if (rank === 1) return { num: '1', suffix: 'st', emoji: '🥇' };
  if (rank === 2) return { num: '2', suffix: 'nd', emoji: '🥈' };
  if (rank === 3) return { num: '3', suffix: 'rd', emoji: '🥉' };
  return { num: String(rank), suffix: 'th', emoji: '🏅' };
};

// Get rank color based on position
const getRankColor = (rank) => {
  if (rank === 1) return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', border: '#B8860B', text: '#8B4513' };
  if (rank === 2) return { bg: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%)', border: '#A8A8A8', text: '#555' };
  if (rank === 3) return { bg: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)', border: '#8B4513', text: '#FFF' };
  // Teal/emerald for ranks 4-10
  return { bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: '#047857', text: '#FFF' };
};

function PrizeCabinet({ isOpen, onClose }) {
  const { state } = useGame();
  const [selectedMedal, setSelectedMedal] = useState(null);

  if (!isOpen) return null;

  const sortedMedals = [...state.medals].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getMedalInfo = (medal) => {
    const date = new Date(medal.date);
    const leagueName = LEAGUES[medal.league]?.name || 'Unranked';

    if (medal.type === 'top10') {
      return {
        title: `Global Top 10`,
        league: leagueName,
        description: `Ranked #${medal.rank} in the ${leagueName} all-time leaderboard`,
        icon: faTrophy,
        color: '#FFD700',
        bgColor: 'rgba(255, 215, 0, 0.15)',
        details: `Score: ${medal.score?.toLocaleString() || 'N/A'} | Date: ${date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}`
      };
    } else if (medal.type === 'dailyTop10') {
      return {
        title: `Daily Champion`,
        league: leagueName,
        description: `Ranked #${medal.rank} in ${leagueName} daily leaderboard`,
        icon: faCalendarAlt,
        color: '#60A5FA',
        bgColor: 'rgba(96, 165, 250, 0.15)',
        details: `Score: ${medal.score?.toLocaleString() || 'N/A'} | Date: ${date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}`
      };
    }
    return {};
  };

  return (
    <AnimatePresence>
      <motion.div
        className="prize-cabinet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="prize-cabinet"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="cabinet-header">
            <h2><FontAwesomeIcon icon={faCrown} /> Hall of Fame</h2>
            <button className="close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="cabinet-content">
            {sortedMedals.length === 0 ? (
              <div className="empty-cabinet">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faMedal} />
                </div>
                <h3>No medals yet!</h3>
                <p>Reach the Top 10 in any league to earn your first medal and immortalize your achievement!</p>
              </div>
            ) : (
              <>
                <div className="medal-count">
                  <FontAwesomeIcon icon={faStar} /> {sortedMedals.length} Badge{sortedMedals.length !== 1 ? 's' : ''} Earned
                </div>
                <div className="medal-shelf">
                  {/* Group medals into shelf rows (4 per shelf) */}
                  {(() => {
                    const shelfRows = [];
                    const medalsPerShelf = 4;
                    for (let i = 0; i < sortedMedals.length; i += medalsPerShelf) {
                      shelfRows.push(sortedMedals.slice(i, i + medalsPerShelf));
                    }
                    
                    return shelfRows.map((shelfMedals, shelfIndex) => (
                      <div key={shelfIndex} className="shelf-unit">
                        <div className="shelf-medals">
                          {shelfMedals.map((medal, index) => {
                            const medalInfo = getMedalInfo(medal);
                            const isSelected = selectedMedal?.key === medal.key;
                            const rankDisplay = getRankDisplay(medal.rank);
                            const rankColor = getRankColor(medal.rank);
                            const globalIndex = shelfIndex * medalsPerShelf + index;

                            return (
                              <motion.div
                                key={medal.key}
                                className={`medal-card ${isSelected ? 'selected' : ''} ${medal.type === 'top10' ? 'global' : 'daily'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: globalIndex * 0.08 }}
                                whileHover={{ scale: 1.03, y: -8 }}
                                onClick={() => setSelectedMedal(isSelected ? null : medal)}
                                style={{ '--medal-accent': medalInfo.color }}
                              >
                                {/* Medal with League Badge as centerpiece */}
                                <div className={`medal-visual ${medal.type}`}>
                                  {/* Ribbon */}
                                  <div 
                                    className="medal-ribbon"
                                    style={{
                                      '--ribbon-primary': medalRibbonColors[medal.type]?.primary,
                                      '--ribbon-secondary': medalRibbonColors[medal.type]?.secondary,
                                    }}
                                  >
                                    <div className="ribbon-tail left"></div>
                                    <div className="ribbon-tail right"></div>
                                    <div className="ribbon-band"></div>
                                  </div>
                                  
                                  {/* Medal Frame with League Badge */}
                                  <div className={`medal-frame ${medal.type}`}>
                                    <div className="medal-ring outer"></div>
                                    <div className="medal-ring inner"></div>
                                    {medal.league && leagueImages[medal.league] && (
                                      <img
                                        src={leagueImages[medal.league]}
                                        alt={LEAGUES[medal.league]?.name}
                                        className="league-badge-center"
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Medal Info */}
                                <div className="medal-info">
                                  <span className="medal-rank">#{medal.rank}</span>
                                  <span className="medal-score">{medal.score?.toLocaleString() || '—'} pts</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        {/* Wooden shelf plank */}
                        <div className="shelf-plank">
                          <div className="shelf-bracket left" />
                          <div className="shelf-bracket right" />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}

            {selectedMedal && (
              <motion.div
                className="medal-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
              <button 
                className="details-close-btn"
                onClick={() => setSelectedMedal(null)}
              >
                <FontAwesomeIcon icon={faTimes} /> Close
              </button>
              <div className="details-content">
                {(() => {
                  const medalInfo = getMedalInfo(selectedMedal);
                  const rankDisplay = getRankDisplay(selectedMedal.rank);
                  const rankColor = getRankColor(selectedMedal.rank);
                  
                  return (
                    <>
                      <div className={`details-visual ${selectedMedal.type}`}>
                        {/* Large ribbon */}
                        <div 
                          className="details-ribbon"
                          style={{
                            '--ribbon-primary': medalRibbonColors[selectedMedal.type]?.primary,
                            '--ribbon-secondary': medalRibbonColors[selectedMedal.type]?.secondary,
                          }}
                        >
                          <div className="ribbon-tail left"></div>
                          <div className="ribbon-tail right"></div>
                          <div className="ribbon-band"></div>
                        </div>
                        
                        {/* Large medal frame with league badge */}
                        <div className={`details-medal-frame ${selectedMedal.type}`}>
                          <div className="medal-ring outer"></div>
                          <div className="medal-ring inner"></div>
                          {selectedMedal.league && leagueImages[selectedMedal.league] && (
                            <img
                              src={leagueImages[selectedMedal.league]}
                              alt={LEAGUES[selectedMedal.league]?.name}
                              className="details-league-badge"
                            />
                          )}
                        </div>
                        
                        <div 
                          className="details-rank"
                          style={{ 
                            background: rankColor.bg,
                            borderColor: rankColor.border,
                            color: rankColor.text
                          }}
                        >
                          {rankDisplay.emoji} #{selectedMedal.rank}
                        </div>
                      </div>
                      <div className="details-text">
                        <h3>
                          <FontAwesomeIcon icon={medalInfo.icon} style={{ color: medalInfo.color }} />
                          {medalInfo.title}
                        </h3>
                        <p className="details-league">{medalInfo.league}</p>
                        <div className="details-stats">
                          <div className="stat-item">
                            <span className="stat-label">Score</span>
                            <span className="stat-value">{selectedMedal.score?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Rank</span>
                            <span className="stat-value">#{selectedMedal.rank}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Date</span>
                            <span className="stat-value">{new Date(selectedMedal.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PrizeCabinet;
