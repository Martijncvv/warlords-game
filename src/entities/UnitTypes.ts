import { UnitType } from '../types';
import { UNIT_STATS, TYPE_BONUSES } from '../constants';

export function getUnitStats(type: UnitType) {
  return UNIT_STATS[type];
}

export function getTypeBonus(attackerType: UnitType, defenderType: UnitType): number {
  for (const bonus of TYPE_BONUSES) {
    if (bonus.attacker === attackerType && bonus.defender === defenderType) {
      return bonus.multiplier;
    }
  }
  return 1.0;
}

export function isRanged(type: UnitType): boolean {
  return type === UnitType.ARCHER || type === UnitType.MAGE;
}

export const UNIT_TYPE_ORDER: UnitType[] = [
  UnitType.SWORDSMAN,
  UnitType.ARCHER,
  UnitType.PIKEMAN,
  UnitType.CAVALRY,
  UnitType.MAGE,
];
