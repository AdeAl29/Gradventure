/**
 * ============================================
 * GRADVENTURE — Invitation Builder
 * ============================================
 * 
 * Builds the invitation DOM from config data.
 * Handles countdown timer, gallery, RSVP.
 */

const Invitation = (() => {
  let countdownInterval = null;
  let playerName = '';
  
  /**
   * Build the entire invitation DOM
   * @param {string} name - User's name from input
   */
  function build(name) {
    playerName = name;
    const container = $('#invitation-content');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Build all sections
    container.appendChild(buildHeader());
    container.appendChild(buildEventDetails());
    container.appendChild(buildCountdown());
    container.appendChild(buildStory());
    container.appendChild(buildGallery());
    container.appendChild(buildThankYou());
    container.appendChild(buildLocation());
    container.appendChild(buildDressCode());
    container.appendChild(buildRSVP());
    container.appendChild(buildFinal());
    
    // Start countdown
    startCountdown();
    
    // Initialize scroll reveal after a tick
    setTimeout(initScrollReveal, 100);
  }
  
  /**
   * Build invitation header section
   */
  function buildHeader() {
    const section = createElement('section', { className: 'invitation-header' });
    
    section.innerHTML = `
      <p class="invitation-for reveal">A special invitation for <strong>${escapeHtml(playerName)}</strong></p>
      <h2 class="invitation-you-are-invited text-shimmer reveal reveal-delay-1">YOU ARE INVITED</h2>
      <h1 class="invitation-main-title reveal reveal-delay-2">Graduation Celebration</h1>
      <div class="divider-ornament reveal reveal-delay-2">✦</div>
      <p class="invitation-message reveal reveal-delay-3">
        Dengan penuh rasa syukur dan bahagia,<br>
        kami mengundang Anda untuk hadir<br>
        dalam acara wisuda
      </p>
      <div class="profile-photo-container reveal reveal-delay-3">
        <div class="profile-photo-ring"></div>
        <div class="profile-photo-placeholder" id="profile-photo">🎓</div>
      </div>
      <h2 class="graduate-name-display reveal reveal-delay-4">${escapeHtml(CONFIG.GRADUATE_NAME)}</h2>
      <p class="graduate-title-display reveal reveal-delay-4">${escapeHtml(CONFIG.GRADUATE_TITLE)}</p>
      <p class="graduate-university reveal reveal-delay-4">${escapeHtml(CONFIG.GRADUATE_UNIVERSITY)} — ${escapeHtml(CONFIG.GRADUATE_FACULTY)}</p>
    `;
    
    // Try to load profile image
    tryLoadProfileImage(section);
    
    return section;
  }
  
  /**
   * Attempt to load profile image, fallback to placeholder
   */
  function tryLoadProfileImage(container) {
    if (!CONFIG.PROFILE_IMAGE) return;
    
    const img = new Image();
    img.onload = () => {
      const photoEl = container.querySelector('#profile-photo');
      if (photoEl) {
        const imgEl = createElement('img', {
          className: 'profile-photo',
          src: CONFIG.PROFILE_IMAGE,
          alt: CONFIG.GRADUATE_NAME,
        });
        photoEl.replaceWith(imgEl);
      }
    };
    img.onerror = () => {
      // Keep placeholder — this is fine
    };
    img.src = CONFIG.PROFILE_IMAGE;
  }
  
  /**
   * Build event details card
   */
  function buildEventDetails() {
    const section = createElement('section', { className: 'event-details-section' });
    
    section.innerHTML = `
      <div class="event-card reveal">
        <div class="event-card-icon">🎓</div>
        <h3 class="event-card-title">Graduation Ceremony</h3>
        <div class="event-detail-row">
          <div class="event-detail-icon">📅</div>
          <div class="event-detail-content">
            <div class="event-detail-label">Tanggal</div>
            <div class="event-detail-value">${escapeHtml(formatDate(CONFIG.EVENT_DATE))}</div>
          </div>
        </div>
        <div class="event-detail-row">
          <div class="event-detail-icon">📆</div>
          <div class="event-detail-content">
            <div class="event-detail-label">Hari</div>
            <div class="event-detail-value">${escapeHtml(CONFIG.EVENT_DAY)}</div>
          </div>
        </div>
        <div class="event-detail-row">
          <div class="event-detail-icon">🕐</div>
          <div class="event-detail-content">
            <div class="event-detail-label">Waktu</div>
            <div class="event-detail-value">${escapeHtml(CONFIG.EVENT_TIME)} — ${escapeHtml(CONFIG.EVENT_END_TIME)}</div>
          </div>
        </div>
        <div class="event-detail-row">
          <div class="event-detail-icon">📍</div>
          <div class="event-detail-content">
            <div class="event-detail-label">Lokasi</div>
            <div class="event-detail-value">${escapeHtml(CONFIG.VENUE)}</div>
          </div>
        </div>
        <div class="event-detail-row">
          <div class="event-detail-icon">🏛️</div>
          <div class="event-detail-content">
            <div class="event-detail-label">Alamat</div>
            <div class="event-detail-value">${escapeHtml(CONFIG.ADDRESS)}</div>
          </div>
        </div>
      </div>
    `;
    
    return section;
  }
  
  /**
   * Build countdown section
   */
  function buildCountdown() {
    const section = createElement('section', { className: 'countdown-section' });
    
    section.innerHTML = `
      <h3 class="countdown-title reveal">Counting Down</h3>
      <div class="countdown-grid reveal reveal-delay-1" id="countdown-grid">
        <div class="countdown-item">
          <div class="countdown-number" id="cd-days">00</div>
          <div class="countdown-label">Days</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-number" id="cd-hours">00</div>
          <div class="countdown-label">Hours</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-number" id="cd-minutes">00</div>
          <div class="countdown-label">Minutes</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-number" id="cd-seconds">00</div>
          <div class="countdown-label">Seconds</div>
        </div>
      </div>
      <div id="countdown-finished" class="countdown-finished" style="display:none;"></div>
    `;
    
    return section;
  }
  
  /**
   * Start countdown timer
   */
  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    function updateCountdown() {
      const eventDate = new Date(CONFIG.EVENT_DATE + 'T' + (CONFIG.EVENT_TIME.replace(' WIB', '').replace(' WITA', '').replace(' WIT', '') || '09:00'));
      const now = new Date();
      const diff = eventDate - now;
      
      if (diff <= 0) {
        // Event has passed or is today
        const grid = $('#countdown-grid');
        const finished = $('#countdown-finished');
        if (grid) grid.style.display = 'none';
        if (finished) {
          finished.style.display = 'block';
          finished.textContent = 'Today is the day! 🎓';
        }
        clearInterval(countdownInterval);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const daysEl = $('#cd-days');
      const hoursEl = $('#cd-hours');
      const minutesEl = $('#cd-minutes');
      const secondsEl = $('#cd-seconds');
      
      if (daysEl) daysEl.textContent = padZero(days);
      if (hoursEl) hoursEl.textContent = padZero(hours);
      if (minutesEl) minutesEl.textContent = padZero(minutes);
      if (secondsEl) secondsEl.textContent = padZero(seconds);
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }
  
  /**
   * Build story/timeline section
   */
  function buildStory() {
    const section = createElement('section', { className: 'story-section' });
    
    const timelineCards = CONFIG.STORY_ITEMS.map((item, i) => `
      <div class="timeline-card reveal reveal-delay-${i + 1}">
        <div class="timeline-number">${escapeHtml(item.number)}</div>
        <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
        <p class="timeline-desc">${escapeHtml(item.description)}</p>
      </div>
    `).join('');
    
    section.innerHTML = `
      <h3 class="story-title reveal">Every Journey Has a Beginning</h3>
      <p class="story-subtitle reveal reveal-delay-1">
        Perjalanan ini dimulai dari langkah kecil,<br>
        hari-hari panjang,<br>
        tantangan,<br>
        dan mimpi yang terus dikejar.
      </p>
      <div class="divider reveal reveal-delay-1"></div>
      <div class="timeline">
        ${timelineCards}
      </div>
    `;
    
    return section;
  }
  
  /**
   * Build photo gallery
   */
  function buildGallery() {
    const section = createElement('section', { className: 'gallery-section' });
    
    // Desktop grid
    const gridItems = CONFIG.GALLERY_IMAGES.map((img, i) => `
      <div class="gallery-item reveal reveal-delay-${Math.min(i + 1, 4)}">
        <div class="gallery-placeholder" data-src="${escapeHtml(img.src)}">📷</div>
        <div class="gallery-item-overlay">
          <span class="gallery-item-caption">${escapeHtml(img.caption)}</span>
        </div>
      </div>
    `).join('');
    
    // Mobile swipe
    const swipeItems = CONFIG.GALLERY_IMAGES.map((img) => `
      <div class="gallery-swipe-item">
        <div class="gallery-placeholder" data-src="${escapeHtml(img.src)}">📷</div>
      </div>
    `).join('');
    
    section.innerHTML = `
      <h3 class="section-title reveal">Gallery</h3>
      <p class="section-subtitle reveal">Moments to Remember</p>
      <div class="gallery-grid">${gridItems}</div>
      <div class="gallery-swipe">${swipeItems}</div>
    `;
    
    // Try to load gallery images
    setTimeout(() => tryLoadGalleryImages(section), 100);
    
    return section;
  }
  
  /**
   * Try to load gallery images, keep placeholder if failed
   */
  function tryLoadGalleryImages(container) {
    const placeholders = container.querySelectorAll('.gallery-placeholder[data-src]');
    placeholders.forEach(placeholder => {
      const src = placeholder.dataset.src;
      const img = new Image();
      img.onload = () => {
        const imgEl = createElement('img', { src, alt: 'Gallery photo' });
        placeholder.replaceWith(imgEl);
      };
      img.onerror = () => { /* Keep placeholder */ };
      img.src = src;
    });
  }
  
  /**
   * Build thank you section
   */
  function buildThankYou() {
    const section = createElement('section', { className: 'thankyou-section' });
    
    section.innerHTML = `
      <div class="thankyou-card reveal">
        <h3 class="thankyou-title">Thank You</h3>
        <div class="divider"></div>
        <p class="thankyou-message">${escapeHtml(CONFIG.THANK_YOU_MESSAGE)}</p>
        <p class="thankyou-signature">${escapeHtml(CONFIG.GRADUATE_NAME)}</p>
      </div>
    `;
    
    return section;
  }
  
  /**
   * Build location section
   */
  function buildLocation() {
    const section = createElement('section', { className: 'location-section' });
    
    section.innerHTML = `
      <h3 class="section-title reveal">See You There</h3>
      <p class="section-subtitle reveal">Lokasi Acara</p>
      <div class="location-card reveal reveal-delay-1">
        <h4 class="location-venue">${escapeHtml(CONFIG.VENUE)}</h4>
        <p class="location-address">${escapeHtml(CONFIG.ADDRESS)}</p>
        <a href="${escapeHtml(CONFIG.GOOGLE_MAP_URL)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary location-map-btn" aria-label="Open Google Maps">
          📍 Open Google Maps
        </a>
      </div>
    `;
    
    return section;
  }
  
  /**
   * Build dress code section
   */
  function buildDressCode() {
    const section = createElement('section', { className: 'dresscode-section' });
    
    section.innerHTML = `
      <div class="dresscode-card reveal">
        <div class="dresscode-icon">👔</div>
        <div class="dresscode-label">Dress Code</div>
        <div class="dresscode-value">${escapeHtml(CONFIG.DRESS_CODE)}</div>
      </div>
    `;
    
    return section;
  }
  
  /**
   * Build RSVP section
   */
  function buildRSVP() {
    const section = createElement('section', { className: 'rsvp-section' });
    
    const waMessage = CONFIG.WHATSAPP_MESSAGE.replace('{name}', playerName);
    const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
    
    section.innerHTML = `
      <h3 class="rsvp-title reveal">Confirm Attendance</h3>
      <p class="rsvp-subtitle reveal reveal-delay-1">Kami tunggu kehadiranmu!</p>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="rsvp-btn reveal reveal-delay-2" aria-label="Confirm attendance via WhatsApp" id="rsvp-btn">
        💬 Confirm Attendance
      </a>
    `;
    
    return section;
  }
  
  /**
   * Build final section
   */
  function buildFinal() {
    const section = createElement('section', { className: 'final-section' });
    
    section.innerHTML = `
      <h2 class="final-thankyou reveal">Thank You For Being Part<br>of My Journey</h2>
      <p class="final-seeyou reveal reveal-delay-1">See You at Graduation 🎓</p>
      <p class="final-name text-shimmer reveal reveal-delay-2">${escapeHtml(CONFIG.GRADUATE_NAME)}</p>
      <div class="final-actions reveal reveal-delay-3">
        <button class="btn btn-primary" id="replay-btn" aria-label="Replay the journey">
          🔄 Replay Journey
        </button>
        <button class="btn btn-secondary" id="back-to-invitation-btn" aria-label="Back to invitation">
          📜 Back to Invitation
        </button>
      </div>
    `;
    
    return section;
  }
  
  /**
   * Destroy / cleanup
   */
  function destroy() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }
  
  // ─── Helpers ──────────────────────────────
  
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
  
  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
  
  return { build, destroy };
})();
