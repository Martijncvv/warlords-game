import * as THREE from 'three';

interface FloatingLabel {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class FloatingText {
  private labels: FloatingLabel[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawn(position: THREE.Vector3, text: string, color: string, size = 1.2): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Text with outline for readability
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, 64, 32);
    ctx.fillStyle = color;
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size * 2, size, 1);
    sprite.position.copy(position);
    sprite.position.y += 2.5;
    // Slight random horizontal offset so numbers don't stack
    sprite.position.x += (Math.random() - 0.5) * 1.5;
    sprite.position.z += (Math.random() - 0.5) * 0.5;

    this.scene.add(sprite);
    this.labels.push({
      sprite,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        4 + Math.random() * 2,
        0
      ),
      life: 0,
      maxLife: 0.9,
    });
  }

  /** Convenience: spawn damage number with auto color */
  spawnDamage(position: THREE.Vector3, damage: number, isCrit = false): void {
    const text = Math.round(damage).toString();
    const color = isCrit ? '#ffdd00' : '#ffffff';
    const size = isCrit ? 1.6 : 1.2;
    this.spawn(position, text, color, size);
  }

  /** Gold income floating text */
  spawnGold(position: THREE.Vector3, amount: number): void {
    this.spawn(position, `+${amount}g`, '#ffd700', 1.0);
  }

  update(dt: number): void {
    for (let i = this.labels.length - 1; i >= 0; i--) {
      const label = this.labels[i];
      label.life += dt;

      if (label.life >= label.maxLife) {
        this.scene.remove(label.sprite);
        label.sprite.material.map?.dispose();
        label.sprite.material.dispose();
        this.labels.splice(i, 1);
        continue;
      }

      // Float upward, decelerate
      label.velocity.y -= 3 * dt;
      label.sprite.position.addScaledVector(label.velocity, dt);

      // Fade out in second half
      const t = label.life / label.maxLife;
      if (t > 0.5) {
        (label.sprite.material as THREE.SpriteMaterial).opacity = 1 - (t - 0.5) * 2;
      }

      // Scale up slightly at start
      if (t < 0.15) {
        const s = 0.5 + t / 0.15 * 0.5;
        label.sprite.scale.multiplyScalar(1 + (1 - s) * 0.1);
      }
    }
  }

  clear(): void {
    for (const label of this.labels) {
      this.scene.remove(label.sprite);
      label.sprite.material.map?.dispose();
      label.sprite.material.dispose();
    }
    this.labels.length = 0;
  }
}
