import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faTrophy,
  faBolt,
  faFire,
  faGamepad,
  faMedal,
  faChartLine,
  faCrown,
  faCalendarAlt,
  faStopwatch
} from '@fortawesome/free-solid-svg-icons';
import { LEAGUES } from '../context/GameContext';
import './PlayerProfile.css';

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

function PlayerProfile({ isOpen, onClose, player, rank, allScores = [], period = 'daily' }) {
  if (!isOpen || !player) return null;

  // Safely get player name as string
  const getNameString = (name) => {
    if (name === null || name === undefined) return '';
    if (typeof name === 'string') return name.toLowerCase();
    if (typeof name === 'number') return String(name);
    return String(name).toLowerCase();
  };

  // Calculate player stats from all their scores (deduplicated)
  const playerName = getNameString(player.name);
  
  // Filter scores for this player
  const rawPlayerScores = (allScores || []).filter(s => {
    if (!s || typeof s !== 'object') return false;
    const scoreName = getNameString(s.name);
    return scoreName === playerName;
  });
  
  // Deduplicate by creating a unique key for each score entry
  const seenScores = new Set();
  const playerScores = rawPlayerScores.filter(s => {
    // Create a unique key from score properties
    const key = `${s.score}-${s.league}-${s.avgSpeed}-${s.timestamp || s.date || s.createdAt || ''}`;
    if (seenScores.has(key)) return false;
    seenScores.add(key);
    return true;
  });
  
  const gamesPlayed = playerScores.length;
  const bestScore = gamesPlayed > 0 
    ? Math.max(...playerScores.map(s => s.score || 0))
    : player.score || 0;
  const totalScore = playerScores.reduce((sum, s) => sum + (s.score || 0), 0);
  const avgScore = gamesPlayed > 0 
    ? Math.round(totalScore / gamesPlayed)
    : player.score || 0;
  
  const speedScores = playerScores.filter(s => s.avgSpeed && s.avgSpeed > 0);
  const avgSpeed = speedScores.length > 0
    ? speedScores.reduce((sum, s) => sum + s.avgSpeed, 0) / speedScores.length
    : player.avgSpeed || null;
  const bestSpeed = speedScores.length > 0
    ? Math.min(...speedScores.map(s => s.avgSpeed))
    : player.avgSpeed || null;

  // Get leagues they've played with counts
  const leaguesPlayed = [...new Set(playerScores.map(s => s.league).filter(Boolean))];
  
  // Calculate per-league stats
  const leagueStats = leaguesPlayed.reduce((acc, league) => {
    const leagueScores = playerScores.filter(s => s.league === league);
    acc[league] = {
      games: leagueScores.length,
      best: Math.max(...leagueScores.map(s => s.score || 0)),
    };
    return acc;
  }, {});

  // Get their rank medal
  const getRankStyle = (r) => {
    if (r === 1) return { color: '#FFD700', icon: faCrown, label: 'Champion' };
    if (r === 2) return { color: '#C0C0C0', icon: faMedal, label: 'Runner-up' };
    if (r === 3) return { color: '#CD7F32', icon: faMedal, label: 'Third Place' };
    if (r <= 10) return { color: '#a5b4fc', icon: faTrophy, label: `Top 10` };
    return { color: '#6b7280', icon: faGamepad, label: `Rank #${r}` };
  };

  const rankInfo = getRankStyle(rank);
  const periodLabel = period === 'daily' ? "Today's" : 'All-Time';

  return (
    <AnimatePresence>
      <motion.div
        className="player-profile-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="player-profile-modal"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="profile-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>

          {/* Header with player info */}
          <div className="profile-header">
            <div className="profile-rank-badge" style={{ background: `linear-gradient(135deg, ${rankInfo.color}40, ${rankInfo.color}20)`, borderColor: rankInfo.color }}>
              <FontAwesomeIcon icon={rankInfo.icon} style={{ color: rankInfo.color }} />
              <span style={{ color: rankInfo.color }}>#{rank}</span>
            </div>
            
            <div className="profile-avatar">
              <span className="profile-icon">{player.icon || '🎮'}</span>
            </div>
            
            <h2 className="profile-name">{player.name}</h2>
            <p className="profile-title" style={{ color: rankInfo.color }}>{rankInfo.label}</p>
            <p className="profile-period">{periodLabel} Leaderboard</p>
          </div>

          {/* Main score display */}
          <div className="profile-score-showcase">
            <div className="showcase-score">
              <span className="showcase-value">{player.score?.toLocaleString() || 0}</span>
              <span className="showcase-label">Score</span>
            </div>
            {player.avgSpeed && (
              <div className="showcase-speed">
                <FontAwesomeIcon icon={faBolt} />
                <span>{(player.avgSpeed / 1000).toFixed(2)}s</span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <FontAwesomeIcon icon={faGamepad} className="stat-icon games" />
              <span className="stat-value">{gamesPlayed}</span>
              <span className="stat-label">Games Played</span>
            </div>
            
            <div className="profile-stat">
              <FontAwesomeIcon icon={faTrophy} className="stat-icon best" />
              <span className="stat-value">{bestScore.toLocaleString()}</span>
              <span className="stat-label">Best Score</span>
            </div>
            
            <div className="profile-stat">
              <FontAwesomeIcon icon={faFire} className="stat-icon total" />
              <span className="stat-value">{totalScore.toLocaleString()}</span>
              <span className="stat-label">Total Points</span>
            </div>
            
            {bestSpeed && (
              <div className="profile-stat">
                <FontAwesomeIcon icon={faStopwatch} className="stat-icon speed" />
                <span className="stat-value">{(bestSpeed / 1000).toFixed(2)}s</span>
                <span className="stat-label">Best Speed</span>
              </div>
            )}
          </div>

          {/* Leagues played */}
          {leaguesPlayed.length > 0 && (
            <div className="profile-leagues">
              <h3><FontAwesomeIcon icon={faMedal} /> Badge Performance</h3>
              <div className="leagues-list">
                {leaguesPlayed.map(leagueId => (
                  <div key={leagueId} className="league-badge-item">
                    <img src={badgeImages[leagueId]} alt={LEAGUES[leagueId]?.name} />
                    <div className="league-badge-info">
                      <span className="league-badge-name">{LEAGUES[leagueId]?.name}</span>
                      <span className="league-badge-stats">
                        {leagueStats[leagueId]?.games} game{leagueStats[leagueId]?.games !== 1 ? 's' : ''} • Best: {leagueStats[leagueId]?.best?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity hint */}
          {player.timestamp || player.date || player.createdAt ? (
            <div className="profile-last-played">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Last played: {new Date(player.timestamp || player.date || player.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PlayerProfile;

