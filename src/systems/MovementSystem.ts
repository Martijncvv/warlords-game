import { LaneManager } from './LaneManager';
import { UnitState } from '../entities/Unit';
import { Castle } from '../entities/Castle';
import { Faction } from '../types';
import { CASTLE_X_OFFSET } from '../constants';

export class MovementSystem {
  update(dt: number, laneManager: LaneManager, playerCastle: Castle, enemyCastle: Castle): void {
    for (const unit of laneManager.getAllUnits()) {
      if (unit.state !== UnitState.MARCHING) continue;

      // Check for enemy in range
      const enemy = laneManager.findClosestEnemy(unit);
      if (enemy) {
        const dist = Math.abs(unit.x - enemy.x);
        if (dist <= unit.stats.range) {
          unit.state = UnitState.FIGHTING;
          unit.target = enemy;
          continue;
        }
      }

      // Move along X axis (left-to-right for player, right-to-left for enemy)
      const speed = unit.effectiveSpeed * dt;
      unit.mesh.position.x += unit.marchDirection * speed;

      // Check if reached enemy castle
      if (unit.faction === Faction.PLAYER && unit.x >= CASTLE_X_OFFSET - 5) {
        enemyCastle.takeDamage(unit.stats.damage);
        unit.hp = 0;
        unit.state = UnitState.DYING;
      } else if (unit.faction === Faction.ENEMY && unit.x <= -CASTLE_X_OFFSET + 5) {
        playerCastle.takeDamage(unit.stats.damage);
        unit.hp = 0;
        unit.state = UnitState.DYING;
      }
    }
  }
}
