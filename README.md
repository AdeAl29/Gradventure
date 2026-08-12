# 🎓 Gradventure — Interactive Graduation Invitation

An interactive web game that transforms a graduation invitation into a mini adventure. Users enter their name, walk a character through a beautiful parallax world, discover a treasure chest, and unveil an elegant graduation invitation card.

![Gradventure](https://img.shields.io/badge/Gradventure-Interactive_Invitation-C9A84C?style=for-the-badge)

## ✨ Features

- **Interactive Mini Game** — Walk your character through a beautiful 2D parallax world
- **Premium Invitation** — Elegant digital invitation card with all event details
- **Live Countdown** — Real-time countdown to graduation day
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Personalized** — User's name is used throughout the experience
- **RSVP via WhatsApp** — One-tap attendance confirmation
- **Photo Gallery** — Showcase graduation memories
- **Background Music** — Optional ambient music with SFX
- **No Dependencies** — Pure HTML, CSS, and vanilla JavaScript

## 🚀 Quick Start

### Option 1: Open directly
Simply open `index.html` in any modern browser. No server required!

### Option 2: Use a local server (recommended for audio)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using VS Code
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

Then visit `http://localhost:8000`

## 🎨 Customization

All customization is done in **one file**: `config.js`

### Change Graduate Name
```js
GRADUATE_NAME: "Your Name Here",
GRADUATE_TITLE: "S.Kom",
GRADUATE_UNIVERSITY: "Your University",
```

### Change Event Date & Time
```js
EVENT_DATE: "2026-09-15",        // Format: YYYY-MM-DD
EVENT_DAY: "Selasa",
EVENT_TIME: "09:00 WIB",
EVENT_END_TIME: "12:00 WIB",
```

### Change Venue & Location
```js
VENUE: "Your Venue Name",
ADDRESS: "Full address here",
GOOGLE_MAP_URL: "https://maps.app.goo.gl/your-link",
```

### Change WhatsApp Number
```js
WHATSAPP_NUMBER: "6281234567890",  // Include country code, no +
WHATSAPP_MESSAGE: "Halo, saya {name}, saya akan hadir.",
```

### Change Profile Photo
1. Replace `assets/images/profile.jpg` with your photo
2. Or update the path in config:
```js
PROFILE_IMAGE: "assets/images/your-photo.jpg",
```

### Change Gallery Photos
1. Add your photos to `assets/images/`
2. Update config:
```js
GALLERY_IMAGES: [
  { src: "assets/images/photo1.jpg", caption: "Caption here" },
  // ... add more
],
```

### Change Background Music
1. Add your `.mp3` file to `assets/audio/`
2. Update config:
```js
MUSIC_URL: "assets/audio/your-music.mp3",
```

### Change Story Timeline
```js
STORY_ITEMS: [
  { number: "01", title: "Start", description: "Your text" },
  { number: "02", title: "Learn", description: "Your text" },
  { number: "03", title: "Graduate", description: "Your text" },
],
```

### Change Theme Colors
```js
UI_THEME: {
  '--primary': '#8B7355',
  '--gold': '#C9A84C',
  '--bg': '#FAF8F5',
},
```

Or edit `css/variables.css` for full control.

## 🎮 Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Move Left | ← or A | ◀ button |
| Move Right | → or D | ▶ button |
| Open Chest | E or click | Tap OPEN button |

## 📁 Project Structure

```
/
├── index.html          # Main HTML file
├── config.js           # ⭐ All customizable settings
├── css/
│   ├── reset.css       # CSS reset
│   ├── variables.css   # Design tokens
│   ├── global.css      # Base styles & animations
│   ├── landing.css     # Loading & landing screens
│   ├── game.css        # Game HUD & controls
│   ├── invitation.css  # Invitation card styles
│   └── responsive.css  # Media queries
├── js/
│   ├── utils.js        # Helper functions
│   ├── storage.js      # localStorage wrapper
│   ├── audio.js        # Audio manager
│   ├── particles.js    # Particle system
│   ├── camera.js       # Camera system
│   ├── player.js       # Player character
│   ├── game.js         # Game engine
│   ├── invitation.js   # Invitation builder
│   └── app.js          # Main orchestrator
├── assets/
│   ├── images/         # Photos & images
│   ├── sprites/        # Character sprites (optional)
│   ├── audio/          # Music & SFX
│   └── icons/          # Icons & favicon
└── README.md
```

## 🌐 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main** branch, root folder
4. Your site will be live at `https://username.github.io/repo-name`

### Vercel
1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Click **Deploy** — no configuration needed

### Netlify
1. Push to GitHub
2. Import on [netlify.com](https://netlify.com)
3. Set publish directory to `/` (root)
4. Click **Deploy**

### Manual Hosting
Simply upload all files to any static file host (shared hosting, S3, etc.)

## 🎵 Adding Audio

The game supports background music and sound effects. Add your audio files to `assets/audio/` and update `config.js`:

```js
MUSIC_URL: "assets/audio/background-music.mp3",
SFX: {
  click: "assets/audio/click.mp3",
  walk: "assets/audio/walk.mp3",
  chestOpen: "assets/audio/chest-open.mp3",
  invitationOpen: "assets/audio/invitation-open.mp3",
  success: "assets/audio/success.mp3",
  transition: "assets/audio/transition.mp3",
},
```

> **Tip**: Use royalty-free music from sites like [Pixabay Music](https://pixabay.com/music/) or [Free Music Archive](https://freemusicarchive.org/).

## 🖼️ Replacing the Character Sprite

The character is drawn using Canvas 2D primitives. To use custom sprites:

1. Create a sprite sheet
2. Modify `js/player.js` — replace the `draw()` method with sprite rendering
3. The player class already handles position, direction, and animation state

## ♿ Accessibility

- Keyboard navigation supported
- `aria-label` on all interactive elements
- Focus states visible
- `prefers-reduced-motion` reduces all animations
- Sufficient color contrast
- Touch targets ≥ 44px

## 📱 Supported Browsers

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile Chrome & Safari

## 📄 License

This project is open source. Feel free to use it for your graduation invitation!

---

Made with ❤️ for your special day 🎓
