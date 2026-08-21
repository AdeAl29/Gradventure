/**
 * ============================================
 * GRADVENTURE — NPC System
 * ============================================
 * 
 * 6 unique anime-style NPCs with dialog bubbles.
 * Each NPC has idle animation and proximity-triggered dialog.
 */

class NPC {
  constructor(x, groundY, type, dialog, facingDir = 1) {
    this.x = x;
    this.groundY = groundY;
    this.y = groundY - 60; // NPC height ~60
    this.type = type; // 0-5
    this.dialog = dialog;
    this.facingDir = facingDir;
    this.originalDir = facingDir;
    
    // Dialog state
    this.dialogVisible = false;
    this.dialogAlpha = 0;
    this.dialogTimer = 0;
    
    // Animation
    this.breathCycle = Math.random() * Math.PI * 2;
    this.headBob = Math.random() * Math.PI * 2;
    this.armSway = Math.random() * Math.PI * 2;
    
    // Proximity
    this.dialogRadius = 200;
    this.hasBeenTriggered = false;
  }
  
  /**
   * Update NPC animation and dialog state
   */
  update(playerX) {
    this.breathCycle += 0.025;
    this.headBob += 0.02;
    this.armSway += 0.015;
    
    const distance = Math.abs(playerX - this.x);
    
    // Face the player when near
    if (distance < this.dialogRadius) {
      this.facingDir = playerX > this.x ? 1 : -1;
      
      if (!this.dialogVisible) {
        this.dialogVisible = true;
        this.dialogTimer = 0;
      }
      this.dialogTimer++;
    } else {
      if (this.dialogVisible && this.dialogTimer > 60) {
        this.dialogVisible = false;
      }
      this.facingDir = this.originalDir;
    }
    
    // Smooth dialog alpha
    const targetAlpha = this.dialogVisible ? 1 : 0;
    this.dialogAlpha += (targetAlpha - this.dialogAlpha) * 0.08;
  }
  
  /**
   * Draw NPC character
   */
  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    
    // Skip if off-screen
    if (screenX < -100 || screenX > ctx.canvas.width + 100) return;
    
    ctx.save();
    ctx.translate(screenX, this.groundY);
    
    if (this.facingDir === -1) {
      ctx.scale(-1, 1);
    }
    
    const breath = Math.sin(this.breathCycle) * 1;
    const bob = Math.sin(this.headBob) * 0.5;
    const arm = Math.sin(this.armSway) * 2;
    
    switch (this.type) {
      case 0: this._drawGeekyGuy(ctx, breath, bob, arm); break;
      case 1: this._drawHijabGirl(ctx, breath, bob, arm); break;
      case 2: this._drawProfessor(ctx, breath, bob, arm); break;
      case 3: this._drawCasualGuy(ctx, breath, bob, arm); break;
      case 4: this._drawShortHairGirl(ctx, breath, bob, arm); break;
      case 5: this._drawSecurityGuard(ctx, breath, bob, arm); break;
    }
    
    ctx.restore();
    
