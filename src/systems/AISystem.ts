import { Faction, UnitType } from '../types';
import { LANE_COUNT, UNIT_STATS, AI_THINK_INTERVAL_MIN, AI_THINK_INTERVAL_MAX } from '../constants';
import { LaneManager } from './LaneManager';
import { EconomySystem } from './EconomySystem';
import { SpawnSystem } from './SpawnSystem';
import { randomRange } from '../utils/MathUtils';
import { UNIT_TYPE_ORDER } from '../entities/UnitTypes';
import * as THREE from 'three';

export class AISystem {
  private thinkTimer = 0;
  private thinkInterval = 1.5;

  update(
    dt: number,
    laneManager: LaneManager,
    economy: EconomySystem,
    spawnSystem: SpawnSystem,
    scene: THREE.Scene
  ): void {
    this.thinkTimer += dt;
    if (this.thinkTimer < this.thinkInterval) return;
    this.thinkTimer = 0;
    this.thinkInterval = randomRange(AI_THINK_INTERVAL_MIN, AI_THINK_INTERVAL_MAX);

    this.makeDecision(laneManager, economy, spawnSystem, scene);
  }

  private makeDecision(
    laneManager: LaneManager,
    economy: EconomySystem,
    spawnSystem: SpawnSystem,
    scene: THREE.Scene
  ): void {
    if (!spawnSystem.canSpawn(Faction.ENEMY)) return;

    // Evaluate lanes: find most threatened lane
    let bestLane = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < LANE_COUNT; i++) {
      const playerUnits = laneManager.countInLane(i, Faction.PLAYER);
      const enemyUnits = laneManager.countInLane(i, Faction.ENEMY);
      // Threat = player units minus our units. Prioritize lanes where we're outnumbered
      const threat = playerUnits - enemyUnits;
      // Add some randomness
      const score = threat + randomRange(-0.5, 0.5);
      if (score > bestScore) {
        bestScore = score;
        bestLane = i;
      }
    }

    // Decide unit type: counter-pick based on what's in the lane
    const playerUnitsInLane = laneManager.getUnitsInLane(bestLane, Faction.PLAYER);
    const unitType = this.pickUnitType(playerUnitsInLane, economy);
    if (unitType === null) return;

    spawnSystem.spawnUnit(unitType, Faction.ENEMY, bestLane, economy, laneManager, scene);
  }

  private pickUnitType(
    playerUnits: { type: UnitType }[],
    economy: EconomySystem
  ): UnitType | null {
    // Count enemy unit types
    const typeCounts = new Map<UnitType, number>();
    for (const u of playerUnits) {
      typeCounts.set(u.type, (typeCounts.get(u.type) || 0) + 1);
    }

    // Counter picks
    const hasCavalry = (typeCounts.get(UnitType.CAVALRY) || 0) > 0;
    const hasArchers = (typeCounts.get(UnitType.ARCHER) || 0) > 0;
    const hasMages = (typeCounts.get(UnitType.MAGE) || 0) > 0;

    // Priority: counter pick > cheap spam
    const candidates: UnitType[] = [];

    if (hasCavalry) candidates.push(UnitType.PIKEMAN);
    if (hasArchers) candidates.push(UnitType.CAVALRY);
    if (hasMages) candidates.push(UnitType.SWORDSMAN);

    // Add general options
    candidates.push(UnitType.SWORDSMAN, UnitType.ARCHER);

    // Occasionally go aggressive
    if (Math.random() < 0.15) candidates.unshift(UnitType.CAVALRY);
    if (Math.random() < 0.1) candidates.unshift(UnitType.MAGE);

    // Pick first affordable
    for (const type of candidates) {
      if (economy.canAfford(UNIT_STATS[type].cost, Faction.ENEMY)) {
        return type;
      }
    }

    return null;
  }

  reset(): void {
    this.thinkTimer = 0;
  }
}
