/**
 * ============================================
 * GRADVENTURE — Player Character (Anime 2D)
 * ============================================
 * 
 * Anime-style 2D character with gender selection,
 * expressive dual anime eyes, walk animations,
 * jump mechanics, and physics.
 */

class Player {
  constructor(x, groundY, gender = 'male') {
    this.x = x;
    this.groundY = groundY;
    this.y = 0;
    this.width = 40;
    this.height = 74;
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
        this.jumpSquash = -0.4; // landing squash
        this.state = this.moving ? 'walking' : 'idle';
      }
    } else {
      this.y = this.groundY - this.height;
    }
    
    // Decay jump squash
    this.jumpSquash *= 0.85;
    
    // Update animation
    this.animTimer++;
    this.breathCycle += 0.04;
    
    if (this.isGrounded) {
      if (this.moving) {
        this.state = 'walking';
        this.walkCycle += 0.22;
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
    
    // Flip horizontally when facing left
    if (this.direction === -1) {
      ctx.scale(-1, 1);
    }
    
    // Squash/stretch for jump & landing dynamics
    const squashX = 1 + this.jumpSquash * 0.15;
    const squashY = 1 - this.jumpSquash * 0.15;
    ctx.scale(squashX, squashY);
    
    const breathOffset = Math.sin(this.breathCycle) * 1.2;
    const walkLeg = Math.sin(this.walkCycle * 2.8) * (this.moving ? 9 : 0);
    const walkArm = Math.sin(this.walkCycle * 2.8) * (this.moving ? 11 : 0);
    const walkBob = Math.abs(Math.sin(this.walkCycle * 2.8)) * (this.moving ? 2.5 : 0);
    const jumpLegTuck = !this.isGrounded ? -6 : 0;
    
    // Ground shadow
    if (this.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 18, 5, 0, 0, Math.PI * 2);
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
   * Helper to draw a rich anime eye
   */
  _drawAnimeEye(ctx, x, y, width, height, irisColorTop, irisColorBottom, isFemale = false) {
    ctx.save();
    
    // 1. Sclera (Eye White)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Soft top shadow in eye
    ctx.fillStyle = 'rgba(180, 190, 210, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y - height * 0.3, width * 0.95, height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Iris (Layered Gradient)
    const irisW = width * 0.78;
    const irisH = height * 0.88;
    const irisGrad = ctx.createLinearGradient(x, y - irisH, x, y + irisH);
    irisGrad.addColorStop(0, '#0D1525');
    irisGrad.addColorStop(0.35, irisColorTop);
    irisGrad.addColorStop(0.85, irisColorBottom);
    irisGrad.addColorStop(1, '#FFF5D6');
    
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.ellipse(x + 0.3, y + 0.3, irisW, irisH, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 3. Pupil
    ctx.fillStyle = '#060B14';
    ctx.beginPath();
    ctx.arc(x + 0.4, y + 0.2, irisW * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. Vibrant Lower Iris Glow Ring
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x + 0.3, y + irisH * 0.5, irisW * 0.5, irisH * 0.25, 0, 0, Math.PI);
    ctx.fill();
    
    // 5. Anime Eye Highlights
    // Primary Main Highlight (Top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(x - irisW * 0.35, y - irisH * 0.35, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary Mini Highlight (Bottom-right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(x + irisW * 0.38, y + irisH * 0.35, width * 0.16, 0, Math.PI * 2);
    ctx.fill();
    
    // 6. Bold Upper Eyelash / Eyeliner
    ctx.strokeStyle = '#120F1C';
    ctx.fillStyle = '#120F1C';
    ctx.lineWidth = isFemale ? 2.4 : 2.0;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x - width * 1.1, y - height * 0.6);
    ctx.quadraticCurveTo(x, y - height * 1.15, x + width * 1.15, y - height * 0.5);
    ctx.stroke();
    
    // Eyelash Wing for female
    if (isFemale) {
      ctx.beginPath();
      ctx.moveTo(x + width * 0.85, y - height * 0.7);
      ctx.lineTo(x + width * 1.45, y - height * 1.1);
      ctx.lineTo(x + width * 0.95, y - height * 0.4);
      ctx.fill();
      
      // Bottom subtle lash line
      ctx.strokeStyle = 'rgba(25, 18, 30, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y + height * 0.7, width * 0.6, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  /**
   * Draw male anime character (Handsome Graduate in Sleek Suit)
   */
  _drawMale(ctx, breathOffset, walkLeg, walkArm, walkBob, jumpLegTuck) {
    const baseY = -this.height + breathOffset - walkBob;
    
    // ── 1. LEGS ──
    const legY = baseY + 47;
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    
    // Left Leg (Back)
    ctx.strokeStyle = '#1E2232';
    ctx.beginPath();
    ctx.moveTo(-5.5, legY);
    ctx.lineTo(-5.5 - walkLeg * 0.45, jumpLegTuck - 2);
    ctx.stroke();
    
    // Right Leg (Front)
    ctx.strokeStyle = '#272C3F';
    ctx.beginPath();
    ctx.moveTo(5.5, legY);
    ctx.lineTo(5.5 + walkLeg * 0.45, jumpLegTuck - 2);
    ctx.stroke();
    
    // Sleek Formal Dress Shoes
    ctx.fillStyle = '#11131C';
    ctx.beginPath();
    ctx.ellipse(-5.5 - walkLeg * 0.45, jumpLegTuck, 6.5, 3.8, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5.5 + walkLeg * 0.45, jumpLegTuck, 6.5, 3.8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Shoe shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(6.5 + walkLeg * 0.45, jumpLegTuck - 1, 3, 1.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 2. BODY (Tailored Graduate Suit & Sash) ──
    const bodyY = baseY + 23;
    
    // Suit Jacket Base
    ctx.fillStyle = '#232738';
    ctx.beginPath();
    ctx.roundRect(-14, bodyY, 28, 25, 4);
    ctx.fill();
    
    // White Dress Shirt V-Neck
    ctx.fillStyle = '#FAF8F5';
    ctx.beginPath();
    ctx.moveTo(-6, bodyY);
    ctx.lineTo(0, bodyY + 16);
    ctx.lineTo(6, bodyY);
    ctx.closePath();
    ctx.fill();
    
    // Crisp Shirt Collar
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-6, bodyY);
    ctx.lineTo(-2, bodyY + 6);
    ctx.lineTo(-6, bodyY + 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, bodyY);
    ctx.lineTo(2, bodyY + 6);
    ctx.lineTo(6, bodyY + 4);
    ctx.fill();
    
    // Elegant Crimson Tie
    ctx.fillStyle = '#8B1828';
    ctx.beginPath();
    ctx.moveTo(-2.5, bodyY + 3);
    ctx.lineTo(0, bodyY + 18);
    ctx.lineTo(2.5, bodyY + 3);
    ctx.closePath();
    ctx.fill();
    // Tie Gold Clip
    ctx.fillStyle = '#E5C158';
    ctx.fillRect(-1.5, bodyY + 10, 3, 1.2);
    
    // Suit Lapels (Left & Right)
    ctx.fillStyle = '#2E344A';
    ctx.beginPath();
    ctx.moveTo(-14, bodyY + 2);
    ctx.lineTo(-5, bodyY + 2);
    ctx.lineTo(-1, bodyY + 15);
    ctx.lineTo(-14, bodyY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, bodyY + 2);
    ctx.lineTo(5, bodyY + 2);
    ctx.lineTo(1, bodyY + 15);
    ctx.lineTo(14, bodyY + 12);
    ctx.closePath();
    ctx.fill();
    
    // Golden Graduate Boutonniere / Pin
    ctx.fillStyle = '#E5C158';
    ctx.beginPath();
    ctx.arc(-8, bodyY + 8, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Suit Gold Buttons
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(0, bodyY + 19, 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 3. ARMS & ACCESSORY ──
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Left Arm (Back Arm)
    ctx.strokeStyle = '#1E2232';
    ctx.beginPath();
    ctx.moveTo(-13, bodyY + 5);
    ctx.lineTo(-16 + walkArm * 0.45, bodyY + 22);
    ctx.stroke();
    // Left Hand
    ctx.fillStyle = '#FFE2CC';
    ctx.beginPath();
    ctx.arc(-16 + walkArm * 0.45, bodyY + 23, 2.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Right Arm (Front Arm holding Diploma Scroll / Book)
    const armAngle = -walkArm * 0.4;
    const handX = 15 + armAngle;
    const handY = bodyY + 21;
    
    ctx.strokeStyle = '#272C3F';
    ctx.beginPath();
    ctx.moveTo(13, bodyY + 5);
    ctx.lineTo(handX, handY);
    ctx.stroke();
    
    // Right Hand
    ctx.fillStyle = '#FFE2CC';
    ctx.beginPath();
    ctx.arc(handX, handY, 2.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Prestigious Diploma Scroll / Leather Gold Book
    ctx.fillStyle = '#1D4E7A';
    ctx.beginPath();
    ctx.roundRect(handX - 4, handY - 5, 9, 13, 1.5);
    ctx.fill();
    // Gold Book Spine & Trim
    ctx.fillStyle = '#E5C158';
    ctx.fillRect(handX - 4, handY - 5, 2, 13);
    ctx.fillRect(handX - 1, handY - 1, 4, 1.2);
    ctx.fillRect(handX - 1, handY + 2, 3, 1.2);
    
    // ── 4. HEAD & ANIME FACE ──
    const headY = baseY + 10;
    
    // Neck
    ctx.fillStyle = '#F0CBB0';
    ctx.fillRect(-3.5, headY + 11, 7, 10);
    
    // Anime Jaw / Face Shape
    ctx.fillStyle = '#FFE2CC';
    ctx.beginPath();
    ctx.moveTo(-13, headY - 4);
    ctx.quadraticCurveTo(-14, headY + 9, -5, headY + 16);
    ctx.lineTo(3, headY + 17);
    ctx.quadraticCurveTo(12, headY + 12, 13, headY - 4);
    ctx.quadraticCurveTo(0, headY - 14, -13, headY - 4);
    ctx.fill();
    
    // Soft Ear on Left
    ctx.fillStyle = '#F5C8AA';
    ctx.beginPath();
    ctx.ellipse(-13.5, headY + 3, 3, 4.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 5. DUAL ANIME EYES (Left & Right) ──
    const eyeY = headY + 3;
    
    // Left Eye (3/4 Farther Eye)
    this._drawAnimeEye(ctx, -4.5, eyeY, 4.2, 5.8, '#1D457C', '#4A92E8', false);
    
    // Right Eye (Near Eye)
    this._drawAnimeEye(ctx, 5.5, eyeY, 5.2, 6.8, '#1D457C', '#4A92E8', false);
    
    // Confident Anime Eyebrows
    ctx.strokeStyle = '#181422';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    // Left Brow
    ctx.beginPath();
    ctx.moveTo(-8, eyeY - 6.5);
    ctx.quadraticCurveTo(-4.5, eyeY - 8.5, -1, eyeY - 6.8);
    ctx.stroke();
    // Right Brow
    ctx.beginPath();
    ctx.moveTo(2, eyeY - 7.2);
    ctx.quadraticCurveTo(6, eyeY - 9.5, 10, eyeY - 7.2);
    ctx.stroke();
    
    // Subtle Anime Nose
    ctx.fillStyle = '#D9A07E';
    ctx.beginPath();
    ctx.arc(0.5, headY + 7.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // Handsome Anime Smile
    ctx.strokeStyle = '#B35E4B';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-1, headY + 11.5);
    ctx.quadraticCurveTo(2.5, headY + 13.2, 5.5, headY + 11.2);
    ctx.stroke();
    
    // Rosy Cheeks Blush
    ctx.fillStyle = 'rgba(255, 120, 120, 0.22)';
    ctx.beginPath();
    ctx.ellipse(-5, headY + 7, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7, headY + 7, 4, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 6. DYNAMIC ANIME HAIR (Layered & Glossy) ──
    // Dark Anime Hair Base
    ctx.fillStyle = '#1A1524';
    
    // Back Hair Volume
    ctx.beginPath();
    ctx.ellipse(0, headY - 5, 16.5, 14, 0, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    
    // Spiky Stylish Top & Bangs
    ctx.beginPath();
    ctx.moveTo(-14, headY - 1);
    ctx.quadraticCurveTo(-15, headY - 14, -8, headY - 17);
    ctx.lineTo(-4, headY - 9);
    ctx.lineTo(0, headY - 19);
    ctx.lineTo(4, headY - 9);
    ctx.lineTo(9, headY - 16);
    ctx.lineTo(14, headY - 7);
    ctx.lineTo(15, headY + 2);
    // Face-framing bangs
    ctx.quadraticCurveTo(8, headY - 3, 2, headY - 1);
    ctx.lineTo(-2, headY - 3);
    ctx.quadraticCurveTo(-8, headY + 1, -14, headY - 1);
    ctx.closePath();
    ctx.fill();
    
    // Sideburns
    ctx.beginPath();
    ctx.moveTo(-13, headY - 2);
    ctx.lineTo(-14.5, headY + 8);
    ctx.lineTo(-11, headY + 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, headY - 2);
    ctx.lineTo(14, headY + 7);
    ctx.lineTo(11, headY + 3);
    ctx.fill();
    
    // Anime Hair Gloss / Highlight Streak
    ctx.fillStyle = 'rgba(120, 140, 190, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, headY - 10, 11, 2.2, -0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw female anime character (Beautiful Heroine Graduate)
   */
  _drawFemale(ctx, breathOffset, walkLeg, walkArm, walkBob, jumpLegTuck) {
    const baseY = -this.height + breathOffset - walkBob;
    
    // ── 1. LEGS ──
    const legY = baseY + 50;
    ctx.lineWidth = 5.2;
    ctx.lineCap = 'round';
    
    // Back Leg (Smooth Skin Tone)
    ctx.strokeStyle = '#FAD0B6';
    ctx.beginPath();
    ctx.moveTo(-5, legY);
    ctx.lineTo(-5 - walkLeg * 0.45, jumpLegTuck - 2);
    ctx.stroke();
    
    // Front Leg
    ctx.strokeStyle = '#FFE0CC';
    ctx.beginPath();
    ctx.moveTo(5, legY);
    ctx.lineTo(5 + walkLeg * 0.45, jumpLegTuck - 2);
    ctx.stroke();
    
    // Elegant Dark Brown Loafers
    ctx.fillStyle = '#22151D';
    ctx.beginPath();
    ctx.ellipse(-5 - walkLeg * 0.45, jumpLegTuck, 5.5, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5 + walkLeg * 0.45, jumpLegTuck, 5.5, 3.5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Gold buckle on shoe
    ctx.fillStyle = '#E5C158';
    ctx.fillRect(4.5 + walkLeg * 0.45, jumpLegTuck - 2, 2.5, 1.2);
    
    // ── 2. PLEATED GRADUATION SKIRT ──
    const skirtY = baseY + 42;
    ctx.fillStyle = '#222638';
    ctx.beginPath();
    ctx.moveTo(-13, skirtY);
    ctx.lineTo(-16, skirtY + 14);
    ctx.quadraticCurveTo(0, skirtY + 16, 16, skirtY + 14);
    ctx.lineTo(13, skirtY);
    ctx.closePath();
    ctx.fill();
    
    // Skirt Pleats
    ctx.strokeStyle = '#181C2B';
    ctx.lineWidth = 0.9;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, skirtY + 1);
      ctx.lineTo(i * 6.2, skirtY + 14);
      ctx.stroke();
    }
    
    // ── 3. BODY (Fitted Blazer & Cute Ribbon) ──
    const bodyY = baseY + 23;
    
    // Blazer
    ctx.fillStyle = '#292E42';
    ctx.beginPath();
    ctx.roundRect(-13, bodyY, 26, 21, 4);
    ctx.fill();
    
    // White Blouse V-Neck
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-4.5, bodyY);
    ctx.lineTo(0, bodyY + 14);
    ctx.lineTo(4.5, bodyY);
    ctx.closePath();
    ctx.fill();
    
    // Blazer Lapels
    ctx.fillStyle = '#343B54';
    ctx.beginPath();
    ctx.moveTo(-13, bodyY + 2);
    ctx.lineTo(-4, bodyY + 2);
    ctx.lineTo(0, bodyY + 12);
    ctx.lineTo(-13, bodyY + 9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, bodyY + 2);
    ctx.lineTo(4, bodyY + 2);
    ctx.lineTo(0, bodyY + 12);
    ctx.lineTo(13, bodyY + 9);
    ctx.closePath();
    ctx.fill();
    
    // Cute Wine-Red Ribbon Bow
    ctx.fillStyle = '#C8385A';
    // Left loop
    ctx.beginPath();
    ctx.moveTo(0, bodyY + 4);
    ctx.quadraticCurveTo(-6, bodyY + 1, -5, bodyY + 7);
    ctx.closePath();
    ctx.fill();
    // Right loop
    ctx.beginPath();
    ctx.moveTo(0, bodyY + 4);
    ctx.quadraticCurveTo(6, bodyY + 1, 5, bodyY + 7);
    ctx.closePath();
    ctx.fill();
    // Center knot with gold pearl
    ctx.fillStyle = '#E5C158';
    ctx.beginPath();
    ctx.arc(0, bodyY + 4.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 4. ARMS & ACCESSORY ──
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    // Left Arm (Back)
    ctx.strokeStyle = '#222638';
    ctx.beginPath();
    ctx.moveTo(-12, bodyY + 4);
    ctx.lineTo(-15 + walkArm * 0.45, bodyY + 20);
    ctx.stroke();
    // Left Hand
    ctx.fillStyle = '#FFE0CC';
    ctx.beginPath();
    ctx.arc(-15 + walkArm * 0.45, bodyY + 21, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Right Arm (Front holding Cute Satchel / Diploma)
    const armAngle = -walkArm * 0.4;
    const handX = 14 + armAngle;
    const handY = bodyY + 19;
    
    ctx.strokeStyle = '#292E42';
    ctx.beginPath();
    ctx.moveTo(12, bodyY + 4);
    ctx.lineTo(handX, handY);
    ctx.stroke();
    
    // Right Hand
    ctx.fillStyle = '#FFE0CC';
    ctx.beginPath();
    ctx.arc(handX, handY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Chic Leather Graduate Bag / Scroll
    ctx.fillStyle = '#C89242';
    ctx.beginPath();
    ctx.roundRect(handX - 3.5, handY - 3, 10, 10, 2);
    ctx.fill();
    // Gold Clasp & Handle
    ctx.strokeStyle = '#9E6D24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(handX - 1.5, handY - 3);
    ctx.quadraticCurveTo(handX + 1.5, handY - 7, handX + 4.5, handY - 3);
    ctx.stroke();
    ctx.fillStyle = '#FFF0A8';
    ctx.beginPath();
    ctx.arc(handX + 1.5, handY + 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 5. HEAD & CUTE ANIME FACE ──
    const headY = baseY + 10;
    
    // Flowing Back Hair (Behind Neck)
    ctx.fillStyle = '#2D1A14';
    ctx.beginPath();
    ctx.moveTo(-13, headY + 4);
    ctx.quadraticCurveTo(-16, headY + 28, -10, headY + 39);
    ctx.quadraticCurveTo(-6, headY + 41, -3, headY + 36);
    ctx.quadraticCurveTo(-3, headY + 25, -2, headY + 15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, headY + 4);
    ctx.quadraticCurveTo(16, headY + 28, 10, headY + 39);
    ctx.quadraticCurveTo(6, headY + 41, 3, headY + 36);
    ctx.quadraticCurveTo(3, headY + 25, 2, headY + 15);
    ctx.fill();
    
    // Neck
    ctx.fillStyle = '#F0C8AF';
    ctx.fillRect(-3, headY + 11, 6, 10);
    
    // Soft Anime Face Shape
    ctx.fillStyle = '#FFF0E4';
    ctx.beginPath();
    ctx.moveTo(-13, headY - 4);
    ctx.quadraticCurveTo(-14, headY + 8, -4, headY + 15.5);
    ctx.lineTo(2, headY + 16.5);
    ctx.quadraticCurveTo(12, headY + 11, 13, headY - 4);
    ctx.quadraticCurveTo(0, headY - 14, -13, headY - 4);
    ctx.fill();
    
    // Soft Ear with Gold Pearl Earring
    ctx.fillStyle = '#FAD0B6';
    ctx.beginPath();
    ctx.ellipse(-13, headY + 3, 2.8, 4.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E5C158';
    ctx.beginPath();
    ctx.arc(-13.5, headY + 7, 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 6. DUAL LARGE SPARKLING ANIME EYES (Left & Right) ──
    const eyeY = headY + 2.8;
    
    // Left Eye (Farther)
    this._drawAnimeEye(ctx, -4.6, eyeY, 4.8, 7.2, '#662248', '#DE4D94', true);
    
    // Right Eye (Near)
    this._drawAnimeEye(ctx, 5.6, eyeY, 5.8, 8.2, '#662248', '#DE4D94', true);
    
    // Delicate Curved Eyebrows
    ctx.strokeStyle = '#382018';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    // Left Brow
    ctx.beginPath();
    ctx.moveTo(-8, eyeY - 7.5);
    ctx.quadraticCurveTo(-4.5, eyeY - 10, -0.5, eyeY - 8);
    ctx.stroke();
    // Right Brow
    ctx.beginPath();
    ctx.moveTo(2, eyeY - 8.5);
    ctx.quadraticCurveTo(6, eyeY - 11, 10.5, eyeY - 8.5);
    ctx.stroke();
    
    // Cute Tiny Nose
    ctx.fillStyle = '#DE9980';
    ctx.beginPath();
    ctx.arc(0.5, headY + 7.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Glossy Sweet Anime Smile
    ctx.fillStyle = '#E85B7C';
    ctx.beginPath();
    ctx.ellipse(1.5, headY + 11.5, 2.5, 1.3, 0, 0, Math.PI);
    ctx.fill();
    
    // Rosy Cheeks Blush with Anime Sparkle Lines
    ctx.fillStyle = 'rgba(255, 110, 150, 0.28)';
    ctx.beginPath();
    ctx.ellipse(-5, headY + 7.5, 4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7.5, headY + 7.5, 4.5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // ── 7. SILKY FLOWING HAIR & SAKURA CLIP ──
    ctx.fillStyle = '#3A2218';
    
    // Top Hair Volume
    ctx.beginPath();
    ctx.ellipse(0, headY - 5, 16.5, 14.5, 0, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    
    // Soft See-Through Anime Bangs
    ctx.beginPath();
    ctx.moveTo(-14, headY - 2);
    ctx.quadraticCurveTo(-11, headY - 14, -5, headY - 5);
    ctx.lineTo(-2, headY - 3);
    ctx.quadraticCurveTo(1, headY - 12, 5, headY - 4);
    ctx.quadraticCurveTo(9, headY - 9, 13, headY - 1);
    ctx.lineTo(15, headY + 3);
    ctx.quadraticCurveTo(10, headY - 14, 0, headY - 17);
    ctx.quadraticCurveTo(-10, headY - 15, -15, headY - 3);
    ctx.closePath();
    ctx.fill();
    
    // Long Side Locks framing cheeks
    ctx.beginPath();
    ctx.moveTo(-13, headY);
    ctx.quadraticCurveTo(-15, headY + 12, -12, headY + 22);
    ctx.quadraticCurveTo(-10, headY + 16, -11, headY + 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, headY);
    ctx.quadraticCurveTo(15, headY + 12, 12, headY + 22);
    ctx.quadraticCurveTo(10, headY + 16, 11, headY + 5);
    ctx.fill();
    
    // Glossy Hair Ring (Angel Halo Highlight)
    ctx.fillStyle = 'rgba(255, 200, 170, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, headY - 10, 11, 2, -0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // Cute Sakura Flower Hairclip
    ctx.fillStyle = '#FF7B9B';
    const clipX = -10.5;
    const clipY = headY - 6;
    for (let p = 0; p < 5; p++) {
      const angle = (p * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(clipX + Math.cos(angle) * 3, clipY + Math.sin(angle) * 3, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Flower center
    ctx.fillStyle = '#FFE680';
    ctx.beginPath();
    ctx.arc(clipX, clipY, 1.5, 0, Math.PI * 2);
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
