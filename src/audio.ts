class AudioEngine {
  ctx: AudioContext | null = null;
  bgmInterval: number | null = null;
  isPlayingBgm: boolean = false;
  bgmGain: GainNode | null = null;
  initialized: boolean = false;
  isMuted: boolean = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain) {
      this.bgmGain.gain.setTargetAtTime(muted ? 0 : 0.03, this.ctx ? this.ctx.currentTime : 0, 0.1);
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
      
      osc.type = 'sine';
      const now = this.ctx.currentTime + 0.02; // Small lookahead
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch (e) {
      // Ignore audio errors silently
    }
  }

  playKey() {
    if (!this.ctx || this.isMuted) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      const now = this.ctx.currentTime + 0.02; // Small lookahead
      // Bubble sound: fast frequency sweep up, slightly lower than coin
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch (e) {
      // Ignore audio errors silently
    }
  }

  playBGM() {
    if (this.isPlayingBgm || !this.ctx) return;
    this.isPlayingBgm = true;
    
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.03; // Master BGM volume - kept low so it's strictly background
      this.bgmGain.connect(this.ctx.destination);
      
      // A simple repeating chord progression arpeggio (Am -> Dm)
      const notes = [
        220.00, 261.63, 329.63, 261.63, // A3, C4, E4, C4
        293.66, 349.23, 440.00, 349.23  // D4, F4, A4, F4
      ];
      let noteIndex = 0;
      
      // Scheduling ahead is more robust than strict setTimeout to avoid jitter
      let nextNoteTime = this.ctx.currentTime + 0.1;
      
      const scheduleNotes = () => {
        if (!this.isPlayingBgm || !this.ctx || !this.bgmGain) return;
        
        // CRITICAL FIX: If tab was suspended, setTimeout falls behind.
        // Clamp nextNoteTime to be at least currentTime to prevent queuing thousands of notes instantly (which breaks the audio context)
        if (nextNoteTime < this.ctx.currentTime) {
          nextNoteTime = this.ctx.currentTime + 0.05;
        }
        
        // Schedule notes for the next 0.5 seconds
        while (nextNoteTime < this.ctx.currentTime + 0.5) {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          
          osc.connect(noteGain);
          noteGain.connect(this.bgmGain);
          
          osc.type = 'triangle';
          const freq = notes[noteIndex];
          noteIndex = (noteIndex + 1) % notes.length;
          
          osc.frequency.setValueAtTime(freq, nextNoteTime);
          
          noteGain.gain.setValueAtTime(0.2, nextNoteTime);
          noteGain.gain.linearRampToValueAtTime(0, nextNoteTime + 0.2);
          
          osc.start(nextNoteTime);
          osc.stop(nextNoteTime + 0.2);
          
          // Clean up to prevent memory leaks in some browsers
          osc.onended = () => {
            osc.disconnect();
            noteGain.disconnect();
          };
          
          nextNoteTime += 0.25; // 250ms per note
        }
        
        this.bgmInterval = window.setTimeout(scheduleNotes, 100);
      };
      
      scheduleNotes();
    } catch (e) {
      // Ignore audio errors silently
    }
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmInterval) {
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

export const audioEngine = new AudioEngine();
