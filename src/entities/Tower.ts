import * as THREE from 'three';
import { TowerType } from '../types';
import { TowerStats } from '../types';
import { TOWER_STATS } from '../constants';
import { Unit } from './Unit';

export class Tower {
  mesh: THREE.Group;
  type: TowerType;
  stats: TowerStats;
  slotIndex: number;
  attackTimer = 0;
  target: Unit | null = null;

  constructor(type: TowerType, slotIndex: number, position: THREE.Vector3) {
    this.type = type;
    this.slotIndex = slotIndex;
    this.stats = TOWER_STATS[type];
    this.mesh = this.buildMesh(type);
    this.mesh.position.copy(position);
    this.mesh.position.y = 1; // on top of platform
  }

  private buildMesh(type: TowerType): THREE.Group {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x999999 });

    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.3, 3, 8), stoneMat);
    base.position.y = 1.5;
    base.castShadow = true;
    group.add(base);

    // Crenellations
    const crenGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cren = new THREE.Mesh(crenGeo, stoneMat);
      cren.position.set(Math.cos(angle) * 1.8, 3.25, Math.sin(angle) * 1.8);
      group.add(cren);
    }

    switch (type) {
      case TowerType.ARROW: {
        // Wooden platform with peaked roof
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 0.3, 2.5),
          new THREE.MeshLambertMaterial({ color: 0x8B5A2B })
        );
        platform.position.y = 3.1;
        group.add(platform);
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(2, 2, 4),
          new THREE.MeshLambertMaterial({ color: 0x993333 })
        );
        roof.position.y = 4.3;
        roof.castShadow = true;
        group.add(roof);
        break;
      }
      case TowerType.FROST: {
        // Ice crystal
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.2),
          new THREE.MeshPhongMaterial({ color: 0x66ccff, emissive: 0x224466, transparent: true, opacity: 0.85 })
        );
        crystal.position.y = 4.5;
        crystal.rotation.y = Math.PI / 4;
        group.add(crystal);
        // Smaller orbiting crystals
        for (let i = 0; i < 3; i++) {
          const small = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.3),
            new THREE.MeshPhongMaterial({ color: 0x88ddff, emissive: 0x336688, transparent: true, opacity: 0.7 })
          );
          const a = (i / 3) * Math.PI * 2;
          small.position.set(Math.cos(a) * 1.2, 4.5, Math.sin(a) * 1.2);
          group.add(small);
        }
        break;
      }
      case TowerType.FIRE: {
        // Brazier
        const brazier = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 0.8, 1, 8),
          new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        brazier.position.y = 3.5;
        group.add(brazier);
        // Fire orb
        const fire = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 8, 6),
          new THREE.MeshBasicMaterial({ color: 0xff6600 })
        );
        fire.position.y = 4.5;
        group.add(fire);
        // Glow ring
        const glow = new THREE.Mesh(
          new THREE.TorusGeometry(1.0, 0.15, 6, 12),
          new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.4 })
        );
        glow.position.y = 4.5;
        glow.rotation.x = Math.PI / 2;
        group.add(glow);
        break;
      }
    }

    return group;
  }

  update(dt: number): void {
    this.attackTimer += dt;

    // Animate frost crystal rotation
    if (this.type === TowerType.FROST) {
      const crystal = this.mesh.children[2]; // main crystal
      if (crystal) crystal.rotation.y += dt * 0.5;
    }
    // Animate fire flicker
    if (this.type === TowerType.FIRE) {
      const fire = this.mesh.children[3]; // fire orb
      if (fire) {
        fire.scale.setScalar(0.9 + Math.sin(performance.now() * 0.005) * 0.15);
      }
    }
  }

  canAttack(): boolean {
    return this.attackTimer >= this.stats.attackCooldown;
  }

  resetCooldown(): void {
    this.attackTimer = 0;
  }

  dispose(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
