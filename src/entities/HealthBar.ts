import * as THREE from 'three';

export class HealthBar {
  sprite: THREE.Sprite;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 64;
    this.canvas.height = 8;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;

    const mat = new THREE.SpriteMaterial({ map: this.texture, depthTest: false });
    this.sprite = new THREE.Sprite(mat);
    this.sprite.scale.set(1.5, 0.2, 1);
    this.sprite.position.y = 2.8;
  }

  update(ratio: number): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, w, h);

    // Health
    const fillW = Math.max(0, ratio) * w;
    this.ctx.fillStyle = ratio > 0.5 ? '#4CAF50' : ratio > 0.25 ? '#FF9800' : '#F44336';
    this.ctx.fillRect(0, 0, fillW, h);

    this.texture.needsUpdate = true;
  }

  dispose(): void {
    this.texture.dispose();
    (this.sprite.material as THREE.SpriteMaterial).dispose();
  }
}
