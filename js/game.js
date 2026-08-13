/**
 * ============================================
 * GRADVENTURE — Game Engine
 * ============================================
 * 
 * Main game module: canvas setup, game loop,
 * world rendering with parallax, decorations,
 * chest, input handling, HUD updates.
 */

const Game = (() => {
  // ─── Canvas & Context ───────────────────
  let canvas, ctx;
  let canvasWidth, canvasHeight;
  
  // ─── Game Objects ───────────────────────
  let player;
  let camera;
  let particles;
  
  // ─── NPCs & Obstacles ─────────────────────
  let npcs = [];
  let obstacles = [];
  let playerGender = 'male';
  
  // ─── World ──────────────────────────────
  const WORLD_WIDTH = CONFIG.GAME.WORLD_WIDTH || 4000;
  const CHEST_X = CONFIG.GAME.CHEST_POSITION || 3600;
  let groundY;
  
  // ─── Input State ────────────────────────
  const keys = {};
  let moveLeft = false;
  let moveRight = false;
  let jumpPressed = false;
  let inputLocked = false;
  
  // ─── Game State ─────────────────────────
  let running = false;
  let chestNear = false;
  let chestOpened = false;
  let animFrameId = null;
  
  // ─── World Decorations (generated once) ─
  let clouds = [];
  let mountains = [];
  let trees = [];
  let flowers = [];
  let lamps = [];
  let stones = [];
  let birds = [];
  let grassPatches = [];
  let signboards = [];
  const SIGNBOARD_MESSAGES = [
    { x: 720, text: 'Awas genangan air! Jangan sampai sepatumu kotor sebelum wisuda!' },
    { x: 2200, text: 'Hampir sampai! Terus berjalan ke Timur...' },
  ];
  
  // ─── Chest State ────────────────────────
  let chestGlow = 0;
  let chestFloat = 0;
  
  // ─── Callbacks ──────────────────────────
  let onChestNear = null;
  let onChestLeave = null;
  let onProgressUpdate = null;
  let onSignboard = null;
  
  /**
   * Initialize the game
   */
  function init(canvasElement, callbacks = {}) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    
    onChestNear = callbacks.onChestNear || null;
    onChestLeave = callbacks.onChestLeave || null;
    onProgressUpdate = callbacks.onProgressUpdate || null;
    onSignboard = callbacks.onSignboard || null;
    playerGender = callbacks.gender || 'male';
    
    // Set canvas size
    resize();
    
    // Create game objects
    groundY = canvasHeight * (CONFIG.GAME.GROUND_Y || 0.72);
    
    // Read saved progress if restore is true
    let startX = 100;
    if (callbacks.restore) {
      startX = Storage.load('gameProgressX', 100);
    }
    
    player = new Player(startX, groundY, playerGender);
    camera = new Camera(canvasWidth, canvasHeight, WORLD_WIDTH);
    camera.x = Math.max(0, Math.min(startX - canvasWidth / 2, WORLD_WIDTH - canvasWidth));
    particles = new ParticleEmitter();
    
    // Generate world
    generateWorld();
    
    // Generate NPCs
    generateNPCs();
    
    // Generate obstacles
    const npcPositions = npcs.map(n => n.x);
    obstacles = generateObstacles(groundY, WORLD_WIDTH, CHEST_X, npcPositions);
    
    // Bind input
    bindInput();
    
    // Listen for resize
    window.addEventListener('resize', debounce(resize, 200));
  }
  
  /**
   * Resize canvas to fill screen
   */
  function resize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    groundY = canvasHeight * (CONFIG.GAME.GROUND_Y || 0.72);
    
    if (camera) {
      camera.resize(canvasWidth, canvasHeight);
    }
    if (player) {
      player.groundY = groundY;
    }
  }
  
  /**
   * Generate all world decorations
   */
  function generateWorld() {
    // Clouds
    clouds = [];
    for (let i = 0; i < 12; i++) {
      clouds.push({
        x: randomRange(-200, WORLD_WIDTH + 200),
        y: randomRange(30, canvasHeight * 0.25),
        width: randomRange(60, 160),
        height: randomRange(25, 50),
        speed: randomRange(0.05, 0.2),
        opacity: randomRange(0.15, 0.35),
      });
    }
    
    // Mountains / distant buildings
    mountains = [];
    for (let i = 0; i < 8; i++) {
      mountains.push({
        x: i * (WORLD_WIDTH / 6) + randomRange(-100, 100),
        width: randomRange(200, 400),
        height: randomRange(100, 220),
        color: `hsl(${randomRange(30, 45)}, ${randomRange(15, 25)}%, ${randomRange(35, 50)}%)`,
      });
    }
    
    // Trees
    trees = [];
    for (let i = 0; i < 30; i++) {
      trees.push({
        x: randomRange(50, WORLD_WIDTH - 50),
        type: randomInt(0, 2), // Different tree types
        scale: randomRange(0.7, 1.3),
        sway: randomRange(0, Math.PI * 2),
      });
    }
    // Sort trees by x for proper layering
    trees.sort((a, b) => a.x - b.x);
    
    // Flowers
    flowers = [];
    for (let i = 0; i < 50; i++) {
      flowers.push({
        x: randomRange(30, WORLD_WIDTH - 30),
        color: `hsl(${randomRange(0, 360)}, ${randomRange(40, 70)}%, ${randomRange(65, 85)}%)`,
        size: randomRange(2, 5),
        sway: randomRange(0, Math.PI * 2),
      });
    }
    
    // Lamps (along the path)
    lamps = [];
    for (let x = 200; x < WORLD_WIDTH - 200; x += randomRange(250, 400)) {
      lamps.push({ x });
    }
    
    // Stones
    stones = [];
    for (let i = 0; i < 20; i++) {
      stones.push({
        x: randomRange(50, WORLD_WIDTH - 50),
        size: randomRange(4, 10),
        color: `hsl(30, 10%, ${randomRange(45, 60)}%)`,
      });
    }
    
    // Birds
    birds = [];
    for (let i = 0; i < 5; i++) {
      birds.push({
        x: randomRange(0, WORLD_WIDTH),
        y: randomRange(40, canvasHeight * 0.2),
        speed: randomRange(0.3, 0.8),
        wingCycle: randomRange(0, Math.PI * 2),
        size: randomRange(3, 6),
      });
    }
    
    // Grass patches
    grassPatches = [];
    for (let i = 0; i < 80; i++) {
      grassPatches.push({
        x: randomRange(0, WORLD_WIDTH),
        blades: randomInt(3, 6),
        height: randomRange(6, 14),
        sway: randomRange(0, Math.PI * 2),
      });
    }

    signboards = SIGNBOARD_MESSAGES.map(sign => ({ ...sign, shown: false }));
  }
  
  /**
   * Generate NPC characters
   */
  function generateNPCs() {
    npcs = [];
    const dialogs = CONFIG.NPC_DIALOGS || [
      "Hidup Rokowi!", "Semangat bang!", "Jangan lupa makan ya...",
      "Skripsi ku kapan selesai ya 😭", "Senyum dong, mau difoto!", "Kamu pasti bisa! ✨"
    ];
    const positions = [400, 900, 1500, 2100, 2600, 3200];
    const facings = [1, -1, 1, -1, 1, -1];
    
    for (let i = 0; i < 6; i++) {
      npcs.push(new NPC(
        positions[i], groundY, i,
        dialogs[i % dialogs.length],
        facings[i]
      ));
    }
  }
  
  /**
   * Bind keyboard and touch input
   */
  function bindInput() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'a', 'd', 'A', 'D', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });
    
    // Mobile controls
    const leftBtn = $('#mobile-left');
    const rightBtn = $('#mobile-right');
    
    if (leftBtn) {
      leftBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        moveLeft = true;
        leftBtn.classList.add('pressed');
      });
      leftBtn.addEventListener('pointerup', () => {
        moveLeft = false;
        leftBtn.classList.remove('pressed');
      });
      leftBtn.addEventListener('pointerleave', () => {
        moveLeft = false;
        leftBtn.classList.remove('pressed');
      });
      leftBtn.addEventListener('pointercancel', () => {
        moveLeft = false;
        leftBtn.classList.remove('pressed');
      });
    }
    
    if (rightBtn) {
      rightBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        moveRight = true;
        rightBtn.classList.add('pressed');
      });
      rightBtn.addEventListener('pointerup', () => {
        moveRight = false;
        rightBtn.classList.remove('pressed');
      });
      rightBtn.addEventListener('pointerleave', () => {
        moveRight = false;
        rightBtn.classList.remove('pressed');
      });
      rightBtn.addEventListener('pointercancel', () => {
        moveRight = false;
        rightBtn.classList.remove('pressed');
      });
    }
    
    // Mobile jump button
    const jumpBtn = $('#mobile-jump');
    if (jumpBtn) {
      jumpBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        jumpPressed = true;
        jumpBtn.classList.add('pressed');
      });
      jumpBtn.addEventListener('pointerup', () => {
        jumpBtn.classList.remove('pressed');
      });
      jumpBtn.addEventListener('pointerleave', () => {
        jumpBtn.classList.remove('pressed');
      });
      jumpBtn.addEventListener('pointercancel', () => {
        jumpBtn.classList.remove('pressed');
      });
    }
  }
  
  /**
   * Handle player input
   */
  function handleInput() {
    if (chestOpened || inputLocked) {
      player.stop();
      return;
    }
    
    const left = keys['ArrowLeft'] || keys['a'] || keys['A'] || moveLeft;
    const right = keys['ArrowRight'] || keys['d'] || keys['D'] || moveRight;
    const jump = keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '] || jumpPressed;
    
    if (left && !right) {
      player.moveLeft();
    } else if (right && !left) {
      player.moveRight();
    } else {
      player.stop();
    }
    
    if (jump) {
      player.jump();
      jumpPressed = false; // Consume jump press
    }
  }
  
  /**
   * Handle obstacle collisions
   */
  function handleObstacleCollisions() {
    for (const obs of obstacles) {
      if (obs.checkCollision(player)) {
        // Push player out — determine direction
        const playerCenter = player.x;
        const obsCenter = obs.x;
        if (playerCenter < obsCenter) {
          player.x = obs.x - obs.width / 2 - player.width / 2 - 2;
        } else {
          player.x = obs.x + obs.width / 2 + player.width / 2 + 2;
        }
        player.velocity = 0;
      }
    }
  }
  
  /**
   * Check chest proximity
   */
  function checkChestInteraction() {
    const distance = Math.abs(player.x - CHEST_X);
    const radius = CONFIG.GAME.INTERACTION_RADIUS || 120;
    
    if (distance < radius && !chestOpened) {
      if (!chestNear) {
        chestNear = true;
        if (onChestNear) onChestNear();
      }
    } else {
      if (chestNear && !chestOpened) {
        chestNear = false;
        if (onChestLeave) onChestLeave();
      }
    }
  }

  function checkSignboardInteraction() {
    signboards.forEach(sign => {
      const near = Math.abs(player.x - sign.x) < 105;
      if (near && !sign.shown) {
        sign.shown = true;
        if (onSignboard) onSignboard(sign.text);
      } else if (!near) {
        sign.shown = false;
      }
    });
  }
  
  /**
   * Calculate and report progress
   */
  function updateProgress() {
    const progress = Math.min(100, Math.round((player.x / CHEST_X) * 100));
    if (onProgressUpdate) onProgressUpdate(progress, player.x);
  }

  // ─── RENDERING ──────────────────────────
  
  /**
   * Draw sky gradient
   */
  function drawSky() {
    const progress = player ? Math.max(0, Math.min(1, player.x / CHEST_X)) : 0;
    const sunset = Math.max(0, Math.min(1, (progress - 0.2) / 0.5));
    const night = Math.max(0, Math.min(1, (progress - 0.7) / 0.3));
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    const blend = (a, b, amount) => a.map((value, i) => Math.round(value + (b[i] - value) * amount));
    const toRgb = color => `rgb(${color.join(',')})`;
    const top = blend(blend([85, 147, 210], [217, 120, 130], sunset), [16, 26, 63], night);
    const middle = blend(blend([158, 210, 234], [243, 160, 120], sunset), [38, 54, 93], night);
    const bottom = blend(blend([220, 235, 220], [244, 195, 155], sunset), [71, 61, 98], night);
    grad.addColorStop(0, toRgb(top));
    grad.addColorStop(0.45, toRgb(middle));
    grad.addColorStop(1, toRgb(bottom));
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (night > 0) {
      ctx.save();
      ctx.globalAlpha = night;
      for (let i = 0; i < 42; i++) {
        const x = (i * 97 + 31) % canvasWidth;
        const y = 25 + ((i * 47) % Math.max(80, canvasHeight * 0.36));
        const radius = (i % 3 ? 1.1 : 1.8) * (1 + Math.sin(Date.now() * 0.003 + i) * 0.3);
        ctx.fillStyle = i % 7 === 0 ? '#ffe8a5' : '#fff8dc';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
  
  /**
   * Draw clouds (parallax layer 1 — 0.1x)
   */
  function drawClouds() {
    const parallax = camera.x * 0.1;
    const time = Date.now() * 0.0001;
    
    clouds.forEach(cloud => {
      const cx = cloud.x - parallax + Math.sin(time + cloud.x * 0.01) * 10;
      const cy = cloud.y;
      
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      // Draw fluffy cloud using overlapping circles
      const w = cloud.width;
      const h = cloud.height;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.25, cy + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.3, cy + h * 0.05, w * 0.3, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }
  
  /**
   * Draw mountains / distant buildings (parallax layer 1 — 0.1x)
   */
  function drawMountains() {
    const parallax = camera.x * 0.1;
    
    mountains.forEach(mt => {
      const mx = mt.x - parallax;
      const my = groundY;
      
      ctx.fillStyle = mt.color;
      ctx.beginPath();
      ctx.moveTo(mx - mt.width / 2, my);
      ctx.lineTo(mx - mt.width * 0.15, my - mt.height);
      ctx.lineTo(mx + mt.width * 0.1, my - mt.height * 0.85);
      ctx.lineTo(mx + mt.width * 0.3, my - mt.height * 0.6);
      ctx.lineTo(mx + mt.width / 2, my);
      ctx.closePath();
      ctx.fill();
    });
  }
  
  /**
   * Draw trees (parallax layer 2 — 0.4x for background trees, 1x for foreground)
   */
  function drawTrees(layer) {
    const time = Date.now() * 0.001;
    
    trees.forEach((tree, i) => {
      // Split trees between layers
      if (layer === 'back' && i % 3 !== 0) return;
      if (layer === 'front' && i % 3 === 0) return;
      
      const parallaxFactor = layer === 'back' ? 0.4 : 0.8;
      const tx = tree.x - camera.x * parallaxFactor;
      const ty = layer === 'back' ? groundY - 10 : groundY;
      const scale = tree.scale * (layer === 'back' ? 0.6 : 1);
      const sway = Math.sin(time * 0.5 + tree.sway) * 2 * scale;
      
      // Check visibility (rough)
      if (tx < -100 || tx > canvasWidth + 100) return;
      
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      
      if (tree.type === 0) {
        // Pine tree
        ctx.fillStyle = '#5C4A3A';
        ctx.fillRect(-3, -50, 6, 50);
        
        ctx.fillStyle = `hsl(${110 + sway}, 35%, 38%)`;
        ctx.beginPath();
        ctx.moveTo(0 + sway, -90);
        ctx.lineTo(-25, -40);
        ctx.lineTo(25, -40);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = `hsl(${115 + sway}, 35%, 42%)`;
        ctx.beginPath();
        ctx.moveTo(0 + sway * 0.7, -70);
        ctx.lineTo(-20, -30);
        ctx.lineTo(20, -30);
        ctx.closePath();
        ctx.fill();
      } else if (tree.type === 1) {
        // Round tree
        ctx.fillStyle = '#6B5240';
        ctx.fillRect(-4, -45, 8, 45);
        
        ctx.fillStyle = `hsl(${100 + sway}, 40%, 40%)`;
        ctx.beginPath();
        ctx.arc(0 + sway, -55, 28, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `hsl(${105 + sway}, 35%, 45%)`;
        ctx.beginPath();
        ctx.arc(8 + sway, -50, 20, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sakura-like tree
        ctx.fillStyle = '#7B6350';
        ctx.fillRect(-3, -40, 6, 40);
        
        // Branch
        ctx.strokeStyle = '#7B6350';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.quadraticCurveTo(20, -40, 30 + sway, -35);
        ctx.stroke();
        
        ctx.fillStyle = `hsl(${340 + sway * 2}, 50%, 78%)`;
        ctx.beginPath();
        ctx.arc(0 + sway * 0.5, -52, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15 + sway, -42, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  }
  
  /**
   * Draw ground
   */
  function drawGround() {
    // Ground fill
    const grad = ctx.createLinearGradient(0, groundY, 0, canvasHeight);
    grad.addColorStop(0, '#8BA888');
    grad.addColorStop(0.15, '#7A9A76');
    grad.addColorStop(0.4, '#6B8B65');
    grad.addColorStop(1, '#5A7B55');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
    
    // Path (dirt road)
    const pathY = groundY + 5;
    const pathHeight = 20;
    ctx.fillStyle = '#C4B49A';
    ctx.fillRect(0, pathY, canvasWidth, pathHeight);
    
    // Path edge highlights
    ctx.fillStyle = '#D4C4AA';
    ctx.fillRect(0, pathY, canvasWidth, 2);
    ctx.fillStyle = '#B4A48A';
    ctx.fillRect(0, pathY + pathHeight - 2, canvasWidth, 2);
  }
  
  /**
   * Draw grass patches (foreground — 0.8x)
   */
  function drawGrass() {
    const parallax = camera.x * 0.8;
    const time = Date.now() * 0.001;
    
    grassPatches.forEach(patch => {
      const gx = patch.x - parallax;
      if (gx < -20 || gx > canvasWidth + 20) return;
      
      const gy = groundY;
      
      ctx.strokeStyle = 'rgba(90, 140, 80, 0.6)';
      ctx.lineWidth = 1.5;
      
      for (let b = 0; b < patch.blades; b++) {
        const bx = gx + b * 3 - (patch.blades * 1.5);
        const sway = Math.sin(time + patch.sway + b * 0.5) * 3;
        
        ctx.beginPath();
        ctx.moveTo(bx, gy);
        ctx.quadraticCurveTo(bx + sway, gy - patch.height * 0.6, bx + sway * 1.5, gy - patch.height);
        ctx.stroke();
      }
    });
  }
  
  /**
   * Draw flowers (foreground — 0.8x)
   */
  function drawFlowers() {
    const parallax = camera.x * 0.8;
    const time = Date.now() * 0.002;
    
    flowers.forEach(flower => {
      const fx = flower.x - parallax;
      if (fx < -10 || fx > canvasWidth + 10) return;
      
      const fy = groundY - 2;
      const sway = Math.sin(time + flower.sway) * 1.5;
      
      // Stem
      ctx.strokeStyle = 'rgba(80, 130, 70, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + sway, fy - flower.size * 2.5);
      ctx.stroke();
      
      // Flower head
      ctx.fillStyle = flower.color;
      ctx.beginPath();
      ctx.arc(fx + sway, fy - flower.size * 2.5, flower.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Center
      ctx.fillStyle = 'rgba(255, 220, 100, 0.8)';
      ctx.beginPath();
      ctx.arc(fx + sway, fy - flower.size * 2.5, flower.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /**
   * Draw stones (foreground — 0.8x)
   */
  function drawStones() {
    const parallax = camera.x * 0.8;
    
    stones.forEach(stone => {
      const sx = stone.x - parallax;
      if (sx < -20 || sx > canvasWidth + 20) return;
      
      const sy = groundY + 8;
      
      ctx.fillStyle = stone.color;
      ctx.beginPath();
      ctx.ellipse(sx, sy, stone.size, stone.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(sx - stone.size * 0.2, sy - stone.size * 0.15, stone.size * 0.4, stone.size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  /**
   * Draw lamps (foreground — 0.8x)
   */
  function drawLamps() {
    const parallax = camera.x * 0.8;
    const time = Date.now() * 0.003;
    
    lamps.forEach(lamp => {
      const lx = lamp.x - parallax;
      if (lx < -30 || lx > canvasWidth + 30) return;
      
      const ly = groundY;
      
      // Pole
      ctx.fillStyle = '#5C5040';
      ctx.fillRect(lx - 2, ly - 60, 4, 60);
      
      // Lamp head
      ctx.fillStyle = '#6B5B4E';
      ctx.beginPath();
      ctx.roundRect(lx - 8, ly - 68, 16, 12, 3);
      ctx.fill();
      
      // Light glow
      const glowIntensity = 0.1 + Math.sin(time + lamp.x) * 0.03;
      const glowGrad = ctx.createRadialGradient(lx, ly - 60, 2, lx, ly - 50, 40);
      glowGrad.addColorStop(0, `rgba(255, 220, 150, ${glowIntensity})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(lx - 40, ly - 90, 80, 60);
    });
  }
  
  /**
   * Draw birds (parallax layer 1 — 0.1x)
   */
  function drawBirds() {
    const parallax = camera.x * 0.1;
    const time = Date.now() * 0.003;
    
    birds.forEach(bird => {
      const bx = ((bird.x + bird.speed * Date.now() * 0.01) % (WORLD_WIDTH + 400)) - 200 - parallax;
      const by = bird.y + Math.sin(time + bird.x) * 5;
      
      if (bx < -50 || bx > canvasWidth + 50) return;
      
      const wing = Math.sin(time * 3 + bird.wingCycle) * 4;
      
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(bx - bird.size, by + wing);
      ctx.quadraticCurveTo(bx - bird.size * 0.3, by - Math.abs(wing) * 0.3, bx, by);
      ctx.quadraticCurveTo(bx + bird.size * 0.3, by - Math.abs(wing) * 0.3, bx + bird.size, by + wing);
      ctx.stroke();
    });
  }
  
  /**
   * Draw the treasure chest
   */
  function drawChest() {
    const cx = CHEST_X - camera.x;
    const time = Date.now() * 0.002;
    chestFloat = Math.sin(time) * 3;
    
    if (cx < -100 || cx > canvasWidth + 100) return;
    
    const cy = groundY - 25 + chestFloat;
    
    // ── Special area effects ──
    // Golden light behind chest
    if (chestNear || player.x > CHEST_X - 300) {
      const nearness = 1 - Math.min(1, Math.abs(player.x - CHEST_X) / 300);
      
      const goldGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 150);
      goldGrad.addColorStop(0, `rgba(201, 168, 76, ${0.15 * nearness})`);
      goldGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(cx - 150, cy - 150, 300, 300);
    }
    
    // ── Chest Body ──
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 5 + chestFloat, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Base
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy, 44, 26, 3);
    ctx.fill();
    
    // Base dark stripe
    ctx.fillStyle = '#7A5A10';
    ctx.fillRect(cx - 22, cy + 10, 44, 4);
    
    // Gold trim
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 22, cy, 44, 26);
    
    // Lock
    ctx.fillStyle = '#C9A84C';
    ctx.beginPath();
    ctx.arc(cx, cy + 13, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.arc(cx, cy + 13, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Lid
    ctx.fillStyle = '#9B7918';
    ctx.beginPath();
    ctx.roundRect(cx - 24, cy - 12, 48, 14, [6, 6, 0, 0]);
    ctx.fill();
    
    // Lid gold trim
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 24, cy - 12, 48, 14, [6, 6, 0, 0]);
    ctx.stroke();
    
    // Lid highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(cx - 20, cy - 10, 40, 5, 2);
    ctx.fill();
    
    // Glow effect when near
    if (chestNear) {
      chestGlow = Math.min(1, chestGlow + 0.02);
      
      const glowGrad = ctx.createRadialGradient(cx, cy + 5, 5, cx, cy + 5, 60);
      glowGrad.addColorStop(0, `rgba(201, 168, 76, ${0.3 * chestGlow})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - 60, cy - 55, 120, 120);
      
      // Sparkle particles
      if (Math.random() < 0.3) {
        particles.emitSparkle(cx + randomRange(-30, 30), cy + randomRange(-20, 20));
      }
    } else {
      chestGlow = Math.max(0, chestGlow - 0.01);
    }
    
    // Ambient sparkle
    if (Math.random() < 0.05) {
      particles.emitSparkle(cx + randomRange(-25, 25), cy + randomRange(-15, 25));
    }
  }
  
  /**
   * Draw special area near chest (golden, decorated)
   */
  function drawSpecialArea() {
    const areaStart = CHEST_X - 400;
    const screenStart = areaStart - camera.x;
    
    if (screenStart > canvasWidth + 50) return;
    
    const time = Date.now() * 0.001;
    
    // Golden atmosphere overlay
    const nearChest = Math.max(0, 1 - Math.abs(player.x - CHEST_X) / 500);
    if (nearChest > 0) {
      ctx.save();
      ctx.globalAlpha = nearChest * 0.08;
      ctx.fillStyle = '#C9A84C';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
    
    // Floating petals in special area
    if (player.x > areaStart && Math.random() < 0.08) {
      particles.emitPetal(
        camera.x + randomRange(0, canvasWidth),
        randomRange(0, canvasHeight * 0.3)
      );
    }
  }

  function drawSignboards() {
    signboards.forEach(sign => {
      const sx = sign.x - camera.x;
      if (sx < -90 || sx > canvasWidth + 90) return;
      const sy = groundY - 48;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.beginPath(); ctx.ellipse(0, 52, 25, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#704725'; ctx.fillRect(-3, 0, 6, 52);
      ctx.fillStyle = '#a66b38';
      ctx.beginPath(); ctx.roundRect(-50, -32, 100, 35, 5); ctx.fill();
      ctx.strokeStyle = '#d29a59'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff0c8'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('PETUNJUK', 0, -10);
      ctx.fillStyle = '#f3d37f'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('→', 0, 10);
      ctx.restore();
    });
  }
  
  /**
   * Main game loop
   */
  function gameLoop() {
    if (!running) return;
    
    // Handle input
    handleInput();
    
    // Update
    player.update(WORLD_WIDTH);
    handleObstacleCollisions();
    camera.follow(player.getCenterX());
    camera.update();
    particles.update();
    
    // Update NPCs
    npcs.forEach(npc => npc.update(player.x));
    
    // Update obstacles
    obstacles.forEach(obs => obs.update());
    
    // Check interactions
    checkChestInteraction();
    checkSignboardInteraction();
    updateProgress();
    
    // Ambient particles
    if (Math.random() < 0.02) {
      particles.emitFloatingLight(
        camera.x + randomRange(0, canvasWidth),
        randomRange(canvasHeight * 0.3, canvasHeight * 0.7)
      );
    }
    if (Math.random() < 0.01) {
      particles.emitLeaf(
        camera.x + randomRange(0, canvasWidth),
        randomRange(0, 50)
      );
    }
    
    // ─── RENDER ──────────────────────────
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Sky (no parallax — static background)
    drawSky();
    
    // Parallax layer 1 (0.1x) — far background
    drawClouds();
    drawBirds();
    drawMountains();
    
    // Parallax layer 2 (0.4x) — mid background
    drawTrees('back');
    
    // Apply camera transform for world-space elements
    camera.applyTransform(ctx);
    
    // Draw ground
    drawGround();
    
    // Lamps (behind player)
    drawLamps();
    drawStones();
    
    // Foreground trees
    camera.restoreTransform(ctx);
    drawTrees('front');
    camera.applyTransform(ctx);
    
    // Grass and flowers
    camera.restoreTransform(ctx);
    drawGrass();
    drawFlowers();
    camera.applyTransform(ctx);
    
    // Obstacles (world space)
    camera.restoreTransform(ctx);
    obstacles.forEach(obs => obs.draw(ctx, camera.x));
    drawSignboards();
    
    // NPCs (world space — characters, no bubbles yet)
    npcs.forEach(npc => npc.draw(ctx, camera.x));
    
    // Special area near chest
    drawSpecialArea();
    camera.applyTransform(ctx);
    
    // Chest
    camera.restoreTransform(ctx);
    drawChest();
    
    // Player (in world space relative to camera)
    const playerScreenX = player.x - camera.x;
    ctx.save();
    ctx.translate(playerScreenX - player.x, 0);
    player.draw(ctx);
    ctx.restore();
    
    // Particles (screen space)
    particles.draw(ctx);
    
    // Request next frame
    animFrameId = requestAnimationFrame(gameLoop);
  }
  
  /**
   * Start the game loop
   */
  function start() {
    if (running) return;
    running = true;
    gameLoop();
  }
  
  /**
   * Stop the game loop
   */
  function stop() {
    running = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }
  
  /**
   * Reset game to initial state
   */
  function reset() {
    stop();
    chestNear = false;
    chestOpened = false;
    chestGlow = 0;
    
    if (player) {
      player.x = 100;
      player.velocity = 0;
      player.vy = 0;
      player.isGrounded = true;
      player.moving = false;
    }
    
    if (particles) {
      particles.clear();
    }
    
    if (camera) {
      camera.x = 0;
      camera.targetX = 0;
      camera.resetZoom();
    }
    
    // Reset input
    Object.keys(keys).forEach(k => keys[k] = false);
    moveLeft = false;
    moveRight = false;
    jumpPressed = false;
    inputLocked = false;
    
    generateWorld();
    generateNPCs();
    const npcPositions = npcs.map(n => n.x);
    obstacles = generateObstacles(groundY, WORLD_WIDTH, CHEST_X, npcPositions);
  }
  
  /**
   * Mark chest as opened
   */
  function openChest() {
    chestOpened = true;
    player.stop();
    
    // Burst particles at chest
    const cx = CHEST_X - camera.x;
    const cy = groundY - 25;
    particles.emitBurst(cx, cy, 30);
    
    // Camera zoom
    camera.setZoom(1.3);
    camera.shake(3);
  }

  function setInputLocked(locked) {
    inputLocked = Boolean(locked);
    if (inputLocked && player) player.stop();
  }
  
  /**
   * Get current player position
   */
  function getPlayerX() {
    return player ? player.x : 0;
  }
  
  return {
    init,
    start,
    stop,
    reset,
    resize,
    openChest,
    setInputLocked,
    getPlayerX,
    get isRunning() { return running; },
    get isChestNear() { return chestNear; },
  };
})();
