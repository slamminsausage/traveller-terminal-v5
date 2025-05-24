class AudioManager {
  constructor() {
    this.sounds = {};
    this.ambientSound = null;
    this.isMuted = false;
  }

  preloadSounds() {
    // Ambient sounds
    const ambientSounds = {
      'normal': '/audio/terminal-hum.mp3',
      'corrupted': '/audio/static-hum.mp3',
      'secure': '/audio/server-room.mp3',
      'damaged': '/audio/electrical-sparks.mp3',
      'interference': '/audio/signal-interference.mp3'
    };

    // Effect sounds
    const effectSounds = {
      'keypress': '/audio/mechanical-key.mp3',
      'access_granted': '/audio/success-chime.mp3',
      'access_denied': '/audio/error-buzz.mp3',
      'corruption': '/audio/data-corruption.mp3',
      'glitch': '/audio/glitch-sound.mp3',
      'warning': '/audio/warning-beep.mp3',
      'connection_lost': '/audio/connection-lost.mp3',
      'typing': '/audio/typing-sound.mp3'
    };

    // Preload all sounds
    Object.entries({...ambientSounds, ...effectSounds}).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds[key] = audio;
    });
  }

  playAmbient(type = 'normal', volume = 0.3) {
    if (this.isMuted) return;
    
    // Stop current ambient sound
    if (this.ambientSound) {
      this.ambientSound.pause();
      this.ambientSound.currentTime = 0;
    }

    // Play new ambient sound
    if (this.sounds[type]) {
      this.ambientSound = this.sounds[type];
      this.ambientSound.volume = volume;
      this.ambientSound.loop = true;
      this.ambientSound.play().catch(e => console.log('Ambient sound blocked:', e));
    }
  }

  stopAmbient() {
    if (this.ambientSound) {
      this.ambientSound.pause();
      this.ambientSound.currentTime = 0;
      this.ambientSound = null;
    }
  }

  playEffect(effect, volume = 0.5) {
    if (this.isMuted) return;
    
    if (this.sounds[effect]) {
      const sound = this.sounds[effect].cloneNode();
      sound.volume = volume;
      sound.play().catch(e => console.log('Effect sound blocked:', e));
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ambientSound) {
      this.ambientSound.pause();
    } else if (!this.isMuted && this.ambientSound) {
      this.ambientSound.play();
    }
    return this.isMuted;
  }

  setVolume(volume) {
    if (this.ambientSound) {
      this.ambientSound.volume = volume;
    }
  }
}

export default new AudioManager();