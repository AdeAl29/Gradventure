/**
 * ============================================
 * GRADVENTURE — Particle System
 * ============================================
 * 
 * Lightweight canvas particle system for
 * sparkles, floating lights, leaves, petals.
 */

class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || randomRange(-0.5, 0.5);
    this.vy = options.vy || randomRange(-1, -0.3);
    this.size = options.size || randomRange(1, 3);
    this.life = options.life || randomRange(60, 120);
    this.maxLife = this.life;
    this.color = options.color || 'rgba(201, 168, 76, 0.6)';
    this.gravity = options.gravity || 0;
    this.shrink = options.shrink !== undefined ? options.shrink : true;
    this.type = options.type || 'circle'; // circle, sparkle, leaf
    this.rotation = randomRange(0, Math.PI * 2);
    this.rotationSpeed = options.rotationSpeed || randomRange(-0.03, 0.03);
    this.opacity = 1;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life--;
    this.rotation += this.rotationSpeed;
    
    const lifeRatio = this.life / this.maxLife;
    this.opacity = lifeRatio;
    
    if (this.shrink) {
      this.currentSize = this.size * lifeRatio;
    } else {
      this.currentSize = this.size;
    }
    
    return this.life > 0;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    if (this.type === 'sparkle') {
      this._drawSparkle(ctx);
    } else if (this.type === 'leaf') {
      this._drawLeaf(ctx);
    } else if (this.type === 'petal') {
      this._drawPetal(ctx);
    } else {
      this._drawCircle(ctx);
    }
    
    ctx.restore();
  }
  
  _drawCircle(ctx) {
    const s = this.currentSize;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  
  _drawSparkle(ctx) {
    const s = this.currentSize;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
      ctx.lineTo(Math.cos(angle + Math.PI / 4) * s * 0.4, Math.sin(angle + Math.PI / 4) * s * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  _drawLeaf(ctx) {
    const s = this.currentSize * 2;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  _drawPetal(ctx) {
    const s = this.currentSize * 1.5;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.8, -s * 0.3, 0, s * 0.5);
    ctx.quadraticCurveTo(-s * 0.8, -s * 0.3, 0, -s);
    ctx.fill();
  }
}

/**
 * Particle Emitter — manages a collection of particles
 */
class ParticleEmitter {
  constructor() {
    this.particles = [];
  }
  
  /**
   * Emit particles at a position
   */
  emit(x, y, count = 5, options = {}) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        x + randomRange(-10, 10),
        y + randomRange(-10, 10),
        options
      ));
    }
  }
  
  /**
   * Emit sparkle burst (for chest opening)
   */
  emitBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = randomRange(1, 4);
      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: randomRange(2, 5),
        life: randomRange(40, 80),
        color: `hsl(${randomRange(38, 50)}, 70%, ${randomRange(50, 80)}%)`,
        type: 'sparkle',
        gravity: 0.02,
      }));
    }
  }
  
  /**
   * Continuous gentle sparkle (for chest glow)
   */
  emitSparkle(x, y) {
    this.particles.push(new Particle(
      x + randomRange(-20, 20),
      y + randomRange(-20, 10),
      {
        vx: randomRange(-0.3, 0.3),
        vy: randomRange(-0.8, -0.2),
        size: randomRange(1, 3),
        life: randomRange(30, 60),
        color: `rgba(201, 168, 76, ${randomRange(0.3, 0.7)})`,
        type: 'sparkle',
      }
    ));
  }
  
  /**
   * Emit floating light particles
   */
  emitFloatingLight(x, y) {
    this.particles.push(new Particle(x, y, {
      vx: randomRange(-0.2, 0.2),
      vy: randomRange(-0.5, -0.1),
      size: randomRange(1, 2.5),
      life: randomRange(80, 160),
      color: `rgba(255, 248, 220, ${randomRange(0.2, 0.5)})`,
      type: 'circle',
      shrink: false,
    }));
  }
  
  /**
   * Emit falling leaves
   */
  emitLeaf(x, y) {
    this.particles.push(new Particle(x, y, {
      vx: randomRange(-0.3, 0.5),
      vy: randomRange(0.3, 0.8),
      size: randomRange(2, 4),
      life: randomRange(120, 200),
      color: `hsl(${randomRange(80, 130)}, ${randomRange(30, 50)}%, ${randomRange(40, 60)}%)`,
      type: 'leaf',
      gravity: 0.005,
      rotationSpeed: randomRange(-0.05, 0.05),
      shrink: false,
    }));
  }
  
  /**
   * Emit flower petals
   */
  emitPetal(x, y) {
    this.particles.push(new Particle(x, y, {
      vx: randomRange(-0.5, 0.5),
      vy: randomRange(-0.5, 0.5),
      size: randomRange(2, 4),
      life: randomRange(100, 180),
      color: `hsl(${randomRange(340, 360)}, ${randomRange(40, 60)}%, ${randomRange(75, 90)}%)`,
      type: 'petal',
      gravity: 0.008,
      rotationSpeed: randomRange(-0.04, 0.04),
      shrink: false,
    }));
  }
  
  /**
   * Update all particles
   */
  update() {
    this.particles = this.particles.filter(p => p.update());
  }
  
  /**
   * Draw all particles
   */
  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }
  
  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }
  
  /**
   * Get particle count
   */
  get count() {
    return this.particles.length;
  }
}
