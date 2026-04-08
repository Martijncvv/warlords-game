import { Unit } from './Unit';
import { UnitType, Faction } from '../types';
import { LANE_HEIGHT, FIELD_SPAN, CASTLE_X_OFFSET } from '../constants';

export class UnitFactory {
  createUnit(type: UnitType, faction: Faction, lane: number): Unit {
    const unit = new Unit(type, faction, lane);
    // Z based on lane, X based on faction (left/right)
    const z = -FIELD_SPAN / 2 + lane * LANE_HEIGHT + LANE_HEIGHT / 2;
    const x = faction === Faction.PLAYER ? -CASTLE_X_OFFSET + 8 : CASTLE_X_OFFSET - 8;
    unit.mesh.position.set(x, 0, z);
    return unit;
  }
}
