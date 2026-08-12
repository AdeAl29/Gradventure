/**
 * ============================================
 * GRADVENTURE — Player Character
 * ============================================
 * 
 * Canvas-drawn character with walk animation.
 * Designed to be easily replaceable with sprite sheets.
 */

class Player {
  constructor(x, groundY) {
    this.x = x;
    this.groundY = groundY; // Y position of ground
    this.y = 0; // Set in update based on groundY
    this.width = 28;
    this.height = 52;
    this.speed = CONFIG.GAME.PLAYER_SPEED || 3.5;
    this.velocity = 0;
    this.direction = 1; // 1 = right, -1 = left
    this.moving = false;
    
    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 8; // frames per animation step
    this.walkCycle = 0;
    this.breathCycle = 0;
    
    // State
    this.state = 'idle'; // idle, walking, stopped
  }
  
  /**
   * Update player position and animation
   */
  update(worldWidth) {
    // Apply velocity
    this.x += this.velocity;
    
    // Clamp to world bounds
    this.x = clamp(this.x, 30, worldWidth - 30);
    
    // Update animation
    this.animTimer++;
    this.breathCycle += 0.03;
    
    if (this.moving) {
      this.state = 'walking';
      if (this.animTimer % this.animSpeed === 0) {
        this.walkCycle += 0.3;
      }
    } else {
      this.state = 'idle';
      this.walkCycle *= 0.8; // Slow down walk animation
    }
    
    // Y position based on ground
    this.y = this.groundY - this.height;
  }
  
  /**
   * Move left
   */
  moveLeft() {
    this.velocity = -this.speed;
    this.direction = -1;
    this.moving = true;
  }
  
  /**
   * Move right
   */
  moveRight() {
    this.velocity = this.speed;
    this.direction = 1;
    this.moving = true;
  }
  
  /**
   * Stop movement
   */
  stop() {
    this.velocity = 0;
    this.moving = false;
  }
  
  /**
   * Draw the character on canvas
   * This draws a simple but stylish character using canvas primitives.
   * Can be replaced with sprite rendering.
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Flip for direction
    if (this.direction === -1) {
      ctx.scale(-1, 1);
    }
    
    const breathOffset = Math.sin(this.breathCycle) * 1;
    const walkLeg = Math.sin(this.walkCycle * 3) * (this.moving ? 6 : 0);
    const walkArm = Math.sin(this.walkCycle * 3) * (this.moving ? 8 : 0);
    const walkBob = Math.abs(Math.sin(this.walkCycle * 3)) * (this.moving ? 2 : 0);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, this.height + 2, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ── Legs ──
    const legY = 32 + breathOffset - walkBob;
    
    // Left leg
    ctx.strokeStyle = '#3D3028';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, legY);
    ctx.lineTo(-5 - walkLeg * 0.3, this.height);
    ctx.stroke();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(5, legY);
    ctx.lineTo(5 + walkLeg * 0.3, this.height);
    ctx.stroke();
    
    // Shoes
    ctx.fillStyle = '#2C2016';
    ctx.beginPath();
    ctx.ellipse(-5 - walkLeg * 0.3, this.height + 1, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 + walkLeg * 0.3, this.height + 1, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ── Body (shirt/semi-formal) ──
    const bodyY = 16 + breathOffset - walkBob;
    
    // Torso
    ctx.fillStyle = '#E8DFD0'; // Cream shirt
    ctx.beginPath();
    ctx.roundRect(-11, bodyY, 22, 18, 3);
    ctx.fill();
    
    // Collar
    ctx.strokeStyle = '#D0C4B0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, bodyY);
    ctx.lineTo(0, bodyY + 6);
    ctx.lineTo(4, bodyY);
    ctx.stroke();
    
    // ── Arms ──
    ctx.strokeStyle = '#E8DFD0';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(-11, bodyY + 3);
    ctx.lineTo(-14 + walkArm * 0.4, bodyY + 16);
    ctx.stroke();
    
    // Right arm (holding bag)
    ctx.beginPath();
    ctx.moveTo(11, bodyY + 3);
    ctx.lineTo(14 - walkArm * 0.4, bodyY + 14);
    ctx.stroke();
    
    // ── Bag ──
    const bagX = 14 - walkArm * 0.4;
    const bagY = bodyY + 14;
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.roundRect(bagX - 5, bagY - 2, 10, 12, 2);
    ctx.fill();
    ctx.strokeStyle = '#A07B20';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bagX - 3, bagY - 2);
    ctx.quadraticCurveTo(bagX, bagY - 7, bagX + 3, bagY - 2);
    ctx.stroke();
    
    // ── Head ──
    const headY = 6 + breathOffset - walkBob;
    
    // Neck
    ctx.fillStyle = '#D4A574'; // Skin tone
    ctx.fillRect(-3, headY + 8, 6, 8);
    
    // Head shape
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(0, headY, 11, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = '#2C1A0E';
    ctx.beginPath();
    ctx.arc(0, headY - 2, 12, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, headY - 4, 12, 6, 0, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#2C1A0E';
    const eyeY = headY + 1;
    ctx.beginPath();
    ctx.arc(4, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#B8845C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(3, headY + 4, 3, 0, Math.PI * 0.6);
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Get player center X position (for camera)
   */
  getCenterX() {
    return this.x;
  }
  
  /**
   * Get bounding box for collision
   */
  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
