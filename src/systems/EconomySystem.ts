import { STARTING_GOLD, GOLD_PER_SECOND, GOLD_PER_KILL } from '../constants';
import { EventBus } from '../core/EventBus';
import { Unit } from '../entities/Unit';
import { Faction } from '../types';

export class EconomySystem {
  playerGold: number;
  enemyGold: number;
  private eventBus: EventBus;

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

  update(dt: number): void {
    this.playerGold += GOLD_PER_SECOND * dt;
    this.enemyGold += GOLD_PER_SECOND * dt;
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
  }
}
