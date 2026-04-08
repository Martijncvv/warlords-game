import * as THREE from 'three';
import { UnitType, Faction } from '../types';
import { UnitStats } from '../types';
import { HealthBar } from './HealthBar';
import { buildUnitMesh } from './UnitMeshBuilder';
import { getUnitStats } from './UnitTypes';

export enum UnitState {
  MARCHING = 'marching',
  FIGHTING = 'fighting',
  DYING = 'dying',
  DEAD = 'dead',
}

export class Unit {
  mesh: THREE.Group;
  healthBar: HealthBar;
  stats: UnitStats;
  faction: Faction;
  lane: number;
  type: UnitType;
  state: UnitState = UnitState.MARCHING;

  hp: number;
  maxHp: number;
  attackTimer = 0;
  target: Unit | null = null;

  // Slow debuff (from frost tower)
  slowTimer = 0;
  slowMultiplier = 1.0;

  // Animation
  marchPhase: number;
  deathTimer = 0;

  // +1 = march right (player), -1 = march left (enemy)
  private direction: number;

  constructor(type: UnitType, faction: Faction, lane: number) {
    this.type = type;
    this.faction = faction;
    this.lane = lane;
    this.stats = { ...getUnitStats(type) };
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.direction = faction === Faction.PLAYER ? 1 : -1;
    this.marchPhase = Math.random() * Math.PI * 2;

    this.mesh = buildUnitMesh(type, faction);
    // Face right (+X) for player, left (-X) for enemy
    this.mesh.rotation.y = faction === Faction.PLAYER ? -Math.PI / 2 : Math.PI / 2;

    this.healthBar = new HealthBar();
    this.mesh.add(this.healthBar.sprite);
  }

  /** X position (march axis) */
  get x(): number {
    return this.mesh.position.x;
  }

  get marchDirection(): number {
    return this.direction;
  }

  get effectiveSpeed(): number {
    return this.stats.speed * this.slowMultiplier;
  }

  applySlow(factor: number, duration: number): void {
    this.slowMultiplier = factor;
    this.slowTimer = duration;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    this.healthBar.update(this.hp / this.maxHp);
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = UnitState.DYING;
      this.deathTimer = 0;
    }
  }

  updateAnimation(dt: number): void {
    // Slow debuff decay
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMultiplier = 1.0;
      }
    }

    if (this.state === UnitState.MARCHING) {
      this.marchPhase += dt * 8;
      this.mesh.position.y = Math.abs(Math.sin(this.marchPhase)) * 0.15;
    } else if (this.state === UnitState.DYING) {
      this.deathTimer += dt;
      // Fall sideways along Z
      this.mesh.rotation.z = Math.min(this.deathTimer * 3, Math.PI / 2) * this.direction;
      this.mesh.position.y = Math.max(0, 0.5 - this.deathTimer);
      if (this.deathTimer > 0.8) {
        this.state = UnitState.DEAD;
      }
    }
  }

  isAlive(): boolean {
    return this.state === UnitState.MARCHING || this.state === UnitState.FIGHTING;
  }

  dispose(): void {
    this.healthBar.dispose();
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
