import { Castle } from '../entities/Castle';
import { EventBus } from '../core/EventBus';

export class WinConditionSystem {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  update(playerCastle: Castle, enemyCastle: Castle): void {
    if (enemyCastle.isDestroyed()) {
      this.eventBus.emit('gameOver', 'player');
    } else if (playerCastle.isDestroyed()) {
      this.eventBus.emit('gameOver', 'enemy');
    }
  }
}
