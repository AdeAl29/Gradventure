/**
 * ============================================
 * GRADVENTURE — Obstacle System
 * ============================================
 * 
 * 3 types of obstacles: rocks, puddles, fences.
 * Player can jump over them. No game over.
 */

class Obstacle {
  constructor(x, groundY, type) {
    this.x = x;
    this.groundY = groundY;
    this.type = type; // 'rock', 'puddle', 'fence'
    
    // Dimensions vary by type
    switch (type) {
      case 'rock':
        this.width = 40;
        this.height = 28;
        this.y = groundY - this.height + 5;
        break;
      case 'puddle':
        this.width = 60;
        this.height = 8;
        this.y = groundY - 2;
        break;
      case 'fence':
        this.width = 50;
        this.height = 35;
        this.y = groundY - this.height;
        break;
      default:
        this.width = 40;
        this.height = 25;
        this.y = groundY - this.height;
    }
    
    // Visual variation
    this.variant = Math.random();
    this.waveCycle = Math.random() * Math.PI * 2;
  }
  
  /**
   * Update obstacle state
   */
  update() {
    this.waveCycle += 0.03;
  }
  
  /**
   * Check collision with player — returns true if blocking
   */
  checkCollision(player) {
    if (!CONFIG.GAME.OBSTACLES_ENABLED) return false;
    
    // Only block if player is grounded (can jump over)
    if (!player.isGrounded) return false;
    
    const pb = player.getBounds();
    const ox = this.x - this.width / 2;
    const oy = this.y;
    
    // AABB collision
    const collides = pb.x + pb.width > ox &&
                     pb.x < ox + this.width &&
                     pb.y + pb.height > oy &&
                     pb.y < oy + this.height;
    
    return collides;
  }
  
  /**
   * Draw obstacle
   */
  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    
    if (screenX < -80 || screenX > ctx.canvas.width + 80) return;
    
    ctx.save();
    ctx.translate(screenX, this.groundY);
    
    switch (this.type) {
      case 'rock': this._drawRock(ctx); break;
      case 'puddle': this._drawPuddle(ctx); break;
      case 'fence': this._drawFence(ctx); break;
    }
    
