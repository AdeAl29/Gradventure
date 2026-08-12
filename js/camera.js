/**
 * ============================================
 * GRADVENTURE — Camera System
 * ============================================
 * 
 * Smooth-follow camera with interpolation,
 * world bounds clamping, and zoom support.
 */

class Camera {
  constructor(canvasWidth, canvasHeight, worldWidth) {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.worldWidth = worldWidth;
    this.smoothing = CONFIG.GAME.CAMERA_SMOOTHING || 0.08;
    this.zoom = 1;
    this.targetZoom = 1;
    this.zoomSmoothing = 0.05;
    this.shakeAmount = 0;
    this.shakeDecay = 0.9;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  /**
   * Update canvas dimensions (on resize)
   */
  resize(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
  }
  
  /**
   * Follow a target position (player)
   * @param {number} targetX - Target X position in world space
   */
  follow(targetX) {
    // Center camera on target
    this.targetX = targetX - this.width / (2 * this.zoom);
    
    // Clamp to world bounds
    const maxX = this.worldWidth - this.width / this.zoom;
    this.targetX = clamp(this.targetX, 0, Math.max(0, maxX));
  }
  
  /**
   * Update camera position with smooth interpolation
   */
  update() {
    // Smooth camera movement
    if (prefersReducedMotion()) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.zoom = this.targetZoom;
    } else {
      this.x = lerp(this.x, this.targetX, this.smoothing);
      this.y = lerp(this.y, this.targetY, this.smoothing);
      this.zoom = lerp(this.zoom, this.targetZoom, this.zoomSmoothing);
    }
    
    // Apply screen shake
    if (this.shakeAmount > 0.5) {
      this.offsetX = randomRange(-this.shakeAmount, this.shakeAmount);
      this.offsetY = randomRange(-this.shakeAmount, this.shakeAmount);
      this.shakeAmount *= this.shakeDecay;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.shakeAmount = 0;
    }
  }
  
  /**
   * Apply camera transform to canvas context
   */
  applyTransform(ctx) {
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(
      -(this.x + this.offsetX),
      -(this.y + this.offsetY)
    );
  }
  
  /**
   * Restore canvas context
   */
  restoreTransform(ctx) {
    ctx.restore();
  }
  
  /**
   * Trigger screen shake
   * @param {number} intensity - Shake intensity in pixels
   */
  shake(intensity = 5) {
    this.shakeAmount = intensity;
  }
  
  /**
   * Set zoom level
   * @param {number} level - Zoom level (1 = normal)
   */
  setZoom(level) {
    this.targetZoom = level;
  }
  
  /**
   * Reset zoom to normal
   */
  resetZoom() {
    this.targetZoom = 1;
  }
  
  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX / this.zoom + this.x,
      y: screenY / this.zoom + this.y,
    };
  }
  
  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom,
    };
  }
  
  /**
   * Check if a world position is visible on screen
   */
  isVisible(worldX, worldY, margin = 50) {
    const screen = this.worldToScreen(worldX, worldY);
    return (
      screen.x >= -margin &&
      screen.x <= this.width + margin &&
      screen.y >= -margin &&
      screen.y <= this.height + margin
    );
  }
}
