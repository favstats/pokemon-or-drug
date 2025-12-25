import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchDrugImage } from '../data/drugService';
import './DrugImage.css';

// Cartoony SVG pill illustrations based on pill shape
function DrugImage({ drug }) {
  const { pillShape = 'capsule', pillColor = '#FF6B9D', name, color } = drug;
  const [realImage, setRealImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const bgColor = color || '#FF6B9D';
  const fillColor = pillColor || '#FFFFFF';

  // Try to fetch real drug image
  useEffect(() => {
    let cancelled = false;
    
    const loadImage = async () => {
      try {
        const imageUrl = await fetchDrugImage(name);
        if (!cancelled && imageUrl) {
          setRealImage(imageUrl);
        }
      } catch (err) {
        console.warn('Could not load drug image:', err);
      } finally {
        if (!cancelled) {
          setImageLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => { cancelled = true; };
  }, [name]);
  
  const renderPill = () => {
    switch (pillShape) {
      case 'capsule':
        return (
          <svg viewBox="0 0 120 60" className="pill-svg">
            {/* Shadow */}
            <ellipse cx="62" cy="55" rx="50" ry="8" fill="rgba(0,0,0,0.2)" />
            {/* Capsule body */}
            <rect x="10" y="10" width="100" height="40" rx="20" ry="20" fill={fillColor} />
            {/* Capsule half (colored) */}
            <path d="M60 10 L60 50 L90 50 Q110 50 110 30 Q110 10 90 10 Z" fill={bgColor} />
            {/* Shine */}
            <ellipse cx="35" cy="22" rx="15" ry="6" fill="rgba(255,255,255,0.6)" />
            {/* Outline */}
            <rect x="10" y="10" width="100" height="40" rx="20" ry="20" fill="none" stroke="#333" strokeWidth="2" />
            {/* Face */}
            <circle cx="40" cy="28" r="4" fill="#333" />
            <circle cx="55" cy="28" r="4" fill="#333" />
            <path d="M42 38 Q48 44 54 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'round':
        return (
          <svg viewBox="0 0 80 80" className="pill-svg">
            {/* Shadow */}
            <ellipse cx="42" cy="72" rx="30" ry="8" fill="rgba(0,0,0,0.2)" />
            {/* Pill body */}
            <circle cx="40" cy="40" r="32" fill={fillColor} />
            {/* Colored section */}
            <path d="M40 8 A32 32 0 0 1 40 72" fill={bgColor} />
            {/* Shine */}
            <ellipse cx="28" cy="25" rx="10" ry="6" fill="rgba(255,255,255,0.6)" />
            {/* Outline */}
            <circle cx="40" cy="40" r="32" fill="none" stroke="#333" strokeWidth="2" />
            {/* Score line */}
            <line x1="40" y1="10" x2="40" y2="70" stroke="#333" strokeWidth="1" opacity="0.3" />
            {/* Face */}
            <circle cx="28" cy="38" r="4" fill="#333" />
            <circle cx="52" cy="38" r="4" fill="#333" />
            <path d="M32 50 Q40 58 48 50" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'oval':
        return (
          <svg viewBox="0 0 100 60" className="pill-svg">
            {/* Shadow */}
            <ellipse cx="52" cy="55" rx="40" ry="6" fill="rgba(0,0,0,0.2)" />
            {/* Pill body */}
            <ellipse cx="50" cy="30" rx="42" ry="24" fill={fillColor} />
            {/* Colored half */}
            <path d="M50 6 A42 24 0 0 1 50 54" fill={bgColor} />
            {/* Shine */}
            <ellipse cx="30" cy="18" rx="12" ry="5" fill="rgba(255,255,255,0.6)" />
            {/* Outline */}
            <ellipse cx="50" cy="30" rx="42" ry="24" fill="none" stroke="#333" strokeWidth="2" />
            {/* Face */}
            <circle cx="35" cy="28" r="3" fill="#333" />
            <circle cx="50" cy="28" r="3" fill="#333" />
            <path d="M37 38 Q43 44 49 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'diamond':
        return (
          <svg viewBox="0 0 80 80" className="pill-svg">
            {/* Shadow */}
            <ellipse cx="42" cy="72" rx="25" ry="6" fill="rgba(0,0,0,0.2)" />
            {/* Diamond body */}
            <path d="M40 5 L75 40 L40 75 L5 40 Z" fill={fillColor} />
            {/* Colored half */}
            <path d="M40 5 L75 40 L40 75 Z" fill={bgColor} />
            {/* Shine */}
            <path d="M25 25 L35 20 L30 35 Z" fill="rgba(255,255,255,0.5)" />
            {/* Outline */}
            <path d="M40 5 L75 40 L40 75 L5 40 Z" fill="none" stroke="#333" strokeWidth="2" />
            {/* Face */}
            <circle cx="30" cy="38" r="3" fill="#333" />
            <circle cx="50" cy="38" r="3" fill="#333" />
            <path d="M34 48 Q40 54 46 48" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'injection':
        return (
          <svg viewBox="0 0 100 100" className="pill-svg">
            {/* Syringe body */}
            <rect x="25" y="20" width="50" height="50" rx="5" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
            {/* Plunger */}
            <rect x="40" y="5" width="20" height="20" fill="#666" stroke="#333" strokeWidth="2" />
            {/* Needle */}
            <path d="M50 70 L50 95" stroke="#999" strokeWidth="4" />
            <path d="M48 95 L50 100 L52 95" fill="#999" />
            {/* Liquid */}
            <rect x="30" y="35" width="40" height="30" fill={bgColor} opacity="0.7" />
            {/* Markings */}
            <line x1="28" y1="35" x2="35" y2="35" stroke="#333" strokeWidth="1" />
            <line x1="28" y1="45" x2="35" y2="45" stroke="#333" strokeWidth="1" />
            <line x1="28" y1="55" x2="35" y2="55" stroke="#333" strokeWidth="1" />
            {/* Face */}
            <circle cx="42" cy="42" r="3" fill="#333" />
            <circle cx="58" cy="42" r="3" fill="#333" />
            <path d="M45 52 Q50 58 55 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'inhaler':
        return (
          <svg viewBox="0 0 80 100" className="pill-svg">
            {/* Inhaler body */}
            <path d="M20 30 L20 90 Q20 95 25 95 L55 95 Q60 95 60 90 L60 30 Q60 20 40 20 Q20 20 20 30" fill={bgColor} stroke="#333" strokeWidth="2" />
            {/* Mouthpiece */}
            <rect x="30" y="10" width="20" height="15" rx="3" fill="#666" stroke="#333" strokeWidth="2" />
            {/* Cap */}
            <rect x="25" y="0" width="30" height="12" rx="3" fill="#444" stroke="#333" strokeWidth="2" />
            {/* Shine */}
            <path d="M25 35 L25 80" stroke="rgba(255,255,255,0.4)" strokeWidth="8" strokeLinecap="round" />
            {/* Face */}
            <circle cx="32" cy="55" r="4" fill="#333" />
            <circle cx="48" cy="55" r="4" fill="#333" />
            <path d="M35 70 Q40 78 45 70" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'spray':
        return (
          <svg viewBox="0 0 60 100" className="pill-svg">
            {/* Bottle */}
            <rect x="10" y="30" width="40" height="65" rx="5" fill={bgColor} stroke="#333" strokeWidth="2" />
            {/* Cap/Nozzle */}
            <rect x="20" y="10" width="20" height="25" rx="3" fill="#666" stroke="#333" strokeWidth="2" />
            <circle cx="30" cy="12" r="4" fill="#444" />
            {/* Spray mist */}
            <circle cx="30" cy="3" r="2" fill="#87CEEB" opacity="0.6" />
            <circle cx="25" cy="0" r="1.5" fill="#87CEEB" opacity="0.4" />
            <circle cx="35" cy="1" r="1.5" fill="#87CEEB" opacity="0.4" />
            {/* Label */}
            <rect x="15" y="45" width="30" height="35" rx="2" fill="white" opacity="0.8" />
            {/* Face on label */}
            <circle cx="22" cy="58" r="3" fill="#333" />
            <circle cx="38" cy="58" r="3" fill="#333" />
            <path d="M25 68 Q30 74 35 68" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      case 'film':
        return (
          <svg viewBox="0 0 80 60" className="pill-svg">
            {/* Film strip */}
            <rect x="5" y="15" width="70" height="35" rx="3" fill={bgColor} stroke="#333" strokeWidth="2" />
            {/* Texture lines */}
            <line x1="20" y1="15" x2="20" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="40" y1="15" x2="40" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="60" y1="15" x2="60" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            {/* Shine */}
            <rect x="10" y="20" width="25" height="5" fill="rgba(255,255,255,0.4)" rx="2" />
            {/* Face */}
            <circle cx="30" cy="30" r="3" fill="#333" />
            <circle cx="50" cy="30" r="3" fill="#333" />
            <path d="M35 40 Q40 46 45 40" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
      
      default:
        // Default pill shape
        return (
          <svg viewBox="0 0 120 60" className="pill-svg">
            <ellipse cx="62" cy="55" rx="50" ry="8" fill="rgba(0,0,0,0.2)" />
            <rect x="10" y="10" width="100" height="40" rx="20" ry="20" fill={fillColor} />
            <path d="M60 10 L60 50 L90 50 Q110 50 110 30 Q110 10 90 10 Z" fill={bgColor} />
            <ellipse cx="35" cy="22" rx="15" ry="6" fill="rgba(255,255,255,0.6)" />
            <rect x="10" y="10" width="100" height="40" rx="20" ry="20" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="40" cy="28" r="4" fill="#333" />
            <circle cx="55" cy="28" r="4" fill="#333" />
            <path d="M42 38 Q48 44 54 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <motion.div 
      className="drug-image-container"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
    >
      <div className="drug-pill-wrapper">
        {/* Show real image if available, otherwise show cartoon */}
        {realImage && !imageError ? (
          <div className="real-drug-image">
            <img 
              src={realImage} 
              alt={name}
              onError={() => setImageError(true)}
              className="drug-photo"
            />
          </div>
        ) : (
          renderPill()
        )}
      </div>
      <motion.div 
        className="drug-name-badge"
        style={{ background: bgColor }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {name}
      </motion.div>
    </motion.div>
  );
}

export default DrugImage;
