/**
 * ============================================
 * GRADVENTURE — Utility Functions
 * ============================================
 */

/** querySelector shorthand */
const $ = (sel, parent = document) => parent.querySelector(sel);

/** querySelectorAll shorthand */
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/** Linear interpolation */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Clamp value between min and max */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Random number in range */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/** Random integer in range (inclusive) */
function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

/** Debounce function */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Check if user prefers reduced motion */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Check if device supports touch */
function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

/** Create an HTML element with attributes and children */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'textContent') {
      el.textContent = value;
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  });
  
  return el;
}

/** Wait for a duration (ms) */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Pad number with leading zero */
function padZero(num) {
  return String(num).padStart(2, '0');
}

/** 
 * Scroll reveal observer — adds 'visible' class to '.reveal' elements 
 * when they enter viewport
 */
function initScrollReveal() {
  if (prefersReducedMotion()) {
    // Show everything immediately if reduced motion
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  $$('.reveal').forEach(el => observer.observe(el));
}

/**
 * Load an image and return a promise
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // graceful fallback
    img.src = src;
  });
}

/**
 * Format a number with count-up animation
 */
function animateCountUp(element, target, duration = 1000) {
  if (prefersReducedMotion()) {
    element.textContent = target;
    return;
  }
  
  let start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    
    element.textContent = Math.round(lerp(start, target, eased));
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}
