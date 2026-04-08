import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: THREE.Scene;
  private pool: Particle[] = [];
  private geo = new THREE.SphereGeometry(0.15, 4, 4);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    // Pre-populate pool
    for (let i = 0; i < 100; i++) {
      this.pool.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const mesh = new THREE.Mesh(this.geo, mat);
    mesh.visible = false;
    this.scene.add(mesh);
    return {
      mesh,
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0,
      active: false,
    };
  }

  emit(position: THREE.Vector3, color: number, count = 5): void {
    for (let i = 0; i < count; i++) {
      let p = this.pool.pop();
      if (!p) p = this.createParticle();

      (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
      p.mesh.position.copy(position);
      p.mesh.visible = true;
      p.mesh.scale.setScalar(1);
      p.velocity.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );
      p.life = 0;
      p.maxLife = 0.3 + Math.random() * 0.4;
      p.active = true;
      this.particles.push(p);
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        this.pool.push(p);
        this.particles.splice(i, 1);
        continue;
      }
      p.velocity.y -= 15 * dt; // gravity
      p.mesh.position.addScaledVector(p.velocity, dt);
      const t = p.life / p.maxLife;
      p.mesh.scale.setScalar(1 - t);
    }
  }
}