    ctx.restore();
  }
  
  /**
   * Draw rock obstacle
   */
  _drawRock(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Main rock body
    ctx.fillStyle = '#8A8070';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-20, -12, -12, -20);
    ctx.quadraticCurveTo(-4, -26, 5, -22);
    ctx.quadraticCurveTo(14, -18, 18, -10);
    ctx.quadraticCurveTo(22, -2, 18, 2);
    ctx.quadraticCurveTo(10, 6, 0, 5);
    ctx.quadraticCurveTo(-10, 6, -18, 0);
    ctx.closePath();
    ctx.fill();
    
    // Rock highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(-5, -16, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Rock shadow detail
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(6, -4, 10, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Small rock nearby
    ctx.fillStyle = '#9A9080';
    ctx.beginPath();
    ctx.ellipse(22, 0, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(21, -2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Crack detail
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -20);
    ctx.lineTo(-2, -12);
    ctx.lineTo(2, -14);
    ctx.stroke();
    
    // Small moss
    ctx.fillStyle = 'rgba(100,150,80,0.4)';
    ctx.beginPath();
    ctx.ellipse(-14, -6, 4, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw puddle obstacle
   */
  _drawPuddle(ctx) {
    const wave = Math.sin(this.waveCycle) * 1;
    
    // Puddle shadow/depth
    ctx.fillStyle = 'rgba(60, 100, 140, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 32, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Main puddle
    ctx.fillStyle = 'rgba(80, 140, 200, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 + wave, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Water shimmer
    ctx.fillStyle = 'rgba(150, 200, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-8 + wave, -1, 12, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Reflection highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-12 + wave * 0.5, -2, 5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8 - wave * 0.5, -1, 3, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ripple rings
    ctx.strokeStyle = 'rgba(200, 230, 255, 0.25)';
    ctx.lineWidth = 0.8;
    const rippleScale = (Math.sin(this.waveCycle * 1.5) + 1) / 2;
    ctx.beginPath();
    ctx.ellipse(5, 0, 6 * rippleScale, 2 * rippleScale, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Small splash drops
    if (this.variant > 0.5) {
      ctx.fillStyle = 'rgba(120, 180, 230, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-20, 1, 4, 2, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(22, 2, 3, 1.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Draw fence obstacle
   */
  _drawFence(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 28, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fence posts
    const postColor = '#7A6040';
    const postDark = '#6A5030';
    ctx.fillStyle = postColor;
    
    // Left post
    ctx.beginPath();
    ctx.roundRect(-24, -32, 6, 36, 1);
    ctx.fill();
    // Post cap
    ctx.fillStyle = postDark;
    ctx.beginPath();
    ctx.roundRect(-25, -34, 8, 4, 2);
    ctx.fill();
    
    // Right post
    ctx.fillStyle = postColor;
    ctx.beginPath();
    ctx.roundRect(18, -32, 6, 36, 1);
    ctx.fill();
    ctx.fillStyle = postDark;
    ctx.beginPath();
    ctx.roundRect(17, -34, 8, 4, 2);
    ctx.fill();
    
    // Center post
    ctx.fillStyle = postColor;
    ctx.beginPath();
    ctx.roundRect(-3, -30, 6, 34, 1);
    ctx.fill();
    
    // Horizontal rails
    ctx.fillStyle = '#8A7050';
    ctx.beginPath();
    ctx.roundRect(-24, -26, 48, 5, 1);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-24, -14, 48, 5, 1);
    ctx.fill();
    
    // Rail highlight
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(-22, -25, 44, 1.5);
    ctx.fillRect(-22, -13, 44, 1.5);
    
    // Wood grain detail
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = -22; i < 22; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, -26);
      ctx.lineTo(i + 2, -21);
      ctx.stroke();
    }
    
    // Nail details
    ctx.fillStyle = '#555555';
    ctx.beginPath(); ctx.arc(-21, -23, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-21, -11, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(21, -23, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(21, -11, 1.2, 0, Math.PI * 2); ctx.fill();
    
    // Small vine/plant on fence
    ctx.fillStyle = 'rgba(80,140,60,0.5)';
    ctx.beginPath();
    ctx.ellipse(10, -28, 5, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(100,160,70,0.4)';
    ctx.beginPath();
    ctx.ellipse(13, -25, 3, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Generate obstacles for the world
 */
function generateObstacles(groundY, worldWidth, chestX, npcPositions) {
  if (!CONFIG.GAME.OBSTACLES_ENABLED) return [];
  
  const obstacles = [];
  const types = ['rock', 'puddle', 'fence', 'rock', 'puddle', 'fence', 'rock', 'puddle', 'rock'];
  
  // Place obstacles between NPCs, avoiding NPC positions and chest area
  const safeZone = 100; // Min distance from NPCs
  const chestSafeZone = 400; // Don't place near chest
  
  const possiblePositions = [];
  for (let x = 300; x < worldWidth - chestSafeZone; x += 120) {
    // Check distance from all NPCs
    let tooClose = false;
    for (const npcX of npcPositions) {
      if (Math.abs(x - npcX) < safeZone) {
        tooClose = true;
        break;
      }
    }
    if (Math.abs(x - chestX) < chestSafeZone) tooClose = true;
    
    if (!tooClose) possiblePositions.push(x);
  }
  
  // Shuffle and pick ~9 positions
  const shuffled = possiblePositions.sort(() => Math.random() - 0.5);
  const count = Math.min(types.length, shuffled.length);
  
  for (let i = 0; i < count; i++) {
    obstacles.push(new Obstacle(shuffled[i], groundY, types[i]));
  }
  
  return obstacles;
}
