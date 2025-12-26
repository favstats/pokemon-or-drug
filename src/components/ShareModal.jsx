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

  // Generate score card image
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative elements
    ctx.fillStyle = 'rgba(255, 203, 5, 0.1)';
    ctx.beginPath();
    ctx.arc(-50, -50, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width + 50, height + 50, 200, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pokemon or Drug?', width / 2, 50);

    // Player info
    ctx.fillStyle = 'white';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${icon || '🎮'} ${name}`, width / 2, 100);

    // Score
    ctx.fillStyle = '#FFCB05';
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.fillText(score.toLocaleString(), width / 2, 180);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillText('POINTS', width / 2, 210);

    // Stats
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    const statsY = 270;
    ctx.fillText(`✅ ${correctAnswers} correct`, width / 4, statsY);
    ctx.fillText(`❌ ${wrongAnswers} wrong`, width / 2, statsY);
    ctx.fillText(`🎯 ${accuracy}%`, (width / 4) * 3, statsY);

    // League/Badge
    if (league) {
      const leagueName = `${league.charAt(0).toUpperCase() + league.slice(1)} Badge`;
      ctx.fillStyle = '#FFCB05';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`🏅 ${leagueName}`, width / 2, 320);
    }

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText('Play at: favstats.github.io/pokemon-or-drug', width / 2, 370);

    // Convert to image URL
    setScoreCardUrl(canvas.toDataURL('image/png'));
  }, [isOpen, name, icon, score, accuracy, correctAnswers, wrongAnswers, league]);

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