    // Draw dialog bubble (always in correct orientation)
    if (this.dialogAlpha > 0.01) {
      this._drawDialogBubble(ctx, screenX, this.groundY);
    }
  }
  
  /**
   * NPC 0: Geeky guy with glasses (hoodie)
   */
  _drawGeekyGuy(ctx, breath, bob, arm) {
    const by = -55 + breath;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Legs
    ctx.strokeStyle = '#3A3A4A'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-5, by + 38); ctx.lineTo(-5, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, by + 38); ctx.lineTo(5, -2); ctx.stroke();
    // Shoes
    ctx.fillStyle = '#4A4A5A';
    ctx.beginPath(); ctx.ellipse(-5, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    
    // Body (hoodie)
    ctx.fillStyle = '#3B6B3B';
    ctx.beginPath(); ctx.roundRect(-12, by + 16, 24, 24, 4); ctx.fill();
    // Hoodie pocket
    ctx.fillStyle = '#336633';
    ctx.beginPath(); ctx.roundRect(-8, by + 30, 16, 8, 2); ctx.fill();
    // Hood string
    ctx.strokeStyle = '#CCCCCC'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-3, by + 16); ctx.lineTo(-3, by + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, by + 16); ctx.lineTo(3, by + 24); ctx.stroke();
    
    // Arms
    ctx.strokeStyle = '#3B6B3B'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-12, by + 20); ctx.lineTo(-14 + arm, by + 34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, by + 20); ctx.lineTo(14 - arm, by + 34); ctx.stroke();
    // Hands
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.arc(-14 + arm, by + 35, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14 - arm, by + 35, 2.5, 0, Math.PI * 2); ctx.fill();
    
    // Head
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(0, by + 6 + bob, 12, 13, 0, 0, Math.PI * 2); ctx.fill();
    // Hair (messy brown)
    ctx.fillStyle = '#4A3020';
    ctx.beginPath();
    ctx.ellipse(0, by + 1 + bob, 14, 11, 0, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    // Messy bangs
    ctx.beginPath();
    ctx.moveTo(-10, by + 3 + bob); ctx.lineTo(-6, by - 6 + bob);
    ctx.lineTo(-2, by + 2 + bob); ctx.lineTo(3, by - 5 + bob);
    ctx.lineTo(8, by + 1 + bob); ctx.lineTo(12, by - 4 + bob);
    ctx.lineTo(14, by + 4 + bob);
    ctx.closePath(); ctx.fill();
    
    // Glasses
    ctx.strokeStyle = '#333333'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(4, by + 7 + bob, 5, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-5, by + 7 + bob, 4, 4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, by + 7 + bob); ctx.lineTo(0, by + 7 + bob); ctx.stroke();
    // Eyes behind glasses
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.arc(4, by + 8 + bob, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-5, by + 8 + bob, 1.2, 0, Math.PI * 2); ctx.fill();
    // Eye highlight
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(3.5, by + 7 + bob, 0.7, 0, Math.PI * 2); ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#B8845C'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(2, by + 12 + bob, 2.5, 0.1, Math.PI * 0.7); ctx.stroke();
  }
  
  /**
   * NPC 1: Hijab girl (casual)
   */
  _drawHijabGirl(ctx, breath, bob, arm) {
    const by = -55 + breath;
    
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Legs
    ctx.strokeStyle = '#2A2A3A'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, by + 40); ctx.lineTo(-4, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, by + 40); ctx.lineTo(4, -2); ctx.stroke();
    ctx.fillStyle = '#2A2A3A';
    ctx.beginPath(); ctx.ellipse(-4, 0, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, 0, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    
    // Long skirt/dress
    ctx.fillStyle = '#7B4570';
    ctx.beginPath();
    ctx.moveTo(-13, by + 20);
    ctx.lineTo(-15, by + 42);
    ctx.quadraticCurveTo(0, by + 44, 15, by + 42);
    ctx.lineTo(13, by + 20);
    ctx.closePath(); ctx.fill();
    
    // Body (tunic top)
    ctx.fillStyle = '#7B4570';
    ctx.beginPath(); ctx.roundRect(-12, by + 16, 24, 22, 3); ctx.fill();
    // Tunic decoration
    ctx.strokeStyle = '#9B6590'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-10, by + 17); ctx.lineTo(-10, by + 36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, by + 17); ctx.lineTo(10, by + 36); ctx.stroke();
    
    // Arms
    ctx.strokeStyle = '#7B4570'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-12, by + 20); ctx.lineTo(-14 + arm, by + 34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, by + 20); ctx.lineTo(14 - arm, by + 32); ctx.stroke();
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.arc(-14 + arm, by + 35, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14 - arm, by + 33, 2.5, 0, Math.PI * 2); ctx.fill();
    
    // Holding book
    ctx.fillStyle = '#C44D6E';
    ctx.beginPath(); ctx.roundRect(12 - arm, by + 28, 8, 10, 1); ctx.fill();
    
    // Head
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(0, by + 6 + bob, 11, 12, 0, 0, Math.PI * 2); ctx.fill();
    
    // Hijab
    ctx.fillStyle = '#5A3A6A';
    // Top dome
    ctx.beginPath();
    ctx.ellipse(0, by + 2 + bob, 15, 14, 0, Math.PI * 0.65, Math.PI * 2.35);
    ctx.fill();
    // Draping sides
    ctx.beginPath();
    ctx.moveTo(-15, by + 6 + bob);
    ctx.quadraticCurveTo(-16, by + 20 + bob, -12, by + 30);
    ctx.lineTo(-8, by + 28);
    ctx.quadraticCurveTo(-10, by + 18 + bob, -13, by + 8 + bob);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, by + 6 + bob);
    ctx.quadraticCurveTo(16, by + 20 + bob, 12, by + 30);
    ctx.lineTo(8, by + 28);
    ctx.quadraticCurveTo(10, by + 18 + bob, 13, by + 8 + bob);
    ctx.closePath(); ctx.fill();
    // Front fabric
    ctx.beginPath();
    ctx.ellipse(0, by + 14 + bob, 12, 6, 0, 0, Math.PI);
    ctx.fill();
    
    // Face features
    // Eyes (both eyes)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(-4.5, by + 7 + bob, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.5, by + 7 + bob, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3A2A1A';
    ctx.beginPath(); ctx.ellipse(-4.5, by + 7.5 + bob, 2.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.5, by + 7.5 + bob, 3, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1A0A00';
    ctx.beginPath(); ctx.arc(-4.5, by + 8 + bob, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, by + 8 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(-5.2, by + 6.5 + bob, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5, by + 6.5 + bob, 1.2, 0, Math.PI * 2); ctx.fill();
    // Eyelashes
    ctx.strokeStyle = '#1A0A10'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-8, by + 3.5 + bob); ctx.quadraticCurveTo(-4.5, by + 1.5 + bob, -1, by + 3.5 + bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1, by + 3 + bob); ctx.quadraticCurveTo(5, by + 1 + bob, 9, by + 3 + bob); ctx.stroke();
    // Eyebrows
    ctx.strokeStyle = '#3A2A1A'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-7.5, by + 1.5 + bob); ctx.quadraticCurveTo(-4.5, by - 0.5 + bob, -1.5, by + 1.5 + bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1.5, by + 1 + bob); ctx.quadraticCurveTo(5, by - 1 + bob, 8.5, by + 1 + bob); ctx.stroke();
    
    // Smile
    ctx.fillStyle = '#D4707A';
    ctx.beginPath(); ctx.ellipse(3, by + 12 + bob, 2, 1, 0, 0, Math.PI); ctx.fill();
    // Blush
    ctx.fillStyle = 'rgba(255,140,160,0.3)';
    ctx.beginPath(); ctx.ellipse(9, by + 9 + bob, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  
  /**
   * NPC 2: Professor (kemeja + glasses + kumis)
   */
  _drawProfessor(ctx, breath, bob, arm) {
    const by = -58 + breath;
    
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Legs
    ctx.strokeStyle = '#3A3A4A'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, by + 42); ctx.lineTo(-6, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, by + 42); ctx.lineTo(6, -2); ctx.stroke();
    ctx.fillStyle = '#2A2A3A';
    ctx.beginPath(); ctx.ellipse(-6, 0, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, 0, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    
    // Body (kemeja)
    ctx.fillStyle = '#E8E0D4';
    ctx.beginPath(); ctx.roundRect(-14, by + 18, 28, 26, 4); ctx.fill();
    // Collar
    ctx.fillStyle = '#D8D0C4';
    ctx.beginPath();
    ctx.moveTo(-5, by + 18); ctx.lineTo(0, by + 28); ctx.lineTo(-14, by + 24);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, by + 18); ctx.lineTo(0, by + 28); ctx.lineTo(14, by + 24);
    ctx.closePath(); ctx.fill();
    // Pocket
    ctx.strokeStyle = '#C8C0B4'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(4, by + 28, 8, 8, 1); ctx.stroke();
    // Pen in pocket
    ctx.fillStyle = '#1A4080';
    ctx.fillRect(6, by + 26, 2, 6);
    
    // Arms
    ctx.strokeStyle = '#E8E0D4'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-14, by + 22); ctx.lineTo(-17 + arm, by + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, by + 22); ctx.lineTo(17 - arm, by + 36); ctx.stroke();
    ctx.fillStyle = '#C8A070';
    ctx.beginPath(); ctx.arc(-17 + arm, by + 39, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(17 - arm, by + 37, 3, 0, Math.PI * 2); ctx.fill();
    
    // Head
    ctx.fillStyle = '#C8A070';
    ctx.beginPath(); ctx.ellipse(0, by + 8 + bob, 13, 14, 0, 0, Math.PI * 2); ctx.fill();
    // Hair (balding, gray)
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.ellipse(0, by + 3 + bob, 14, 10, 0, Math.PI * 0.75, Math.PI * 2.25);
    ctx.fill();
    // Bald top
    ctx.fillStyle = '#C8A070';
    ctx.beginPath();
    ctx.ellipse(0, by + 1 + bob, 9, 7, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Glasses (square)
    ctx.strokeStyle = '#4A4A4A'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(1, by + 5 + bob, 9, 7, 1); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-9, by + 5 + bob, 8, 7, 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, by + 8 + bob); ctx.lineTo(1, by + 8 + bob); ctx.stroke();
    // Eyes behind glasses
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath(); ctx.arc(5, by + 9 + bob, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-5, by + 9 + bob, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(4.5, by + 8 + bob, 0.6, 0, Math.PI * 2); ctx.fill();
    
    // Mustache
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.moveTo(-5, by + 14 + bob);
    ctx.quadraticCurveTo(-3, by + 12 + bob, 0, by + 14 + bob);
    ctx.quadraticCurveTo(3, by + 12 + bob, 6, by + 14 + bob);
    ctx.quadraticCurveTo(3, by + 16 + bob, 0, by + 15 + bob);
    ctx.quadraticCurveTo(-3, by + 16 + bob, -5, by + 14 + bob);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#A08060'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(1, by + 16 + bob, 2, 0.1, Math.PI * 0.8); ctx.stroke();
  }
  
  /**
   * NPC 3: Casual guy (kaos + topi)
   */
  _drawCasualGuy(ctx, breath, bob, arm) {
    const by = -54 + breath;
    
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Legs (jeans)
    ctx.strokeStyle = '#4A6090'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-5, by + 38); ctx.lineTo(-5, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, by + 38); ctx.lineTo(5, -2); ctx.stroke();
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath(); ctx.ellipse(-5, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    
    // Body (T-shirt)
    ctx.fillStyle = '#E85050';
    ctx.beginPath(); ctx.roundRect(-12, by + 16, 24, 24, 4); ctx.fill();
    // T-shirt design (simple star)
    ctx.fillStyle = '#F0E0A0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 0, by + 32);
    
    // Arms
    ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-12, by + 20); ctx.lineTo(-14 + arm, by + 34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, by + 20); ctx.lineTo(14 - arm, by + 34); ctx.stroke();
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.arc(-14 + arm, by + 35, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14 - arm, by + 35, 2.5, 0, Math.PI * 2); ctx.fill();
    
    // Holding phone
    ctx.fillStyle = '#222222';
    ctx.beginPath(); ctx.roundRect(12 - arm, by + 30, 5, 9, 1); ctx.fill();
    ctx.fillStyle = '#4488CC';
    ctx.beginPath(); ctx.roundRect(13 - arm, by + 31, 3, 6, 0.5); ctx.fill();
    
    // Head
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(0, by + 6 + bob, 12, 13, 0, 0, Math.PI * 2); ctx.fill();
    // Hair under cap
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath();
    ctx.moveTo(-12, by + 6 + bob); ctx.lineTo(-13, by + 12 + bob);
    ctx.quadraticCurveTo(-12, by + 14 + bob, -10, by + 12 + bob);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, by + 6 + bob); ctx.lineTo(13, by + 12 + bob);
    ctx.quadraticCurveTo(12, by + 14 + bob, 10, by + 12 + bob);
    ctx.closePath(); ctx.fill();
    
    // Cap
    ctx.fillStyle = '#2A4A8A';
    ctx.beginPath();
    ctx.ellipse(0, by + 2 + bob, 14, 10, 0, Math.PI * 0.75, Math.PI * 2.25);
    ctx.fill();
    // Cap brim
    ctx.fillStyle = '#1E3A7A';
    ctx.beginPath();
    ctx.ellipse(8, by + 4 + bob, 12, 4, 0.3, -Math.PI * 0.3, Math.PI * 0.8);
    ctx.fill();
    
    // Eyes (both eyes)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(-4.5, by + 8 + bob, 3.5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, by + 8 + bob, 4, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath(); ctx.ellipse(-4.5, by + 8.5 + bob, 2.4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5.5, by + 8.5 + bob, 2.8, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath(); ctx.arc(-4.5, by + 9 + bob, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, by + 9 + bob, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(-5.2, by + 7.5 + bob, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.5, by + 7.5 + bob, 1, 0, Math.PI * 2); ctx.fill();
    
    // Big grin
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(3, by + 14 + bob, 4, 2, 0, 0, Math.PI); ctx.fill();
    ctx.strokeStyle = '#B8845C'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(3, by + 14 + bob, 4, 2, 0, 0, Math.PI); ctx.stroke();
  }
  
  /**
   * NPC 4: Short hair girl (casual dress)
   */
  _drawShortHairGirl(ctx, breath, bob, arm) {
    const by = -53 + breath;
    
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Legs
    ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, by + 40); ctx.lineTo(-4, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, by + 40); ctx.lineTo(4, -2); ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(-4, 0, 4.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, 0, 4.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    
    // Dress
    ctx.fillStyle = '#5B8CC8';
    ctx.beginPath();
    ctx.moveTo(-12, by + 18);
    ctx.lineTo(-14, by + 42);
    ctx.quadraticCurveTo(0, by + 44, 14, by + 42);
    ctx.lineTo(12, by + 18);
    ctx.closePath(); ctx.fill();
    // Belt
    ctx.fillStyle = '#C9A84C';
    ctx.beginPath(); ctx.roundRect(-12, by + 32, 24, 3, 1); ctx.fill();
    
    // Body
    ctx.fillStyle = '#5B8CC8';
    ctx.beginPath(); ctx.roundRect(-11, by + 16, 22, 18, 3); ctx.fill();
    // Collar detail
    ctx.fillStyle = '#4B7CB8';
    ctx.beginPath();
    ctx.moveTo(-3, by + 16); ctx.lineTo(0, by + 22); ctx.lineTo(3, by + 16);
    ctx.closePath(); ctx.fill();
    
    // Arms
    ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(-11, by + 20); ctx.lineTo(-13 + arm, by + 32); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, by + 20); ctx.lineTo(13 - arm, by + 32); ctx.stroke();
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.arc(-13 + arm, by + 33, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13 - arm, by + 33, 2.5, 0, Math.PI * 2); ctx.fill();
    
    // Head
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(0, by + 6 + bob, 11, 12.5, 0, 0, Math.PI * 2); ctx.fill();
    // Short bob hair
    ctx.fillStyle = '#4A2A1A';
    ctx.beginPath();
    ctx.ellipse(0, by + 2 + bob, 14, 12, 0, Math.PI * 0.7, Math.PI * 2.3);
    ctx.fill();
    // Bangs
    ctx.beginPath();
    ctx.moveTo(-12, by + 3 + bob);
    ctx.quadraticCurveTo(-8, by - 4 + bob, -4, by + 1 + bob);
    ctx.quadraticCurveTo(0, by - 5 + bob, 4, by + 1 + bob);
    ctx.quadraticCurveTo(8, by - 3 + bob, 12, by + 3 + bob);
    ctx.lineTo(14, by - 2 + bob);
    ctx.quadraticCurveTo(0, by - 14 + bob, -14, by - 2 + bob);
    ctx.closePath(); ctx.fill();
    // Side hair
    ctx.beginPath(); ctx.ellipse(-12, by + 8 + bob, 4, 10, -0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, by + 8 + bob, 3, 9, 0.1, 0, Math.PI * 2); ctx.fill();
    
    // Eyes (both eyes)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(-4.5, by + 7 + bob, 3.8, 4.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.5, by + 7 + bob, 4.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4A7A5A';
    ctx.beginPath(); ctx.ellipse(-4.5, by + 7.5 + bob, 2.8, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.5, by + 7.5 + bob, 3.5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1A3A1A';
    ctx.beginPath(); ctx.arc(-4.5, by + 8 + bob, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, by + 8 + bob, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(-5.2, by + 6.5 + bob, 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5, by + 6.5 + bob, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, by + 9 + bob, 0.7, 0, Math.PI * 2); ctx.fill();
    // Eyelashes
    ctx.strokeStyle = '#2A1A0A'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-8, by + 3.5 + bob); ctx.quadraticCurveTo(-4.5, by + 1 + bob, -1, by + 3.5 + bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, by + 3 + bob); ctx.quadraticCurveTo(4, by + 0.5 + bob, 9, by + 3 + bob); ctx.stroke();
    
    // Cute mouth
    ctx.fillStyle = '#E06080';
    ctx.beginPath(); ctx.ellipse(3, by + 13 + bob, 2, 1, 0, 0, Math.PI); ctx.fill();
    // Blush
    ctx.fillStyle = 'rgba(255,140,160,0.25)';
    ctx.beginPath(); ctx.ellipse(9, by + 10 + bob, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  
  /**
   * NPC 5: Security guard (seragam)
   */
  _drawSecurityGuard(ctx, breath, bob, arm) {
    const by = -60 + breath;
    
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    
    // Legs (wide stance)
    ctx.strokeStyle = '#2A2A3A'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-7, by + 44); ctx.lineTo(-7, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, by + 44); ctx.lineTo(7, -2); ctx.stroke();
    ctx.fillStyle = '#1A1A24';
    ctx.beginPath(); ctx.ellipse(-7, 0, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, 0, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    
    // Body (uniform)
    ctx.fillStyle = '#5A7A5A';
    ctx.beginPath(); ctx.roundRect(-15, by + 18, 30, 28, 4); ctx.fill();
    // Pockets
    ctx.strokeStyle = '#4A6A4A'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(-12, by + 28, 9, 8, 1); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(3, by + 28, 9, 8, 1); ctx.stroke();
    // Badge
    ctx.fillStyle = '#C9A84C';
    ctx.beginPath(); ctx.arc(-7, by + 22, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A08830';
    ctx.beginPath(); ctx.arc(-7, by + 22, 1.5, 0, Math.PI * 2); ctx.fill();
    // Belt
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath(); ctx.roundRect(-15, by + 40, 30, 4, 1); ctx.fill();
    ctx.fillStyle = '#C9A84C';
    ctx.beginPath(); ctx.roundRect(-3, by + 39, 6, 6, 1); ctx.fill();
    
    // Arms
    ctx.strokeStyle = '#5A7A5A'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-15, by + 22); ctx.lineTo(-18, by + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, by + 22); ctx.lineTo(18, by + 38); ctx.stroke();
    ctx.fillStyle = '#C8A070';
    ctx.beginPath(); ctx.arc(-18, by + 39, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, by + 39, 3.5, 0, Math.PI * 2); ctx.fill();
    
    // Head
    ctx.fillStyle = '#C8A070';
    ctx.beginPath(); ctx.ellipse(0, by + 8 + bob, 13, 14, 0, 0, Math.PI * 2); ctx.fill();
    // Short military hair
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(0, by + 3 + bob, 14, 11, 0, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    
    // Cap/beret
    ctx.fillStyle = '#4A6A4A';
    ctx.beginPath();
    ctx.ellipse(0, by - 2 + bob, 15, 8, 0, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    ctx.fillStyle = '#3A5A3A';
    ctx.beginPath();
    ctx.ellipse(0, by + 1 + bob, 16, 4, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Eyes (serious)
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath(); ctx.ellipse(5, by + 9 + bob, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-5, by + 9 + bob, 1.8, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(4.5, by + 8 + bob, 0.7, 0, Math.PI * 2); ctx.fill();
    // Thick eyebrows
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath(); ctx.roundRect(2, by + 4 + bob, 7, 2, 1); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-8, by + 4 + bob, 6, 2, 1); ctx.fill();
    
    // Stern mouth
    ctx.strokeStyle = '#A08060'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-3, by + 15 + bob); ctx.lineTo(5, by + 15 + bob); ctx.stroke();
  }
  
  /**
   * Draw dialog bubble
   */
  _drawDialogBubble(ctx, screenX, groundY) {
    if (this.dialogAlpha < 0.01) return;
    
    ctx.save();
    ctx.globalAlpha = this.dialogAlpha;
    
    const text = this.dialog;
    ctx.font = '600 13px Inter, sans-serif';
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const padX = 14;
    const padY = 10;
    const bubbleW = textW + padX * 2;
    const bubbleH = 28 + padY;
    const bubbleX = screenX - bubbleW / 2;
    const bubbleY = groundY - 85;
    const tailSize = 8;
    
    // Bubble shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(bubbleX + 2, bubbleY + 2, bubbleW, bubbleH, 14);
    ctx.fill();
    
    // Bubble body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 14);
    ctx.fill();
    
    // Bubble border
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 14);
    ctx.stroke();
    
    // Tail triangle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(screenX - tailSize, bubbleY + bubbleH);
    ctx.lineTo(screenX, bubbleY + bubbleH + tailSize);
    ctx.lineTo(screenX + tailSize, bubbleY + bubbleH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(screenX - tailSize, bubbleY + bubbleH);
    ctx.lineTo(screenX, bubbleY + bubbleH + tailSize);
    ctx.lineTo(screenX + tailSize, bubbleY + bubbleH);
    ctx.stroke();
    // Cover the tail-body junction
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(screenX - tailSize + 1, bubbleY + bubbleH - 1, tailSize * 2 - 2, 2);
    
    // Text
    ctx.fillStyle = '#2A2A2A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, screenX, bubbleY + bubbleH / 2);
    
    ctx.restore();
  }
}
