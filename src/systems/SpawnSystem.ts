import * as THREE from 'three';
import { UnitType, Faction, SpawnRequest } from '../types';
import { SPAWN_COOLDOWN, UNIT_STATS, CHARGE_KILL_THRESHOLD, LANE_COUNT } from '../constants';
import { UnitFactory } from '../entities/UnitFactory';
import { LaneManager } from './LaneManager';
import { EconomySystem } from './EconomySystem';
import { EventBus } from '../core/EventBus';
import { Unit } from '../entities/Unit';
import { UNIT_TYPE_ORDER } from '../entities/UnitTypes';

export class SpawnSystem {
  private factory = new UnitFactory();
  private playerCooldown = 0;
  private enemyCooldown = 0;
  private playerKills = 0;
  private enemyKills = 0;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.eventBus.on('unitKilled', this.onUnitKilled);
  }

  private onUnitKilled = (killed: Unit, _killer: Unit | null): void => {
    if (killed.faction === Faction.ENEMY) {
      this.playerKills++;
      if (this.playerKills >= CHARGE_KILL_THRESHOLD) {
        this.playerKills = 0;
        this.eventBus.emit('chargeReady', Faction.PLAYER);
      }
    } else {
      this.enemyKills++;
      if (this.enemyKills >= CHARGE_KILL_THRESHOLD) {
        this.enemyKills = 0;
        this.eventBus.emit('chargeReady', Faction.ENEMY);
      }
    }
  };

  update(dt: number): void {
    if (this.playerCooldown > 0) this.playerCooldown -= dt;
    if (this.enemyCooldown > 0) this.enemyCooldown -= dt;
  }

  canSpawn(faction: Faction): boolean {
    return faction === Faction.PLAYER ? this.playerCooldown <= 0 : this.enemyCooldown <= 0;
  }

  spawnUnit(
    type: UnitType,
    faction: Faction,
    lane: number,
    economy: EconomySystem,
    laneManager: LaneManager,
    scene: THREE.Scene
  ): Unit | null {
    const cost = UNIT_STATS[type].cost;
    if (!this.canSpawn(faction)) return null;
    if (!economy.spend(cost, faction)) return null;

    const unit = this.factory.createUnit(type, faction, lane);
    laneManager.addUnit(unit);
    scene.add(unit.mesh);

    if (faction === Faction.PLAYER) {
      this.playerCooldown = SPAWN_COOLDOWN;
    } else {
      this.enemyCooldown = SPAWN_COOLDOWN;
    }

    this.eventBus.emit('unitSpawned', unit);
    return unit;
  }

  spawnCharge(
    faction: Faction,
    economy: EconomySystem,
    laneManager: LaneManager,
    scene: THREE.Scene
  ): void {
    // Spawn one swordsman in each lane for free
    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const unit = this.factory.createUnit(UnitType.SWORDSMAN, faction, lane);
      laneManager.addUnit(unit);
      scene.add(unit.mesh);
    }
    this.eventBus.emit('chargeActivated', faction);
  }

  get playerKillCount(): number {
    return this.playerKills;
  }

  get enemyKillCount(): number {
    return this.enemyKills;
  }

  reset(): void {
    this.playerCooldown = 0;
    this.enemyCooldown = 0;
    this.playerKills = 0;
    this.enemyKills = 0;
  }
}
