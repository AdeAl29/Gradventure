/**
 * ============================================
 * GRADVENTURE — Configuration File
 * ============================================
 * 
 * Edit this file to customize your graduation invitation.
 * All content, dates, images, and links are configured here.
 * No need to touch any other file!
 */

const CONFIG = {
  // ─── Graduate Information ───────────────────────
  GRADUATE_NAME: "Ade Alrizal",
  GRADUATE_TITLE: "S.T", // Degree title — ganti sesuai gelar
  GRADUATE_UNIVERSITY: "Universitas Islam Sumatera Utara",
  GRADUATE_FACULTY: "Fakultas Teknik", // Ganti sesuai fakultas
  GRADUATE_MAJOR: "Teknik Informatika", // Ganti sesuai jurusan

  // ─── Event Details ──────────────────────────────
  EVENT_DATE: "2026-08-29",        // Format: YYYY-MM-DD
  EVENT_DAY: "Sabtu",
  EVENT_TIME: "09:00 WIB",
  EVENT_END_TIME: "Selesai",
  VENUE: "Selecta Hotel & Convention Hall Medan",
  ADDRESS: "Jl. Listrik No. 2, Petisah Tengah, Kec. Medan Petisah, Kota Medan, Sumatera Utara 20212",

  // ─── Links ──────────────────────────────────────
  GOOGLE_MAP_URL: "https://www.google.com/maps/search/Selecta+Hotel+Medan+Jl.+Listrik+No.2",
  WHATSAPP_NUMBER: "6289636278765", // Include country code, no +
  WHATSAPP_MESSAGE: "Halo, saya {name}, saya akan hadir dalam acara wisuda.",

  // ─── Profile & Gallery ─────────────────────────
  PROFILE_IMAGE: "assets/images/profile.jpg",
  GALLERY_IMAGES: [
    { src: "assets/images/gallery-1.jpg", caption: "Hari pertama kuliah" },
    { src: "assets/images/gallery-2.jpg", caption: "Sidang skripsi" },
    { src: "assets/images/gallery-3.jpg", caption: "Bersama teman-teman" },
    { src: "assets/images/gallery-4.jpg", caption: "Teman sidang skripsi" },
    { src: "assets/images/gallery-5.jpg", caption: "Momen bahagia" },
  ],

  // ─── Audio ──────────────────────────────────────
  MUSIC_URL: "assets/audio/background-music.mp3",
  SFX: {
    click: "assets/audio/click.mp3",
    walk: "assets/audio/walk.mp3",
    chestOpen: "assets/audio/chest-open.mp3",
    invitationOpen: "assets/audio/invitation-open.mp3",
    success: "assets/audio/success.mp3",
    transition: "assets/audio/transition.mp3",
  },

  // ─── Story Timeline ────────────────────────────
  STORY_ITEMS: [
    { number: "01", title: "Start", description: "Langkah pertama memasuki dunia perkuliahan." },
    { number: "02", title: "Learn", description: "Belajar, bertumbuh, dan menemukan jati diri." },
    { number: "03", title: "Graduate", description: "Menuai hasil dari perjalanan panjang." },
  ],

  // ─── Thank You Message ─────────────────────────
  THANK_YOU_MESSAGE: "Terima kasih kepada keluarga,\nteman,\ndosen,\ndan semua orang yang telah menjadi bagian\ndari perjalanan ini.",

  // ─── Dress Code ─────────────────────────────────
  DRESS_CODE: "Formal / Semi Formal",

  // ─── Game Settings ──────────────────────────────
  GAME: {
    WORLD_WIDTH: 2500,        // Total world width in pixels
    PLAYER_SPEED: 3.5,        // Player movement speed
    CHEST_POSITION: 2200,     // X position of the chest
    GROUND_Y: 0.72,           // Ground level (% of canvas height)
    CAMERA_SMOOTHING: 0.08,   // Camera interpolation factor
    INTERACTION_RADIUS: 120,  // Chest interaction distance
    JUMP_FORCE: -10,          // Jump velocity (negative = up)
    GRAVITY: 0.5,             // Gravity acceleration
    OBSTACLES_ENABLED: true,  // Enable/disable obstacles
  },

  // ─── NPC Dialogs ──────────────────────────────────
  NPC_DIALOGS: [
    "Hidup Rokowi! 🇮🇩",
    "Semangat bang! 💪",
    "Jangan lupa makan ya...",
    "Skripsi ku kapan selesai ya 😭",
    "Senyum dong, mau difoto! 📸",
    "Kamu pasti bisa! ✨",
  ],

  // ─── Theme Overrides (optional) ─────────────────
  // Override CSS variables if needed
  UI_THEME: {
    // '--primary': '#8B7355',
    // '--gold': '#C9A84C',
    // '--bg': '#FAF8F5',
  },
};

// Make config globally available
if (typeof window !== 'undefined') {
  window.GRADVENTURE_CONFIG = CONFIG;
}
