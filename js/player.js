/**
 * ============================================
 * GRADVENTURE — Player Character (Anime 2D)
 * ============================================
 * 
 * Anime-style 2D character with gender selection,
 * walk animation, jump mechanics, and gravity.
 */

class Player {
  constructor(x, groundY, gender = 'male') {
    this.x = x;
    this.groundY = groundY;
    this.y = 0;
    this.width = 40;
    this.height = 72;
    this.speed = CONFIG.GAME.PLAYER_SPEED || 3.5;
    this.velocity = 0;
    this.direction = 1; // 1 = right, -1 = left
    this.moving = false;
    this.gender = gender;
    
    // Jump / Gravity
    this.vy = 0;
    this.jumpForce = CONFIG.GAME.JUMP_FORCE || -10;
    this.gravity = CONFIG.GAME.GRAVITY || 0.5;
    this.isGrounded = true;
    this.jumpSquash = 0; // squash/stretch effect
    
    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 8;
    this.walkCycle = 0;
    this.breathCycle = 0;
    
    // State
    this.state = 'idle'; // idle, walking, jumping, falling
  }
  
  /**
   * Jump if grounded
   */
  jump() {
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.state = 'jumping';
      this.jumpSquash = 1;
    }
  }
  
  /**
   * Update player position and animation
   */
  update(worldWidth) {
    // Apply horizontal velocity
    this.x += this.velocity;
    
    // Clamp to world bounds
    this.x = clamp(this.x, 30, worldWidth - 30);
    
    // Apply gravity
    if (!this.isGrounded) {
      this.vy += this.gravity;
      this.y += this.vy;
      
      // Land on ground
      const groundLevel = this.groundY - this.height;
      if (this.y >= groundLevel) {
        this.y = groundLevel;
        this.vy = 0;
        this.isGrounded = true;
        this.jumpSquash = -0.5; // landing squash
        this.state = this.moving ? 'walking' : 'idle';
      }
    } else {
      this.y = this.groundY - this.height;
    }
    
    // Decay jump squash
    this.jumpSquash *= 0.85;
    
    // Update animation
    this.animTimer++;
    this.breathCycle += 0.03;
    
    if (this.isGrounded) {
      if (this.moving) {
        this.state = 'walking';
        if (this.animTimer % this.animSpeed === 0) {
          this.walkCycle += 0.3;
        }
      } else {
        this.state = 'idle';
        this.walkCycle *= 0.8;
      }
    } else {
      this.state = this.vy < 0 ? 'jumping' : 'falling';
    }
  }
  
  moveLeft() {
    this.velocity = -this.speed;
    this.direction = -1;
    this.moving = true;
  }
  
  moveRight() {
    this.velocity = this.speed;
    this.direction = 1;
    this.moving = true;
  }
  
  stop() {
    this.velocity = 0;
    this.moving = false;
  }
  
  /**
   * Draw anime-style character
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + this.height);
    
    // Flip for direction
    if (this.direction === -1) {
      ctx.scale(-1, 1);
    }
    
    // Squash/stretch for jump
    const squashX = 1 + this.jumpSquash * 0.15;
    const squashY = 1 - this.jumpSquash * 0.15;
    ctx.scale(squashX, squashY);
    
    const breathOffset = Math.sin(this.breathCycle) * 1;
    const walkLeg = Math.sin(this.walkCycle * 3) * (this.moving ? 8 : 0);
    const walkArm = Math.sin(this.walkCycle * 3) * (this.moving ? 10 : 0);
    const walkBob = Math.abs(Math.sin(this.walkCycle * 3)) * (this.moving ? 2 : 0);
    const jumpLegTuck = !this.isGrounded ? -8 : 0;
    
    // Shadow
    if (this.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (this.gender === 'male') {
      this._drawMale(ctx, breathOffset, walkLeg, walkArm, walkBob, jumpLegTuck);
    } else {
      this._drawFemale(ctx, breathOffset, walkLeg, walkArm, walkBob, jumpLegTuck);
    }
    
    ctx.restore();
  }
  
  /**
   * Draw male anime character (formal suit)
   */
  _drawMale(ctx, breathOffset, walkLeg, walkArm, walkBob, jumpLegTuck) {
    const baseY = -this.height + breathOffset - walkBob;
    
    // ── LEGS ──
    const legY = baseY + 46;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Left leg (dark pants)
    ctx.strokeStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.moveTo(-6, legY);
    ctx.lineTo(-6 - walkLeg * 0.4, jumpLegTuck - 2);
    ctx.stroke();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(6, legY);
    ctx.lineTo(6 + walkLeg * 0.4, jumpLegTuck - 2);
    ctx.stroke();
    
    // Shoes
    ctx.fillStyle = '#1A1A24';
    ctx.beginPath();
    ctx.ellipse(-6 - walkLeg * 0.4, jumpLegTuck, 6, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6 + walkLeg * 0.4, jumpLegTuck, 6, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // ── BODY (Suit Jacket) ──
    const bodyY = baseY + 22;
    
    // Torso
    ctx.fillStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.roundRect(-14, bodyY, 28, 26, 4);
    ctx.fill();
    
    // Suit lapels
    ctx.fillStyle = '#383848';
    ctx.beginPath();
    ctx.moveTo(-6, bodyY);
    ctx.lineTo(0, bodyY + 14);
    ctx.lineTo(-14, bodyY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, bodyY);
    ctx.lineTo(0, bodyY + 14);
    ctx.lineTo(14, bodyY + 10);
    ctx.closePath();
    ctx.fill();
    
    // White shirt visible
    ctx.fillStyle = '#F0EDE8';
    ctx.beginPath();
    ctx.moveTo(-4, bodyY + 2);
    ctx.lineTo(0, bodyY + 16);
    ctx.lineTo(4, bodyY + 2);
    ctx.closePath();
    ctx.fill();
    
    // Tie
    ctx.fillStyle = '#8B1A1A';
    ctx.beginPath();
    ctx.moveTo(-2, bodyY + 4);
    ctx.lineTo(0, bodyY + 18);
    ctx.lineTo(2, bodyY + 4);
    ctx.closePath();
    ctx.fill();
    
    // Suit buttons
    ctx.fillStyle = '#C9A84C';
    ctx.beginPath();
    ctx.arc(0, bodyY + 20, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ── ARMS ──
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Left arm (suit sleeve)
    ctx.strokeStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.moveTo(-14, bodyY + 4);
    ctx.lineTo(-17 + walkArm * 0.4, bodyY + 22);
    ctx.stroke();
    
    // Hand
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(-17 + walkArm * 0.4, bodyY + 23, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right arm
    ctx.strokeStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.moveTo(14, bodyY + 4);
    ctx.lineTo(17 - walkArm * 0.4, bodyY + 20);
    ctx.stroke();
    
    // Hand holding book
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(17 - walkArm * 0.4, bodyY + 21, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Book
    const bookX = 17 - walkArm * 0.4;
    const bookY = bodyY + 21;
    ctx.fillStyle = '#1E5C8A';
    ctx.beginPath();
    ctx.roundRect(bookX - 3, bookY, 8, 11, 1);
    ctx.fill();
    ctx.fillStyle = '#C9A84C';
    ctx.fillRect(bookX - 1, bookY + 2, 4, 1);
    ctx.fillRect(bookX - 1, bookY + 5, 3, 1);
    
    // ── HEAD ──
    const headY = baseY + 10;
    
    // Neck
    ctx.fillStyle = '#D4A574';
    ctx.fillRect(-4, headY + 12, 8, 10);
    
    // Head shape (larger anime head)
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.ellipse(0, headY, 14, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair (black spiky)
    ctx.fillStyle = '#1A1420';
    // Main hair volume
    ctx.beginPath();
    ctx.ellipse(0, headY - 4, 16, 13, 0, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    // Spiky bangs
    ctx.beginPath();
    ctx.moveTo(-12, headY - 2);
    ctx.lineTo(-8, headY - 16);
    ctx.lineTo(-3, headY - 6);
    ctx.lineTo(2, headY - 18);
    ctx.lineTo(5, headY - 5);
    ctx.lineTo(10, headY - 14);
    ctx.lineTo(14, headY - 2);
    ctx.closePath();
    ctx.fill();
    // Side hair
    ctx.beginPath();
    ctx.ellipse(-13, headY + 2, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(13, headY + 2, 4, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (anime style — large)
    const eyeY = headY + 2;
    // Eye whites
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(5, eyeY, 5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris
    ctx.fillStyle = '#3A2A1A';
    ctx.beginPath();
    ctx.ellipse(5.5, eyeY + 0.5, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#1A0A00';
    ctx.beginPath();
    ctx.arc(6, eyeY + 1, 2, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(4, eyeY - 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, eyeY + 2, 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyebrow
    ctx.strokeStyle = '#1A1420';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(2, eyeY - 7);
    ctx.quadraticCurveTo(5, eyeY - 9, 9, eyeY - 7);
    ctx.stroke();
    
    // Mouth (small smile)
    ctx.strokeStyle = '#B8845C';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(4, headY + 8, 3, 0.1, Math.PI * 0.7);
    ctx.stroke();
    
    // Blush
    ctx.fillStyle = 'rgba(255, 150, 150, 0.25)';
    ctx.beginPath();
    ctx.ellipse(10, headY + 5, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw female anime character (formal blazer + skirt)
   */
  _drawFemale(ctx, breathOffset, walkLeg, walkArm, walkBob, jumpLegTuck) {
    const baseY = -this.height + breathOffset - walkBob;
    
    // ── LEGS ──
    const legY = baseY + 50;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    // Left leg (skin tone with stockings)
    ctx.strokeStyle = '#D4A574';
    ctx.beginPath();
    ctx.moveTo(-5, legY);
    ctx.lineTo(-5 - walkLeg * 0.4, jumpLegTuck - 2);
    ctx.stroke();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(5, legY);
    ctx.lineTo(5 + walkLeg * 0.4, jumpLegTuck - 2);
    ctx.stroke();
    
    // Shoes (feminine)
    ctx.fillStyle = '#2C1A24';
    ctx.beginPath();
    ctx.ellipse(-5 - walkLeg * 0.4, jumpLegTuck, 5, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 + walkLeg * 0.4, jumpLegTuck, 5, 3.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Shoe detail (small heel line)
    ctx.strokeStyle = '#4A2A34';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8 - walkLeg * 0.4, jumpLegTuck - 1);
    ctx.lineTo(-8 - walkLeg * 0.4, jumpLegTuck + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8 + walkLeg * 0.4, jumpLegTuck - 1);
    ctx.lineTo(8 + walkLeg * 0.4, jumpLegTuck + 2);
    ctx.stroke();
    
    // ── SKIRT ──
    const skirtY = baseY + 42;
    ctx.fillStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.moveTo(-14, skirtY);
    ctx.lineTo(-16, skirtY + 14);
    ctx.quadraticCurveTo(0, skirtY + 16, 16, skirtY + 14);
    ctx.lineTo(14, skirtY);
    ctx.closePath();
    ctx.fill();
    
    // Skirt pleat lines
    ctx.strokeStyle = '#22222E';
    ctx.lineWidth = 0.8;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, skirtY + 1);
      ctx.lineTo(i * 6, skirtY + 13);
      ctx.stroke();
    }
    
    // ── BODY (Blazer) ──
    const bodyY = baseY + 22;
    
    // Torso
    ctx.fillStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.roundRect(-13, bodyY, 26, 22, 4);
    ctx.fill();
    
    // Blazer lapels
    ctx.fillStyle = '#383848';
    ctx.beginPath();
    ctx.moveTo(-5, bodyY);
    ctx.lineTo(0, bodyY + 12);
    ctx.lineTo(-13, bodyY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, bodyY);
    ctx.lineTo(0, bodyY + 12);
    ctx.lineTo(13, bodyY + 8);
    ctx.closePath();
    ctx.fill();
    
    // White blouse visible
    ctx.fillStyle = '#F5F0F0';
    ctx.beginPath();
    ctx.moveTo(-3, bodyY + 2);
    ctx.lineTo(0, bodyY + 14);
    ctx.lineTo(3, bodyY + 2);
    ctx.closePath();
    ctx.fill();
    
    // Ribbon bow
    ctx.fillStyle = '#C44D6E';
    ctx.beginPath();
    ctx.moveTo(-4, bodyY + 4);
    ctx.quadraticCurveTo(-7, bodyY + 2, -6, bodyY + 6);
    ctx.quadraticCurveTo(-3, bodyY + 5, 0, bodyY + 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, bodyY + 4);
    ctx.quadraticCurveTo(7, bodyY + 2, 6, bodyY + 6);
    ctx.quadraticCurveTo(3, bodyY + 5, 0, bodyY + 5);
    ctx.fill();
    ctx.fillStyle = '#A83858';
    ctx.beginPath();
    ctx.arc(0, bodyY + 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // ── ARMS ──
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    // Left arm
    ctx.strokeStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.moveTo(-13, bodyY + 4);
    ctx.lineTo(-16 + walkArm * 0.4, bodyY + 20);
    ctx.stroke();
    
    // Hand
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(-16 + walkArm * 0.4, bodyY + 21, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Right arm
    ctx.strokeStyle = '#2C2C3A';
    ctx.beginPath();
    ctx.moveTo(13, bodyY + 4);
    ctx.lineTo(16 - walkArm * 0.4, bodyY + 18);
    ctx.stroke();
    
    // Hand holding bag
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.arc(16 - walkArm * 0.4, bodyY + 19, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Cute bag
    const bagX = 16 - walkArm * 0.4;
    const bagY = bodyY + 19;
    ctx.fillStyle = '#C9A84C';
    ctx.beginPath();
    ctx.roundRect(bagX - 4, bagY, 10, 10, 2);
    ctx.fill();
    ctx.strokeStyle = '#B8943C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bagX - 2, bagY);
    ctx.quadraticCurveTo(bagX + 1, bagY - 5, bagX + 4, bagY);
    ctx.stroke();
    // Bag clasp
    ctx.fillStyle = '#DFC06C';
    ctx.beginPath();
    ctx.arc(bagX + 1, bagY + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // ── HEAD ──
    const headY = baseY + 10;
    
    // Neck
    ctx.fillStyle = '#D4A574';
    ctx.fillRect(-3, headY + 12, 6, 10);
    
    // Head shape
    ctx.fillStyle = '#D4A574';
    ctx.beginPath();
    ctx.ellipse(0, headY, 13, 14.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair (long dark brown)
    ctx.fillStyle = '#2A1A10';
    // Main hair volume top
    ctx.beginPath();
    ctx.ellipse(0, headY - 4, 16, 14, 0, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    // Bangs (smooth)
    ctx.beginPath();
    ctx.moveTo(-14, headY - 1);
    ctx.quadraticCurveTo(-10, headY - 14, -5, headY - 5);
    ctx.lineTo(-2, headY - 4);
    ctx.quadraticCurveTo(0, headY - 12, 4, headY - 4);
    ctx.quadraticCurveTo(8, headY - 10, 12, headY);
    ctx.lineTo(15, headY + 2);
    ctx.lineTo(15, headY - 4);
    ctx.quadraticCurveTo(10, headY - 16, 0, headY - 18);
    ctx.quadraticCurveTo(-10, headY - 16, -15, headY - 4);
    ctx.closePath();
    ctx.fill();
    // Side hair (long)
    ctx.beginPath();
    ctx.ellipse(-14, headY + 4, 5, 16, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, headY + 4, 4, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Back hair (long flowing)
    ctx.beginPath();
    ctx.moveTo(-12, headY + 8);
    ctx.quadraticCurveTo(-14, headY + 30, -10, headY + 38);
    ctx.quadraticCurveTo(-6, headY + 40, -4, headY + 36);
    ctx.quadraticCurveTo(-2, headY + 32, -2, headY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, headY + 8);
    ctx.quadraticCurveTo(14, headY + 28, 10, headY + 36);
    ctx.quadraticCurveTo(6, headY + 38, 4, headY + 34);
    ctx.quadraticCurveTo(2, headY + 30, 2, headY + 20);
    ctx.closePath();
    ctx.fill();
    
    // Hair clip (cute)
    ctx.fillStyle = '#FF6B8A';
    ctx.beginPath();
    ctx.arc(-10, headY - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF8DAA';
    ctx.beginPath();
    ctx.arc(-10, headY - 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (anime style — larger, with lashes)
    const eyeY = headY + 2;
    // Eye whites
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(5, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Iris (larger, colorful)
    ctx.fillStyle = '#5A3A2A';
    ctx.beginPath();
    ctx.ellipse(5.5, eyeY + 0.5, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#2A1A0A';
    ctx.beginPath();
    ctx.arc(6, eyeY + 1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlights (multiple for anime effect)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(4, eyeY - 1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, eyeY + 2.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 230, 240, 0.6)';
    ctx.beginPath();
    ctx.arc(3, eyeY + 1, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyelashes (top)
    ctx.strokeStyle = '#1A0A10';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, eyeY - 5);
    ctx.quadraticCurveTo(5, eyeY - 7.5, 10, eyeY - 4.5);
    ctx.stroke();
    // Individual lashes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, eyeY - 5.5);
    ctx.lineTo(-1, eyeY - 7.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(9.5, eyeY - 4.5);
    ctx.lineTo(11, eyeY - 6);
    ctx.stroke();
    
    // Eyebrow (thinner, curved)
    ctx.strokeStyle = '#2A1A10';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(1, eyeY - 8);
    ctx.quadraticCurveTo(5, eyeY - 10, 9, eyeY - 8);
    ctx.stroke();
    
    // Mouth (small cute)
    ctx.fillStyle = '#D4707A';
    ctx.beginPath();
    ctx.ellipse(4, headY + 7.5, 2.5, 1.2, 0, 0, Math.PI);
    ctx.fill();
    
    // Blush (more prominent)
    ctx.fillStyle = 'rgba(255, 140, 160, 0.3)';
    ctx.beginPath();
    ctx.ellipse(10, headY + 4.5, 4.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, headY + 4.5, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  getCenterX() {
    return this.x;
  }
  
  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
