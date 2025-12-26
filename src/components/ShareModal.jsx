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

const GAME_URL = 'https://favstats.github.io/pokemon-or-drug/';

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
    return `${emoji} I scored ${score} points in Pokemon or Drug! (${leagueName})\n\n` +
           `✅ ${correctAnswers} correct | ❌ ${wrongAnswers} wrong | 🎯 ${accuracy}% accuracy\n\n` +
           `Can you beat my score? 👇\n${GAME_URL}`;
  };

  // Generate score card image (2x resolution for high quality)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 2x resolution for crisp images
    const scale = 2;
    const width = 600 * scale;
    const height = 450 * scale;
    canvas.width = width;
    canvas.height = height;
    ctx.scale(scale, scale);
    
    const w = 600; // Logical width
    const h = 450; // Logical height

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f1629');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Decorative circles
    ctx.fillStyle = 'rgba(255, 203, 5, 0.08)';
    ctx.beginPath();
    ctx.arc(-30, -30, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w + 30, h + 30, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 107, 157, 0.05)';
    ctx.beginPath();
    ctx.arc(w, 0, 150, 0, Math.PI * 2);
    ctx.fill();

    // Title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 38px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pokemon or Drug?', w / 2, 50);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Player icon and name
    ctx.fillStyle = 'white';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${icon || '🎮'} ${name}`, w / 2, 95);

    // Score (large)
    ctx.shadowColor = 'rgba(255, 203, 5, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 90px system-ui, -apple-system, sans-serif';
    ctx.fillText(score.toLocaleString(), w / 2, 185);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('POINTS', w / 2, 215);

    // Stats row with icons (drawn as shapes)
    const statsY = 270;
    const statSpacing = w / 4;
    
    // Draw stat boxes
    const drawStatBox = (x, label, value, color) => {
      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(x - 60, statsY - 25, 120, 50, 10);
      ctx.fill();
      
      // Icon circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x - 35, statsY, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Checkmark or X
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(label === 'correct' ? '✓' : label === 'wrong' ? '✗' : '◎', x - 35, statsY + 5);
      
      // Value
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + 15, statsY + 7);
    };
    
    drawStatBox(statSpacing * 1, 'correct', `${correctAnswers}`, '#4ade80');
    drawStatBox(statSpacing * 2, 'wrong', `${wrongAnswers}`, '#f87171');
    drawStatBox(statSpacing * 3, 'accuracy', `${accuracy}%`, '#fbbf24');

    // Speed stat
    if (avgSpeed) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 80, statsY + 40, 160, 35, 8);
      ctx.fill();
      
      ctx.fillStyle = '#60a5fa';
      ctx.font = '16px system-ui';
      ctx.fillText(`⚡ Avg Speed: ${(avgSpeed / 1000).toFixed(1)}s`, w / 2, statsY + 63);
    }

    // Badge section
    if (league && badgeImages[league]) {
      const badgeY = avgSpeed ? 365 : 340;
      
      // Load and draw badge
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, w / 2 - 25, badgeY - 30, 50, 50);
        
        // Badge name
        const leagueName = `${league.charAt(0).toUpperCase() + league.slice(1)} Badge`;
        ctx.fillStyle = '#FFCB05';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(leagueName, w / 2, badgeY + 40);
        
        // Footer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText('favstats.github.io/pokemon-or-drug', w / 2, h - 15);
        
        // Convert to image URL
        setScoreCardUrl(canvas.toDataURL('image/png', 1.0));
      };
      img.src = badgeImages[league];
    } else {
      // No badge - just footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText('favstats.github.io/pokemon-or-drug', w / 2, h - 15);
      
      // Convert to image URL
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
    link.download = `pokemon-or-drug-score-${score}.png`;
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
            <span>Enjoying the game?</span>
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

