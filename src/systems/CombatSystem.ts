import { LaneManager } from './LaneManager';
import { Unit, UnitState } from '../entities/Unit';
import { Projectile } from '../entities/Projectile';
import { getTypeBonus, isRanged } from '../entities/UnitTypes';
import { EventBus } from '../core/EventBus';
import * as THREE from 'three';

export class CombatSystem {
  private eventBus: EventBus;
  projectiles: Projectile[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  update(dt: number, laneManager: LaneManager, scene: THREE.Scene): void {
    for (const unit of laneManager.getAllUnits()) {
      if (unit.state !== UnitState.FIGHTING) continue;

      // Check if target is still valid
      if (!unit.target || !unit.target.isAlive()) {
        unit.target = laneManager.findClosestEnemy(unit);
        if (!unit.target) {
          unit.state = UnitState.MARCHING;
          continue;
        }
      }

      const dist = Math.abs(unit.x - unit.target.x);

      // If target moved out of range, resume marching
      if (dist > unit.stats.range + 2) {
        unit.target = null;
        unit.state = UnitState.MARCHING;
        continue;
      }

      // Attack cooldown
      unit.attackTimer += dt;
      if (unit.attackTimer >= unit.stats.attackCooldown) {
        unit.attackTimer = 0;
        this.attack(unit, unit.target, laneManager, scene);
      }
    }

    this.updateProjectiles(dt, laneManager, scene);
  }

  private attack(attacker: Unit, target: Unit, laneManager: LaneManager, scene: THREE.Scene): void {
    const bonus = getTypeBonus(attacker.type, target.type);
    const damage = attacker.stats.damage * bonus;

    if (isRanged(attacker.type)) {
      const style = attacker.type === 'mage' ? 'magic' as const : 'arrow' as const;
      const proj = new Projectile(
        attacker.mesh.position,
        target.mesh.position,
        damage,
        style
      );
      proj.sourceFaction = attacker.faction;
      scene.add(proj.mesh);
      proj.setScene(scene);
      this.projectiles.push(proj);
    } else {
      this.applyDamage(target, damage, attacker);
    }
  }

  private applyDamage(target: Unit, damage: number, attacker: Unit | null): void {
    target.takeDamage(damage);
    this.eventBus.emit('unitHit', target, damage);

    if (!target.isAlive()) {
      this.eventBus.emit('unitKilled', target, attacker);
    }
  }

  private updateProjectiles(dt: number, laneManager: LaneManager, scene: THREE.Scene): void {
    const HIT_RADIUS = 2.0; // proximity to count as a hit

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);

      // Proximity-based hit detection against enemy units
      if (!proj.hit) {
        const pos = proj.mesh.position;
        const enemyFaction = proj.sourceFaction === 'player' ? 'enemy' : 'player';
        const allUnits = laneManager.getAllUnits();

        if (proj.isAoE) {
          // AoE: check if close enough to any enemy to detonate
          let shouldDetonate = false;
          for (const unit of allUnits) {
            if (unit.faction !== enemyFaction || !unit.isAlive()) continue;
            const dx = unit.mesh.position.x - pos.x;
            const dy = unit.mesh.position.y + 1 - pos.y;
            const dz = unit.mesh.position.z - pos.z;
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) < HIT_RADIUS + 1) {
              shouldDetonate = true;
              break;
            }
          }
          // Also detonate on ground impact
          if (shouldDetonate || (pos.y <= 0.5 && proj.velocity.y < 0)) {
            for (const unit of allUnits) {
              if (unit.faction !== enemyFaction || !unit.isAlive()) continue;
              const dx = unit.mesh.position.x - pos.x;
              const dz = unit.mesh.position.z - pos.z;
              const dist = Math.sqrt(dx * dx + dz * dz);
              if (dist < proj.aoERadius) {
                const aoeDmg = proj.damage * (1 - dist / proj.aoERadius * 0.5);
                unit.takeDamage(aoeDmg);
                this.eventBus.emit('unitHit', unit, aoeDmg);
                if (!unit.isAlive()) {
                  this.eventBus.emit('unitKilled', unit, null);
                }
              }
            }
            proj.hit = true;
            this.eventBus.emit('projectileHit', pos.clone());
            proj.active = false;
          }
        } else {
          // Single-target: hit the closest enemy within radius
          let closestUnit: Unit | null = null;
          let closestDist = HIT_RADIUS;
          for (const unit of allUnits) {
            if (unit.faction !== enemyFaction || !unit.isAlive()) continue;
            const dx = unit.mesh.position.x - pos.x;
            const dy = unit.mesh.position.y + 1 - pos.y;
            const dz = unit.mesh.position.z - pos.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < closestDist) {
              closestDist = dist;
              closestUnit = unit;
            }
          }
          if (closestUnit) {
            this.applyDamage(closestUnit, proj.damage, null);
            proj.hit = true;
            this.eventBus.emit('projectileHit', pos.clone());
            proj.active = false;
          }
        }
      }

      // Also expire if it hits the ground without hitting anything
      if (!proj.hit && proj.mesh.position.y <= 0 && proj.velocity.y < 0) {
        proj.active = false;
      }

      if (!proj.active) {
        scene.remove(proj.mesh);
        proj.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  clear(scene: THREE.Scene): void {
    for (const proj of this.projectiles) {
      scene.remove(proj.mesh);
      proj.dispose();
    }
    this.projectiles.length = 0;
  }
}
