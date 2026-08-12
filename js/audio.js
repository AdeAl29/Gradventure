/**
 * ============================================
 * GRADVENTURE — Audio Manager
 * ============================================
 * 
 * Handles background music and sound effects.
 * Gracefully falls back if audio files are missing.
 */

const AudioManager = (() => {
  let musicElement = null;
  let musicEnabled = true;
  let sfxEnabled = true;
  let musicVolume = 0.4;
  let sfxVolume = 0.6;
  let initialized = false;
  
  // Cache for SFX audio elements
  const sfxCache = {};
  
  /**
   * Initialize audio manager and restore settings
   */
  function init() {
    if (initialized) return;
    initialized = true;
    
    // Restore settings from storage
    musicEnabled = Storage.load('musicEnabled', true);
    sfxEnabled = Storage.load('sfxEnabled', true);
    
    // Create music element
    musicElement = new Audio();
    musicElement.loop = true;
    musicElement.volume = musicVolume;
    musicElement.preload = 'auto';
    
    // Handle music load error gracefully
    musicElement.addEventListener('error', () => {
      console.warn('[Audio] Background music file not found. Add your music file to:', CONFIG.MUSIC_URL);
    });
    
    // Try to set source
    if (CONFIG.MUSIC_URL) {
      musicElement.src = CONFIG.MUSIC_URL;
    }
  }
  
  /**
   * Play background music
   */
  async function playMusic() {
    if (!initialized) init();
    if (!musicEnabled || !musicElement) return;
    
    try {
      musicElement.volume = musicVolume;
      await musicElement.play();
    } catch (e) {
      // Autoplay blocked or file missing — this is expected
      console.warn('[Audio] Music play failed (autoplay policy or missing file)');
    }
  }
  
  /**
   * Stop background music
   */
  function stopMusic() {
    if (musicElement) {
      musicElement.pause();
      musicElement.currentTime = 0;
    }
  }
  
  /**
   * Pause background music
   */
  function pauseMusic() {
    if (musicElement) {
      musicElement.pause();
    }
  }
  
  /**
   * Toggle music on/off
   * @returns {boolean} New state
   */
  function toggleMusic() {
    musicEnabled = !musicEnabled;
    Storage.save('musicEnabled', musicEnabled);
    
    if (musicEnabled) {
      playMusic();
    } else {
      pauseMusic();
    }
    
    return musicEnabled;
  }
  
  /**
   * Play a sound effect
   * @param {string} name - SFX name from CONFIG.SFX
   */
  function playSFX(name) {
    if (!sfxEnabled) return;
    if (!CONFIG.SFX || !CONFIG.SFX[name]) return;
    
    try {
      // Create or reuse audio element
      if (!sfxCache[name]) {
        sfxCache[name] = new Audio();
        sfxCache[name].addEventListener('error', () => {
          // Silently fail for missing SFX
        });
        sfxCache[name].src = CONFIG.SFX[name];
      }
      
      const sfx = sfxCache[name];
      sfx.volume = sfxVolume;
      sfx.currentTime = 0;
      sfx.play().catch(() => {
        // Silently fail
      });
    } catch (e) {
      // Silently fail
    }
  }
  
  /**
   * Toggle SFX on/off
   * @returns {boolean} New state
   */
  function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    Storage.save('sfxEnabled', sfxEnabled);
    return sfxEnabled;
  }
  
  /**
   * Set music volume
   * @param {number} vol - 0.0 to 1.0
   */
  function setMusicVolume(vol) {
    musicVolume = clamp(vol, 0, 1);
    if (musicElement) {
      musicElement.volume = musicVolume;
    }
  }
  
  /**
   * Set SFX volume
   * @param {number} vol - 0.0 to 1.0
   */
  function setSFXVolume(vol) {
    sfxVolume = clamp(vol, 0, 1);
  }
  
  /**
   * Get current states
   */
  function isMusicEnabled() { return musicEnabled; }
  function isSFXEnabled() { return sfxEnabled; }
  function isMusicPlaying() {
    return musicElement && !musicElement.paused;
  }
  
  /**
   * Change background music track
   * @param {string} url - Path to music file
   */
  function changeMusicTrack(url) {
    if (!initialized) init();
    if (musicElement) {
      const wasPlaying = !musicElement.paused;
      musicElement.pause();
      musicElement.src = url;
      if (wasPlaying && musicEnabled) {
        playMusic();
      }
    }
  }
  
  return {
    init,
    playMusic,
    stopMusic,
    pauseMusic,
    toggleMusic,
    playSFX,
    toggleSFX,
    setMusicVolume,
    setSFXVolume,
    isMusicEnabled,
    isSFXEnabled,
    isMusicPlaying,
    changeMusicTrack,
  };
})();
