import { STARTING_GOLD, GOLD_PER_SECOND, GOLD_PER_KILL } from '../constants';
import { EventBus } from '../core/EventBus';
import { Unit } from '../entities/Unit';
import { Faction } from '../types';

export const VILLAGER_COST_BASE = 25;
export const VILLAGER_COST_SCALE = 15; // each subsequent villager costs more
export const VILLAGER_INCOME_BONUS = 0.5; // extra gold/sec per villager

export class EconomySystem {
  playerGold: number;
  enemyGold: number;
  villagerCount = 0;
  private eventBus: EventBus;
  private incomeAccumulator = 0;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.playerGold = STARTING_GOLD;
    this.enemyGold = STARTING_GOLD;

    this.eventBus.on('unitKilled', this.onUnitKilled);
  }

  private onUnitKilled = (killed: Unit, killer: Unit | null): void => {
    if (killed.faction === Faction.ENEMY) {
      this.playerGold += GOLD_PER_KILL;
    } else {
      this.enemyGold += GOLD_PER_KILL;
    }
  };

  get playerIncomeRate(): number {
    return GOLD_PER_SECOND + this.villagerCount * VILLAGER_INCOME_BONUS;
  }

  get nextVillagerCost(): number {
    return VILLAGER_COST_BASE + this.villagerCount * VILLAGER_COST_SCALE;
  }

  buyVillager(): boolean {
    const cost = this.nextVillagerCost;
    if (this.playerGold < cost) return false;
    this.playerGold -= cost;
    this.villagerCount++;
    this.eventBus.emit('villagerBought', this.villagerCount);
    return true;
  }

  update(dt: number): void {
    const playerRate = this.playerIncomeRate;
    this.playerGold += playerRate * dt;
    this.enemyGold += GOLD_PER_SECOND * dt;

    // Track accumulated income for floating text (emit every 2 seconds)
    this.incomeAccumulator += playerRate * dt;
  }

  /** Returns accumulated income since last drain and resets it */
  drainIncomeAccumulator(): number {
    const val = this.incomeAccumulator;
    this.incomeAccumulator = 0;
    return val;
  }

  canAfford(cost: number, faction: Faction): boolean {
    return faction === Faction.PLAYER ? this.playerGold >= cost : this.enemyGold >= cost;
  }

  spend(cost: number, faction: Faction): boolean {
    if (!this.canAfford(cost, faction)) return false;
    if (faction === Faction.PLAYER) {
      this.playerGold -= cost;
    } else {
      this.enemyGold -= cost;
    }
    return true;
  }

  reset(): void {
    this.playerGold = STARTING_GOLD;
    this.enemyGold = STARTING_GOLD;
    this.villagerCount = 0;
    this.incomeAccumulator = 0;
  }
}
