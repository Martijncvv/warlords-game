import * as THREE from 'three';
import { TowerType } from '../types';
import { TOWER_SLOT_POSITIONS, TOWER_STATS } from '../constants';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { LaneManager } from './LaneManager';
import { EconomySystem } from './EconomySystem';
import { EventBus } from '../core/EventBus';
import { Faction } from '../types';

export class TowerSystem {
  towers: (Tower | null)[] = [null, null, null];
  projectiles: Projectile[] = [];
  private scene: THREE.Scene;
  private eventBus: EventBus;

  constructor(scene: THREE.Scene, eventBus: EventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
  }

  buildTower(type: TowerType, slotIndex: number, economy: EconomySystem): boolean {
    if (slotIndex < 0 || slotIndex >= 3) return false;
    if (this.towers[slotIndex] !== null) return false;

    const cost = TOWER_STATS[type].cost;
    if (!economy.spend(cost, Faction.PLAYER)) return false;

    const pos = new THREE.Vector3(...TOWER_SLOT_POSITIONS[slotIndex]);
    const tower = new Tower(type, slotIndex, pos);
    this.towers[slotIndex] = tower;
    this.scene.add(tower.mesh);
    this.eventBus.emit('towerBuilt', slotIndex, type);
    return true;
  }

  isSlotEmpty(index: number): boolean {
    return this.towers[index] === null;
  }

  update(dt: number, laneManager: LaneManager): void {
    for (const tower of this.towers) {
      if (!tower) continue;
      tower.update(dt);

      // Find target and attack
      const target = laneManager.findClosestEnemyGlobal(tower.mesh.position, tower.stats.range);
      if (target && tower.canAttack()) {
        tower.resetCooldown();
        this.fireTower(tower, target);
      }
    }

    // Update tower projectiles
    this.updateProjectiles(dt, laneManager);
  }

  private fireTower(tower: Tower, target: { mesh: THREE.Object3D }): void {
    let style: 'arrow' | 'frost' | 'fire' = 'arrow';
    if (tower.type === TowerType.FROST) style = 'frost';
    if (tower.type === TowerType.FIRE) style = 'fire';

    const startPos = tower.mesh.position.clone();
    startPos.y += 4;
    const targetPos = (target.mesh as THREE.Object3D).position.clone();

    const proj = new Projectile(startPos, targetPos, tower.stats.damage, style);
    proj.slowDuration = tower.stats.slowDuration;
    proj.slowFactor = tower.stats.slowFactor;
    if (tower.type === TowerType.FIRE) {
      proj.isAoE = true;
      proj.aoERadius = tower.stats.splashRadius;
    }

    this.scene.add(proj.mesh);
    proj.setScene(this.scene);
    this.projectiles.push(proj);
  }

  private updateProjectiles(dt: number, laneManager: LaneManager): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);

      if (proj.mesh.position.y <= 0.5 && proj.velocity.y < 0) {
        // Apply damage
        if (proj.isAoE) {
          const enemies = laneManager.getEnemiesInRadius(proj.mesh.position, proj.aoERadius);
          for (const unit of enemies) {
            unit.takeDamage(proj.damage);
            this.eventBus.emit('unitHit', unit, proj.damage);
            if (!unit.isAlive()) {
              this.eventBus.emit('unitKilled', unit, null);
            }
          }
        } else {
          // Single target: damage closest enemy to impact point
          const target = laneManager.findClosestEnemyGlobal(proj.mesh.position, 3);
          if (target) {
            target.takeDamage(proj.damage);
            this.eventBus.emit('unitHit', target, proj.damage);
            if (!target.isAlive()) {
              this.eventBus.emit('unitKilled', target, null);
            }
          }
        }

        // Apply slow
        if (proj.slowDuration > 0) {
          const nearby = laneManager.getEnemiesInRadius(proj.mesh.position, 5);
          for (const u of nearby) {
            u.applySlow(proj.slowFactor, proj.slowDuration);
          }
        }

        this.eventBus.emit('projectileHit', proj.mesh.position.clone());
        proj.active = false;
      }

      if (!proj.active) {
        this.scene.remove(proj.mesh);
        proj.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (let i = 0; i < this.towers.length; i++) {
      const tower = this.towers[i];
      if (tower) {
        this.scene.remove(tower.mesh);
        tower.dispose();
        this.towers[i] = null;
      }
    }
    for (const proj of this.projectiles) {
      this.scene.remove(proj.mesh);
      proj.dispose();
    }
    this.projectiles.length = 0;
  }
}
