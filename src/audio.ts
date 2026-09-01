class AudioEngine {
  ctx: AudioContext | null = null;
  bgmInterval: number | null = null;
  isPlayingBgm: boolean = false;
  bgmGain: GainNode | null = null;
  initialized: boolean = false;
  isMuted: boolean = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.setTargetAtTime(muted ? 0 : 0.03, this.ctx.currentTime, 0.1);
      } catch (e) {}
    }
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (CtxClass) {
        this.ctx = new CtxClass();
        this.initialized = true;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  playCoin() {
    if (!this.ctx || this.isMuted) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setTargetAtTime(2000, now, 0.05); // Smooth exponential target
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.setTargetAtTime(0, now, 0.03); // Safest way to avoid clipping/errors
      
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playKey() {
    if (!this.ctx || this.isMuted) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setTargetAtTime(800, now, 0.05);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setTargetAtTime(0, now, 0.03);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playBGM() {
    if (this.isPlayingBgm || !this.ctx) return;
    this.isPlayingBgm = true;
    
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.03; 
      this.bgmGain.connect(this.ctx.destination);
      
      const notes = [
        220.00, 261.63, 329.63, 261.63, 
        293.66, 349.23, 440.00, 349.23  
      ];
      let noteIndex = 0;
      let nextNoteTime = this.ctx.currentTime + 0.1;
      
      const scheduleNotes = () => {
        if (!this.isPlayingBgm || !this.ctx || !this.bgmGain) return;
        
        try {
          const now = this.ctx.currentTime;
          // Reset timing if completely desynchronized (e.g. background tab)
          if (nextNoteTime < now) {
            nextNoteTime = now + 0.1;
          }
          
          // Schedule 2.0 seconds ahead to survive extreme setTimeout throttling in background
          while (nextNoteTime < now + 2.0) {
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            
            osc.connect(noteGain);
            noteGain.connect(this.bgmGain);
            
            osc.type = 'triangle';
            osc.frequency.value = notes[noteIndex]; 
            noteIndex = (noteIndex + 1) % notes.length;
            
            noteGain.gain.setValueAtTime(0, nextNoteTime);
            noteGain.gain.setTargetAtTime(0.2, nextNoteTime, 0.01);
            noteGain.gain.setTargetAtTime(0, nextNoteTime + 0.1, 0.05);
            
            osc.start(nextNoteTime);
            osc.stop(nextNoteTime + 0.25);
            
            nextNoteTime += 0.25; 
          }
          
          // Fire less frequently to save CPU, lookahead handles the rest
          this.bgmInterval = window.setTimeout(scheduleNotes, 1000);
        } catch (e) {
          // Retry on next cycle if scheduling failed
          this.bgmInterval = window.setTimeout(scheduleNotes, 1000);
        }
      };
      
      scheduleNotes();
    } catch (e) {}
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmInterval !== null) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try {
        this.bgmGain.disconnect();
      } catch (e) {}
      this.bgmGain = null;
    }
  }
}

// Bind to window to prevent HMR / hot-reload from creating multiple contexts
const globalAny = window as any;
if (!globalAny.__audioEngine) {
  globalAny.__audioEngine = new AudioEngine();
}
export const audioEngine = globalAny.__audioEngine;
