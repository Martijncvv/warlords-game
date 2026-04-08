import * as THREE from 'three';

export class Projectile {
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  damage: number;
  active = true;
  life = 0;
  maxLife = 3;
  isAoE: boolean;
  aoERadius = 5;
  slowDuration = 0;
  slowFactor = 1;
  private style: 'arrow' | 'magic' | 'frost' | 'fire';
  private trail: THREE.Mesh[] = [];
  private scene: THREE.Scene | null = null;

  constructor(
    startPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    damage: number,
    style: 'arrow' | 'magic' | 'frost' | 'fire' = 'arrow'
  ) {
    this.damage = damage;
    this.style = style;
    this.isAoE = style === 'magic' || style === 'fire';
    if (style === 'fire') this.aoERadius = 8;

    this.mesh = new THREE.Group();

    switch (style) {
      case 'magic': {
        // Glowing purple orb
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xbb66ff })
        );
        this.mesh.add(orb);
        // Outer glow
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x9944ff, transparent: true, opacity: 0.25 })
        );
        this.mesh.add(glow);
        break;
      }
      case 'frost': {
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.35),
          new THREE.MeshBasicMaterial({ color: 0x66ccff })
        );
        this.mesh.add(crystal);
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.2 })
        );
        this.mesh.add(glow);
        break;
      }
      case 'fire': {
        const fireball = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff6600 })
        );
        this.mesh.add(fireball);
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.2 })
        );
        this.mesh.add(glow);
        break;
      }
      default: {
        // Arrow: shaft + feathers + tip
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4),
          new THREE.MeshBasicMaterial({ color: 0x8B6914 })
        );
        this.mesh.add(shaft);
        // Arrowhead
        const head = new THREE.Mesh(
          new THREE.ConeGeometry(0.1, 0.25, 4),
          new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
        );
        head.position.y = 0.7;
        this.mesh.add(head);
        // Feathers
        const featherMat = new THREE.MeshBasicMaterial({ color: 0xcc3333 });
        for (let i = 0; i < 3; i++) {
          const feather = new THREE.Mesh(
            new THREE.PlaneGeometry(0.15, 0.2),
            featherMat
          );
          feather.position.y = -0.5;
          feather.rotation.y = (i / 3) * Math.PI * 2;
          this.mesh.add(feather);
        }
        break;
      }
    }

    this.mesh.position.copy(startPos);
    this.mesh.position.y += 1.8;

    const dir = new THREE.Vector3().subVectors(targetPos, startPos);
    dir.y = 0;
    const dist = dir.length();
    dir.normalize();

    // Slower speed for visibility, gentler arc
    const speed = 35;
    this.velocity = dir.multiplyScalar(speed);
    this.velocity.y = dist * 0.25;

    // Orient along velocity
    this.orientToVelocity();
  }

  private orientToVelocity(): void {
    if (this.style === 'arrow') {
      // Point the arrow along its velocity (cylinder Y-axis aligned to velocity)
      const dir = this.velocity.clone().normalize();
      const axis = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(axis, dir);
      this.mesh.quaternion.copy(quat);
    }
  }

  update(dt: number): void {
    this.life += dt;
    this.velocity.y -= 20 * dt; // gentler gravity
    this.mesh.position.addScaledVector(this.velocity, dt);

    // Re-orient arrow each frame so it follows the arc
    if (this.style === 'arrow') {
      this.orientToVelocity();
    }

    // Spin magic/frost projectiles
    if (this.style === 'magic' || this.style === 'frost') {
      this.mesh.rotation.y += dt * 6;
    }

    // Flicker fire
    if (this.style === 'fire') {
      const s = 0.9 + Math.sin(this.life * 20) * 0.15;
      this.mesh.children[0].scale.setScalar(s);
    }

    // Spawn trail particles for magic/fire
    if ((this.style === 'magic' || this.style === 'fire') && this.scene && Math.random() < 0.6) {
      this.spawnTrail();
    }

    // Update trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = this.trail[i];
      t.scale.multiplyScalar(0.88);
      (t.material as THREE.MeshBasicMaterial).opacity *= 0.88;
      if (t.scale.x < 0.05) {
        this.scene?.remove(t);
        t.geometry.dispose();
        (t.material as THREE.Material).dispose();
        this.trail.splice(i, 1);
      }
    }

    if (this.mesh.position.y < 0 || this.life > this.maxLife) {
      this.active = false;
    }
  }

  private spawnTrail(): void {
    const color = this.style === 'magic' ? 0x9944ff : 0xff6600;
    const t = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 4, 4),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 })
    );
    t.position.copy(this.mesh.position);
    this.scene?.add(t);
    this.trail.push(t);
  }

  /** Call after adding to scene so trail particles can be added */
  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  dispose(): void {
    // Clean up trail
    for (const t of this.trail) {
      this.scene?.remove(t);
      t.geometry.dispose();
      (t.material as THREE.Material).dispose();
    }
    this.trail.length = 0;

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}
