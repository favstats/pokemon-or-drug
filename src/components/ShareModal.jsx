import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faLink, 
  faCheck, 
  faDownload,
  faShareAlt,
  faCoffee,
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { 
  faTwitter, 
  faWhatsapp, 
  faTelegram,
  faPaypal
} from '@fortawesome/free-brands-svg-icons';
import { QRCodeSVG } from 'qrcode.react';
import './ShareModal.css';

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

// Bluesky icon (not in FontAwesome)
const BlueskyIcon = () => (
  <svg viewBox="0 0 600 530" width="18" height="18" fill="currentColor">
    <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/>
  </svg>
);

const GAME_URL = 'https://pokepill.net/';

function ShareModal({ isOpen, onClose, playerData, gameData }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('share'); // 'share' or 'challenge'
  const canvasRef = useRef(null);
  const [scoreCardUrl, setScoreCardUrl] = useState(null);

  const { name, icon, score, accuracy, avgSpeed, correctAnswers, wrongAnswers, streak } = playerData;
  const { league, gameMode, totalRounds } = gameData;

  // Generate share text
  const getShareText = () => {
    const leagueName = league ? `${league.charAt(0).toUpperCase() + league.slice(1)} Badge` : 'Unranked';
    const emoji = score >= 1000 ? '🏆' : score >= 500 ? '⭐' : '🎮';
    return `${emoji} I scored ${score} points in Pokemon or Pill! (${leagueName})\n\n` +
           `✅ ${correctAnswers} correct | ❌ ${wrongAnswers} wrong | 🎯 ${accuracy}% accuracy\n\n` +
           `Can you beat my score? 👇\n${GAME_URL}`;
  };

  // Generate score card image (3x resolution for high quality)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 3x resolution for crisp images
    const scale = 3;
    const w = 500; // Logical width
    const h = 280; // Logical height (more compact)
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.scale(scale, scale);

    // Background - solid dark with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1e1e2e');
    gradient.addColorStop(1, '#181825');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Subtle corner accents
    ctx.fillStyle = 'rgba(255, 203, 5, 0.06)';
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w, h, 100, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Pokemon or Pill?', w / 2, 35);

    // Player name with icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${icon || '🎮'}  ${name}`, w / 2, 65);

    // Main score - big and bold
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(score.toLocaleString(), w / 2, 130);
    
    // "POINTS" label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('POINTS', w / 2, 148);

    // Stats row - simple text based
    const statsY = 185;
    ctx.font = '15px -apple-system, BlinkMacSystemFont, sans-serif';
    
    // Calculate positions for 3 or 4 items
    const hasSpeed = avgSpeed && avgSpeed > 0;
    const items = hasSpeed ? 4 : 3;
    const spacing = w / (items + 1);
    
    // Correct
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`✓ ${correctAnswers} correct`, spacing, statsY);
    
    // Wrong
    ctx.fillStyle = '#f87171';
    ctx.fillText(`✗ ${wrongAnswers} wrong`, spacing * 2, statsY);
    
    // Accuracy
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${accuracy}% accuracy`, spacing * 3, statsY);
    
    // Speed (if available)
    if (hasSpeed) {
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`⚡ ${(avgSpeed / 1000).toFixed(1)}s avg`, spacing * 4, statsY);
    }

    // Badge (if ranked)
    if (league && badgeImages[league]) {
      const img = new Image();
      img.onload = () => {
        // Draw badge
        const badgeSize = 32;
        const badgeX = w / 2 - badgeSize / 2 - 60;
        const badgeY = 215;
        ctx.drawImage(img, badgeX, badgeY, badgeSize, badgeSize);
        
        // Badge name next to it
        ctx.fillStyle = '#FFCB05';
        ctx.font = '600 14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${league.charAt(0).toUpperCase() + league.slice(1)} Badge`, badgeX + badgeSize + 10, badgeY + 21);
        
        // Footer
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('pokepill.net', w / 2, h - 12);
        
        setScoreCardUrl(canvas.toDataURL('image/png', 1.0));
      };
      img.src = badgeImages[league];
    } else {
      // Footer only
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('pokepill.net', w / 2, h - 12);
      
      setScoreCardUrl(canvas.toDataURL('image/png', 1.0));
    }
  }, [isOpen, name, icon, score, accuracy, avgSpeed, correctAnswers, wrongAnswers, league]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(GAME_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(GAME_URL);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      bluesky: `https://bsky.app/intent/compose?text=${text}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleDownloadCard = () => {
    if (!scoreCardUrl) return;
    const link = document.createElement('a');
    link.download = `pokemon-or-pill-score-${score}.png`;
    link.href = scoreCardUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="share-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="share-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className="share-tabs">
            <button 
              className={`share-tab ${activeTab === 'share' ? 'active' : ''}`}
              onClick={() => setActiveTab('share')}
            >
              <FontAwesomeIcon icon={faShareAlt} /> Share Score
            </button>
            <button 
              className={`share-tab ${activeTab === 'challenge' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenge')}
            >
              🎯 Challenge
            </button>
          </div>

          {activeTab === 'share' ? (
            <div className="share-content">
              {/* Score Card Preview */}
              <div className="score-card-preview">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {scoreCardUrl && (
                  <img src={scoreCardUrl} alt="Score Card" className="score-card-image" />
                )}
                <button className="download-card-btn" onClick={handleDownloadCard}>
                  <FontAwesomeIcon icon={faDownload} /> Save Image
                </button>
              </div>

              {/* Share Buttons */}
              <div className="share-buttons">
                <button className="share-btn twitter" onClick={() => handleShare('twitter')}>
                  <FontAwesomeIcon icon={faTwitter} />
                  <span>Twitter/X</span>
                </button>
                <button className="share-btn bluesky" onClick={() => handleShare('bluesky')}>
                  <BlueskyIcon />
                  <span>Bluesky</span>
                </button>
                <button className="share-btn whatsapp" onClick={() => handleShare('whatsapp')}>
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>WhatsApp</span>
                </button>
                <button className="share-btn telegram" onClick={() => handleShare('telegram')}>
                  <FontAwesomeIcon icon={faTelegram} />
                  <span>Telegram</span>
                </button>
                <button className={`share-btn copy ${copied ? 'copied' : ''}`} onClick={handleCopyLink}>
                  <FontAwesomeIcon icon={copied ? faCheck : faLink} />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="challenge-content">
              <h3>Challenge a Friend!</h3>
              <p>Scan this QR code to play:</p>
              
              <div className="qr-container">
                <QRCodeSVG 
                  value={GAME_URL}
                  size={180}
                  bgColor="#1a1a2e"
                  fgColor="#FFCB05"
                  level="M"
                  includeMargin={true}
                />
              </div>

              <div className="challenge-link">
                <input type="text" value={GAME_URL} readOnly />
                <button onClick={handleCopyLink}>
                  <FontAwesomeIcon icon={copied ? faCheck : faLink} />
                </button>
              </div>

              <p className="challenge-text">
                Share the link and see who can beat your score of <strong>{score}</strong> points!
              </p>
            </div>
          )}

          {/* Support Section */}
          <div className="support-section">
            <span>Enjoying the game? Consider supporting the development :)</span>
            <div className="support-buttons">
              <a 
                href="https://www.buymeacoffee.com/favstats" 
                target="_blank" 
                rel="noopener noreferrer"
                className="support-btn coffee"
              >
                <FontAwesomeIcon icon={faCoffee} /> Coffee
              </a>
              <a 
                href="https://paypal.me/FVotta" 
                target="_blank" 
                rel="noopener noreferrer"
                className="support-btn paypal"
              >
                <FontAwesomeIcon icon={faPaypal} /> PayPal
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ShareModal;

