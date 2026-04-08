import * as THREE from 'three';
import { Faction } from '../types';
import { CASTLE_HP, CASTLE_X_OFFSET } from '../constants';
import { createCastleModel } from '../scene/CastleModel';
import { HealthBar } from './HealthBar';

export class Castle {
  mesh: THREE.Group;
  faction: Faction;
  hp: number;
  maxHp: number;
  healthBar: HealthBar;

  constructor(faction: Faction) {
    this.faction = faction;
    this.hp = CASTLE_HP;
    this.maxHp = CASTLE_HP;
    this.mesh = createCastleModel(faction);

    // Player castle on the left, enemy castle on the right
    const x = faction === Faction.PLAYER ? -CASTLE_X_OFFSET : CASTLE_X_OFFSET;
    this.mesh.position.set(x, 0, 0);

    this.healthBar = new HealthBar();
    this.healthBar.sprite.position.y = 15;
    this.healthBar.sprite.scale.set(6, 0.5, 1);
    this.mesh.add(this.healthBar.sprite);
    this.healthBar.update(1);
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.healthBar.update(this.hp / this.maxHp);
  }

  isDestroyed(): boolean {
    return this.hp <= 0;
  }

  dispose(): void {
    this.healthBar.dispose();
  }
}
