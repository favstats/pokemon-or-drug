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

  // Generate score card image (4x resolution for maximum quality)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 4x resolution for ultra crisp images
    const scale = 4;
    const w = 600; // Logical width
    const h = 340; // Logical height
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.scale(scale, scale);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, w, h);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.5, '#16213e');
    bgGradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Decorative gradient orbs
    const drawOrb = (x, y, radius, color, opacity) => {
      const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      orbGradient.addColorStop(0, `rgba(${color}, ${opacity})`);
      orbGradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };
    
    drawOrb(-50, -50, 200, '255, 203, 5', 0.15);
    drawOrb(w + 50, h + 50, 180, '255, 107, 157', 0.1);
    drawOrb(w, 0, 150, '96, 165, 250', 0.08);

    // Title with glow
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 203, 5, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Pokemon or Pill?', w / 2, 45);
    ctx.shadowBlur = 0;

    // Player name with icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${icon || '🎮'}  ${name}`, w / 2, 82);

    // Main score with strong glow
    ctx.shadowColor = 'rgba(255, 203, 5, 0.6)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(score.toLocaleString(), w / 2, 165);
    ctx.shadowBlur = 0;
    
    // "POINTS" label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('P O I N T S', w / 2, 190);

    // Stats row with pill-shaped backgrounds
    const statsY = 235;
    const hasSpeed = avgSpeed && avgSpeed > 0;
    const statItems = [];
    statItems.push({ label: `✓ ${correctAnswers}`, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' });
    statItems.push({ label: `✗ ${wrongAnswers}`, color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' });
    statItems.push({ label: `${accuracy}%`, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' });
    if (hasSpeed) {
      statItems.push({ label: `⚡${(avgSpeed / 1000).toFixed(1)}s`, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' });
    }
    
    const statWidth = 110;
    const totalStatsWidth = statItems.length * statWidth + (statItems.length - 1) * 15;
    const startX = (w - totalStatsWidth) / 2;
    
    statItems.forEach((stat, i) => {
      const x = startX + i * (statWidth + 15);
      
      // Pill background
      ctx.fillStyle = stat.bg;
      ctx.beginPath();
      ctx.roundRect(x, statsY - 18, statWidth, 36, 18);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = stat.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, statsY - 18, statWidth, 36, 18);
      ctx.stroke();
      
      // Text
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.label, x + statWidth / 2, statsY + 6);
    });

    // Badge section (if ranked)
    const finishCard = () => {
      // Footer with subtle line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h - 35);
      ctx.lineTo(w * 0.8, h - 35);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('pokepill.net', w / 2, h - 12);
      
      setScoreCardUrl(canvas.toDataURL('image/png', 1.0));
    };

    if (league && badgeImages[league]) {
      const img = new Image();
      img.onload = () => {
        const badgeY = 275;
        const badgeSize = 40;
        const leagueName = `${league.charAt(0).toUpperCase() + league.slice(1)} Badge`;
        
        // Badge background pill
        ctx.fillStyle = 'rgba(255, 203, 5, 0.1)';
        ctx.beginPath();
        ctx.roundRect(w / 2 - 90, badgeY - 12, 180, 44, 22);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 203, 5, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(w / 2 - 90, badgeY - 12, 180, 44, 22);
        ctx.stroke();
        
        // Draw badge
        ctx.drawImage(img, w / 2 - 75, badgeY - 5, badgeSize, badgeSize);
        
        // Badge name
        ctx.fillStyle = '#FFCB05';
        ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(leagueName, w / 2 - 28, badgeY + 20);
        
        ctx.textAlign = 'center';
        finishCard();
      };
      img.src = badgeImages[league];
    } else {
      finishCard();
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

