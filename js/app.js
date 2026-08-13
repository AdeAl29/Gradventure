/**
 * ============================================
 * GRADVENTURE — Main Application
 * ============================================
 * 
 * Orchestrates the entire experience:
 * State machine, screen transitions, event
 * binding, initialization sequence.
 */

const App = (() => {
  // ─── Application States ─────────────────
  const STATES = {
    LOADING: 'LOADING',
    LANDING: 'LANDING',
    NAME_INPUT: 'NAME_INPUT',
    GAME: 'GAME',
    CHEST_NEAR: 'CHEST_NEAR',
    CHEST_OPENING: 'CHEST_OPENING',
    ENVELOPE: 'ENVELOPE',
    INVITATION: 'INVITATION',
    FINISHED: 'FINISHED',
  };
  
  let currentState = STATES.LOADING;
  let playerName = '';
  let playerGender = 'male';
  let gameInitialized = false;
  let questAccepted = false;
  
  // ─── DOM Elements ──────────────────────
  let screens = {};
  let cinematicOverlay;
  
  /**
   * Initialize the application
   */
  function init() {
    // Cache DOM elements
    screens = {
      loading: $('#loading-screen'),
      landing: $('#landing-screen'),
      name: $('#name-screen'),
      game: $('#game-screen'),
      chestOverlay: $('#chest-overlay'),
      envelope: $('#envelope-overlay'),
      invitation: $('#invitation-screen'),
    };
    cinematicOverlay = $('#cinematic-overlay');
    
    // Apply custom theme from config
    applyTheme();
    
    // Initialize audio
    AudioManager.init();
    
    // Create landing particles
    createLandingParticles();
    
    // Bind events
    bindEvents();
    
    // Check for saved state
    checkSavedState();
    
    // Render gender previews
    renderGenderPreviews();
    
    // Start loading sequence
    startLoading();
  }
  
  /**
   * Apply custom theme from CONFIG
   */
  function applyTheme() {
    if (CONFIG.UI_THEME) {
      const root = document.documentElement;
      Object.entries(CONFIG.UI_THEME).forEach(([key, value]) => {
        if (value) root.style.setProperty(key, value);
      });
    }
  }
  
  /**
   * Create floating particles on landing/name screens
   */
  function createLandingParticles() {
    const containers = $$('.landing-particles');
    containers.forEach(container => {
      for (let i = 0; i < 25; i++) {
        const particle = createElement('div', { className: 'landing-particle' });
        particle.style.left = `${randomRange(5, 95)}%`;
        particle.style.animationDelay = `${randomRange(0, 6)}s`;
        particle.style.animationDuration = `${randomRange(4, 8)}s`;
        particle.style.width = `${randomRange(2, 4)}px`;
        particle.style.height = particle.style.width;
        particle.style.opacity = String(randomRange(0.2, 0.5));
        container.appendChild(particle);
      }
    });
  }
  
  /**
   * Simulate loading and transition to landing
   */
  async function startLoading() {
    const loadingBar = $('.loading-bar');
    
    // Simulate loading progress
    let progress = 0;
    const loadInterval = setInterval(() => {
      progress += randomRange(5, 15);
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadInterval);
      }
      if (loadingBar) loadingBar.style.width = `${progress}%`;
    }, 150);
    
    // Wait for "loading" to complete
    await wait(1800);
    
    // Check saved state to jump directly
    const savedState = Storage.load('appState');
    if (savedState) {
      if (savedState === STATES.INVITATION || savedState === STATES.FINISHED) {
        transitionTo(STATES.INVITATION, true);
        return;
      } else if (savedState === STATES.GAME || savedState === STATES.CHEST_NEAR) {
        startGame(true);
        return;
      } else if (savedState === STATES.ENVELOPE || savedState === STATES.CHEST_OPENING) {
        transitionTo(STATES.ENVELOPE, true);
        return;
      } else if (savedState === STATES.NAME_INPUT) {
        transitionTo(STATES.NAME_INPUT, true);
        return;
      }
    }
    
    // Transition to landing
    transitionTo(STATES.LANDING);
  }
  
  /**
   * Check if there's a saved game state
   */
  function checkSavedState() {
    const savedName = Storage.load('playerName');
    const savedGender = Storage.load('playerGender');
    const finished = Storage.load('finished', false);
    
    if (savedGender) {
      playerGender = savedGender;
    }
    
    if (savedName) {
      playerName = savedName;
      // We'll show a "Continue" option on landing
      const landingBtn = $('#landing-enter-btn');
      if (landingBtn && finished) {
        // Add continue option after landing shows
        setTimeout(() => {
          const continueInfo = createElement('p', {
            className: 'landing-description',
            innerHTML: `Welcome back, <strong>${escapeHtml(savedName)}</strong>`,
          });
          continueInfo.style.animation = 'fade-in-up 0.6s var(--ease-out) forwards';
          continueInfo.style.marginTop = '-16px';
          continueInfo.style.marginBottom = '8px';
          continueInfo.style.fontSize = 'var(--fs-sm)';
          
          landingBtn.parentElement.insertBefore(continueInfo, landingBtn);
        }, 1500);
      }
    }
  }
  
  /**
   * Bind all event listeners
   */
  function bindEvents() {
    // ── Landing: Enter Experience ──
    const enterBtn = $('#landing-enter-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        AudioManager.playSFX('click');
        transitionTo(STATES.NAME_INPUT);
      });
    }
    
    // ── Name Input: Submit ──
    const nameForm = $('#name-form');
    const nameInput = $('#name-input');
    const nameError = $('#name-error');
    
    if (nameForm) {
      nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        
        if (!name) {
          nameError.classList.add('show');
          nameInput.focus();
          return;
        }
        
        nameError.classList.remove('show');
        playerName = name;
        Storage.save('playerName', playerName);
        Storage.save('playerGender', playerGender);
        
        AudioManager.playSFX('click');
        startGame();
      });
    }
    
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) {
          nameError.classList.remove('show');
        }
      });
    }
    
    // ── Gender Selection ──
    const genderCards = document.querySelectorAll('.gender-card');
    genderCards.forEach(card => {
      card.addEventListener('click', () => {
        genderCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        playerGender = card.dataset.gender;
        AudioManager.playSFX('click');
      });
    });
    

    // ── Settings Button ──
    const settingsBtn = $('#settings-btn');
    const settingsModal = $('#settings-modal');
    const settingsBackdrop = $('#settings-backdrop');
    const settingsCloseBtn = $('#settings-close');
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        AudioManager.playSFX('click');
      });
    }
    
    if (settingsBackdrop) {
      settingsBackdrop.addEventListener('click', () => {
        settingsModal.classList.remove('active');
      });
    }
    
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
      });
    }
    
    // Settings toggles
    const musicSettingToggle = $('#music-setting-toggle');
    if (musicSettingToggle) {
      musicSettingToggle.classList.toggle('on', AudioManager.isMusicEnabled());
      musicSettingToggle.addEventListener('click', () => {
        const isPlaying = AudioManager.toggleMusic();
        musicSettingToggle.classList.toggle('on', isPlaying);
        // Also update floating toggle
        const mt = $('#music-toggle');
        if (mt) {
          mt.textContent = isPlaying ? '♪' : '♪̸';
          mt.classList.toggle('playing', isPlaying);
        }
      });
    }
    
    const sfxSettingToggle = $('#sfx-setting-toggle');
    if (sfxSettingToggle) {
      sfxSettingToggle.classList.toggle('on', AudioManager.isSFXEnabled());
      sfxSettingToggle.addEventListener('click', () => {
        const enabled = AudioManager.toggleSFX();
        sfxSettingToggle.classList.toggle('on', enabled);
      });
    }
    
    // Settings actions
    const restartBtn = $('#settings-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        restartGame();
      });
    }
    
    const backToTitleBtn = $('#settings-back-title');
    if (backToTitleBtn) {
      backToTitleBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        Game.stop();
        transitionTo(STATES.LANDING);
      });
    }
    
    // ── Chest Interaction (keyboard) ──
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'e' || e.key === 'E') && currentState === STATES.CHEST_NEAR) {
        openChest();
      }
    });
    
    // ── Chest Interaction (mobile tap) ──
    const interactBtn = $('#mobile-interact');
    if (interactBtn) {
      interactBtn.addEventListener('click', () => {
        if (currentState === STATES.CHEST_NEAR) {
          openChest();
        }
      });
    }

    const questAcceptBtn = $('#quest-accept-btn');
    if (questAcceptBtn) {
      questAcceptBtn.addEventListener('click', () => {
        questAccepted = true;
        $('#quest-overlay')?.classList.remove('visible');
        Game.setInputLocked(false);
        AudioManager.playSFX('click');
        showGameInstruction();
      });
    }
    
    // ── Chest Overlay: Open Invitation ──
    const openInvBtn = $('#open-invitation-btn');
    if (openInvBtn) {
      openInvBtn.addEventListener('click', () => {
        AudioManager.playSFX('invitationOpen');
        launchConfetti();
        setTimeout(() => transitionTo(STATES.ENVELOPE), 1150);
      });
    }
    
    // ── Envelope: Click to open ──
    const envelopeContainer = $('#envelope-container');
    if (envelopeContainer) {
      envelopeContainer.addEventListener('click', () => {
        envelopeContainer.classList.add('open');
        AudioManager.playSFX('success');
        
        // After envelope animation, show invitation
        setTimeout(() => {
          transitionTo(STATES.INVITATION);
        }, 1200);
      });
    }
    
    // ── Dynamic event binding for invitation buttons ──
    // (These are created dynamically by Invitation.build)
    document.addEventListener('click', (e) => {
      if (e.target.id === 'replay-btn') {
        AudioManager.playSFX('click');
        restartGame();
      }
      if (e.target.id === 'back-to-invitation-btn') {
        AudioManager.playSFX('click');
        const invScreen = $('#invitation-screen');
        if (invScreen) invScreen.scrollTop = 0;
      }
    });
  }
  
  /**
   * Start the game after name input
   */
  async function startGame(isRestore = false) {
    if (!isRestore) {
      // Cinematic transition
      cinematicOverlay.classList.add('active');
      await wait(600);
    }
    
    // Hide name screen, show game screen
    hideAllScreens();
    
    // Initialize game if not already done
    if (!gameInitialized) {
      const canvas = $('#game-canvas');
      Game.init(canvas, {
        restore: isRestore,
        gender: playerGender,
        onChestNear: () => {
          currentState = STATES.CHEST_NEAR;
          showChestPrompt();
        },
        onChestLeave: () => {
          if (currentState === STATES.CHEST_NEAR) {
            currentState = STATES.GAME;
            hideChestPrompt();
          }
        },
        onProgressUpdate: (progress, playerX) => {
          updateHUD(progress);
          Storage.save('gameProgressX', playerX);
        },
        onSignboard: (text) => showSignboard(text),
      });
      gameInitialized = true;
    } else {
      Game.reset();
    }
    
    // Update HUD with player name
    const hudNameEl = $('#hud-name');
    if (hudNameEl) hudNameEl.textContent = playerName;
    
    // Show game screen
    screens.game.classList.add('active');
    currentState = STATES.GAME;
    
    // Show mobile controls if touch device
    if (isTouchDevice()) {
      const mobileControls = $('#mobile-controls');
      if (mobileControls) mobileControls.classList.add('visible');
    }
    
    // Render immediately, but keep the player still until the quest is accepted.
    Game.setInputLocked(!isRestore && !questAccepted);
    Game.start();
    
    // Play music
    AudioManager.playMusic();
    
    if (!isRestore) {
      // Remove cinematic overlay
      await wait(300);
      cinematicOverlay.classList.remove('active');
      
      // The quest overlay pauses movement until accepted.
      const quest = $('#quest-overlay');
      const questMessage = $('#quest-message');
      if (questMessage) questMessage.textContent = `Halo ${playerName}! Undangan wisudamu disembunyikan di dalam Peti Emas di ujung jalan. Lewati rintangan dan temukan petinya!`;
      if (quest) {
        playQuestSwoosh();
        quest.classList.add('visible');
      }
    } else {
      cinematicOverlay.classList.remove('active');
    }
    
    // Save state
    Storage.save('appState', currentState);
  }
  
  /**
   * Show game instruction overlay
   */
  async function showGameInstruction() {
    const instruction = $('#game-instruction');
    if (!instruction) return;
    
    // Set text based on device
    instruction.textContent = isTouchDevice()
      ? 'Gunakan tombol ◀ ▶ untuk bergerak, ▲ untuk loncat'
      : 'Gunakan ← dan → untuk bergerak, Spasi/↑ untuk loncat';
    
    instruction.style.display = 'block';
    instruction.classList.remove('fade-out');
    
    // Auto-hide after 4 seconds
    await wait(4000);
    instruction.classList.add('fade-out');
    await wait(500);
    instruction.style.display = 'none';
  }
  
  /**
   * Show chest interaction prompt
   */
  function showChestPrompt() {
    const prompt = $('#chest-prompt');
    if (prompt) prompt.classList.add('visible');
    
    const interactBtn = $('#mobile-interact');
    if (interactBtn && isTouchDevice()) {
      interactBtn.classList.add('visible');
    }
  }
  
  /**
   * Hide chest interaction prompt
   */
  function hideChestPrompt() {
    const prompt = $('#chest-prompt');
    if (prompt) prompt.classList.remove('visible');
    
    const interactBtn = $('#mobile-interact');
    if (interactBtn) interactBtn.classList.remove('visible');
  }

  function showSignboard(text) {
    const toast = $('#signboard-toast');
    const label = $('#signboard-text');
    if (!toast || !label) return;
    label.textContent = text;
    toast.classList.add('visible');
    clearTimeout(showSignboard.timer);
    showSignboard.timer = setTimeout(() => toast.classList.remove('visible'), 4200);
  }

  function launchConfetti() {
    const layer = $('#confetti-layer');
    if (!layer) return;
    layer.innerHTML = '';
    const colors = ['#e8b84a', '#f07070', '#75b9e6', '#a9d66f', '#f5d9a6', '#d58ae0'];
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * .45}s`;
      piece.style.animationDuration = `${1.2 + Math.random() * 1.1}s`;
      piece.style.setProperty('--drift', `${-160 + Math.random() * 320}px`);
      layer.appendChild(piece);
    }
    setTimeout(() => { layer.innerHTML = ''; }, 2600);
  }

  // A tiny Web Audio fallback keeps the parchment reveal audible even when
  // an optional external swoosh asset has not been configured.
  function playQuestSwoosh() {
    if (!AudioManager.isSFXEnabled()) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(760, audioContext.currentTime + .42);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2600, audioContext.currentTime + .42);
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.12, audioContext.currentTime + .06);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .48);
      oscillator.connect(filter).connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + .5);
      oscillator.addEventListener('ended', () => audioContext.close());
    } catch (e) { /* Audio is an enhancement; the quest still opens silently. */ }
  }
  
  /**
   * Open the chest — trigger animation sequence
   */
  async function openChest() {
    currentState = STATES.CHEST_OPENING;
    hideChestPrompt();
    
    // Game side: stop player, zoom, particles
    Game.openChest();
    AudioManager.playSFX('chestOpen');
    
    // Wait for visual effect
    await wait(1200);
    
    // Show chest overlay
    Game.stop();
    screens.chestOverlay.classList.add('active');
    
    AudioManager.playSFX('success');
  }
  
  /**
   * Update HUD with progress
   */
  function updateHUD(progress) {
    const progressText = $('#hud-progress-text');
    const progressFill = $('#hud-progress-fill');
    
    if (progressText) progressText.textContent = `${progress}%`;
    if (progressFill) progressFill.style.width = `${progress}%`;
  }
  
  /**
   * Transition between states/screens
   */
  async function transitionTo(newState, isRestore = false) {
    const prevState = currentState;
    currentState = newState;
    
    // Save current state
    Storage.save('appState', newState);
    
    switch (newState) {
      case STATES.LANDING:
        hideAllScreens();
        screens.landing.classList.add('active');
        break;
        
      case STATES.NAME_INPUT:
        if (!isRestore) {
          cinematicOverlay.classList.add('active');
          await wait(500);
        }
        hideAllScreens();
        screens.name.classList.add('active');
        if (!isRestore) {
          await wait(100);
        }
        cinematicOverlay.classList.remove('active');
        // Pre-fill name if saved
        const nameInput = $('#name-input');
        if (nameInput && playerName) {
          nameInput.value = playerName;
        }
        if (nameInput) nameInput.focus();
        break;
        
      case STATES.ENVELOPE:
        hideAllScreens();
        // Reset envelope state
        const envContainer = $('#envelope-container');
        if (envContainer) envContainer.classList.remove('open');
        screens.envelope.classList.add('active');
        AudioManager.playSFX('transition');
        break;
        
      case STATES.INVITATION:
        if (!isRestore) {
          cinematicOverlay.classList.add('active');
          await wait(500);
        }
        hideAllScreens();
        
        // Build invitation content
        Invitation.build(playerName);
        
        // Make invitation screen scrollable
        screens.invitation.classList.add('active');
        document.body.style.overflow = 'auto';
        
        if (!isRestore) {
          await wait(100);
        }
        cinematicOverlay.classList.remove('active');
        
        // Mark as finished
        Storage.save('finished', true);
        
        if (!isRestore) AudioManager.playSFX('success');
        break;
    }
  }
  
  /**
   * Hide all screens
   */
  function hideAllScreens() {
    Object.values(screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Restart the game from scratch
   */
  async function restartGame() {
    // Clear saved states
    Storage.save('appState', STATES.NAME_INPUT);
    Storage.save('finished', false);
    Storage.save('gameProgressX', 100);
    questAccepted = false;
    
    Invitation.destroy();
    
    cinematicOverlay.classList.add('active');
    await wait(500);
    
    hideAllScreens();
    
    // Reset game
    if (gameInitialized) {
      Game.reset();
    }
    
    // Reset state
    currentState = STATES.NAME_INPUT;
    
    screens.name.classList.add('active');
    await wait(100);
    cinematicOverlay.classList.remove('active');
    
    const nameInput = $('#name-input');
    if (nameInput) {
      nameInput.value = playerName;
      nameInput.focus();
    }
  }
  
  /**
   * Escape HTML for safe insertion
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
  
  /**
   * Render character previews on gender selection canvases
   */
  function renderGenderPreviews() {
    const maleCanvas = document.getElementById('preview-male');
    const femaleCanvas = document.getElementById('preview-female');
    
    if (maleCanvas) {
      const ctx = maleCanvas.getContext('2d');
      const tempPlayer = new Player(40, 100, 'male');
      tempPlayer.y = 100 - tempPlayer.height;
      tempPlayer.direction = 1;
      ctx.clearRect(0, 0, 80, 120);
      tempPlayer.draw(ctx);
    }
    
    if (femaleCanvas) {
      const ctx = femaleCanvas.getContext('2d');
      const tempPlayer = new Player(40, 100, 'female');
      tempPlayer.y = 100 - tempPlayer.height;
      tempPlayer.direction = 1;
      ctx.clearRect(0, 0, 80, 120);
      tempPlayer.draw(ctx);
    }
  }
  
  return { init };
})();

// ─── Start Application ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
