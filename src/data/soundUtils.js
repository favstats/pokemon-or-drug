// Retro 8-bit sound generator using Web Audio API
// Inspired by GameBoy era Pokemon sound effects

class SoundGenerator {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play a short 8-bit select beep
  playSelect() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime); // C6
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Triumphant start jingle
  playStart() {
    this.init();
    const now = this.ctx.currentTime;
    
    const playNote = (freq, start, duration, type = 'square') => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Jolly C-major arpeggio
    playNote(523.25, now, 0.1); // C5
    playNote(659.25, now + 0.1, 0.1); // E5
    playNote(783.99, now + 0.2, 0.1); // G5
    playNote(1046.50, now + 0.3, 0.3); // C6
  }

  // Correct answer "ding" - subtler 8-bit style
  playCorrect() {
    this.init();
    const now = this.ctx.currentTime;
    
    const playPulse = (freq, start, duration, volume = 0.05) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Quick, subtle high-pitched double-beep (C6 to E6)
    playPulse(1046.50, now, 0.04, 0.03); 
    playPulse(1318.51, now + 0.04, 0.06, 0.02);
  }

  // Wrong answer - jolly "wah-wah" descending notes
  playWrong() {
    this.init();
    const now = this.ctx.currentTime;
    
    const playNote = (freq, start, duration, volume = 0.04) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, start + duration);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Playful descending "boop-boop-boop" 
    playNote(523.25, now, 0.08);        // C5
    playNote(440, now + 0.1, 0.08);     // A4
    playNote(349.23, now + 0.2, 0.12);  // F4
  }

  // Powerup sparkly sound - rapid 8-bit arpeggio
  playPowerup() {
    this.init();
    const now = this.ctx.currentTime;
    
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1000 + (i * 300), now + (i * 0.03));
      gain.gain.setValueAtTime(0.03, now + (i * 0.03));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.03) + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + (i * 0.03));
      osc.stop(now + (i * 0.03) + 0.05);
    }
  }

  // Game over minor jingle
  playGameOver() {
    this.init();
    const now = this.ctx.currentTime;
    
    const playNote = (freq, start, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.linearRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(392.00, now, 0.2); // G4
    playNote(349.23, now + 0.2, 0.2); // F4
    playNote(311.13, now + 0.4, 0.2); // Eb4
    playNote(261.63, now + 0.6, 0.6); // C4
  }

  // Bonus round fanfare - exciting 8-bit jingle
  playBonus() {
    this.init();
    const now = this.ctx.currentTime;
    
    const playNote = (freq, start, duration, volume = 0.06) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Exciting rising arpeggio with flourish
    playNote(523.25, now, 0.08);        // C5
    playNote(659.25, now + 0.08, 0.08); // E5
    playNote(783.99, now + 0.16, 0.08); // G5
    playNote(1046.50, now + 0.24, 0.08); // C6
    playNote(1318.51, now + 0.32, 0.08); // E6
    playNote(1567.98, now + 0.40, 0.15); // G6
    // Final chord
    playNote(1046.50, now + 0.55, 0.25, 0.04); // C6
    playNote(1318.51, now + 0.55, 0.25, 0.04); // E6
    playNote(1567.98, now + 0.55, 0.25, 0.04); // G6
  }
}

export const sounds = new SoundGenerator();

