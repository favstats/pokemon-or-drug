import { createContext, useContext, useState, useEffect } from 'react';
import { sounds } from '../data/soundUtils';

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('pord_muted');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('pord_muted', isMuted);
  }, [isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

  const play = (soundName) => {
    if (isMuted) return;
    
    switch (soundName) {
      case 'select': sounds.playSelect(); break;
      case 'start': sounds.playStart(); break;
      case 'correct': sounds.playCorrect(); break;
      case 'wrong': sounds.playWrong(); break;
      case 'powerup': sounds.playPowerup(); break;
      case 'gameOver': sounds.playGameOver(); break;
      case 'bonus': sounds.playBonus(); break;
      default: console.warn(`Unknown sound: ${soundName}`);
    }
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

