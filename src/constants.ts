import { UnitType, TypeBonus, UnitStats, TowerType, TowerStats } from './types';

// Battlefield dimensions (X = march direction, Z = lane spread)
export const FIELD_LENGTH = 120; // X axis
export const FIELD_SPAN = 80;   // Z axis
export const LANE_COUNT = 8;
export const LANE_HEIGHT = FIELD_SPAN / LANE_COUNT;
export const CASTLE_X_OFFSET = FIELD_LENGTH / 2 - 5; // 55

// Economy
export const STARTING_GOLD = 100;
export const GOLD_PER_SECOND = 2;
export const GOLD_PER_KILL = 7;
export const CHARGE_KILL_THRESHOLD = 20;

// Castle
export const CASTLE_HP = 500;

// Unit spawn
export const SPAWN_COOLDOWN = 0.5;

// Unit stat definitions
export const UNIT_STATS: Record<UnitType, UnitStats> = {
  [UnitType.SWORDSMAN]: {
    type: UnitType.SWORDSMAN,
    hp: 100,
    damage: 15,
    range: 3,
    speed: 15,
    cost: 10,
    attackCooldown: 1.0,
    label: 'Swordsman',
    key: '1',
  },
  [UnitType.ARCHER]: {
    type: UnitType.ARCHER,
    hp: 60,
    damage: 12,
    range: 40,
    speed: 12,
    cost: 15,
    attackCooldown: 1.5,
    label: 'Archer',
    key: '2',
  },
  [UnitType.PIKEMAN]: {
    type: UnitType.PIKEMAN,
    hp: 140,
    damage: 18,
    range: 4,
    speed: 10,
    cost: 12,
    attackCooldown: 1.2,
    label: 'Pikeman',
    key: '3',
  },
  [UnitType.CAVALRY]: {
    type: UnitType.CAVALRY,
    hp: 120,
    damage: 25,
    range: 3,
    speed: 30,
    cost: 30,
    attackCooldown: 1.0,
    label: 'Cavalry',
    key: '4',
  },
  [UnitType.MAGE]: {
    type: UnitType.MAGE,
    hp: 50,
    damage: 20,
    range: 50,
    speed: 10,
    cost: 35,
    attackCooldown: 2.0,
    label: 'Mage',
    key: '5',
  },
};

// Type bonus matrix
export const TYPE_BONUSES: TypeBonus[] = [
  { attacker: UnitType.PIKEMAN, defender: UnitType.CAVALRY, multiplier: 2.0 },
  { attacker: UnitType.CAVALRY, defender: UnitType.ARCHER, multiplier: 1.5 },
  { attacker: UnitType.SWORDSMAN, defender: UnitType.ARCHER, multiplier: 1.2 },
  { attacker: UnitType.SWORDSMAN, defender: UnitType.MAGE, multiplier: 1.2 },
];

// AI
export const AI_THINK_INTERVAL_MIN = 1.0;
export const AI_THINK_INTERVAL_MAX = 2.0;

// Visual
export const FACTION_COLORS = {
  player: 0x2266cc,
  enemy: 0xcc2222,
};

// Clock
export const MAX_DELTA = 1 / 20;

// Tower Defense
export const TOWER_SLOT_X = -35; // X position for all tower slots
export const TOWER_SLOT_POSITIONS: [number, number, number][] = [
  [TOWER_SLOT_X, 0, -25], // covers top lanes
  [TOWER_SLOT_X, 0, 0],   // covers middle lanes
  [TOWER_SLOT_X, 0, 25],  // covers bottom lanes
];

export const TOWER_STATS: Record<TowerType, TowerStats> = {
  [TowerType.ARROW]: {
    type: TowerType.ARROW,
    damage: 10,
    range: 40,
    attackCooldown: 0.8,
    cost: 75,
    label: 'Arrow Tower',
    key: '7',
    description: 'Fast single-target',
    splashRadius: 0,
    slowDuration: 0,
    slowFactor: 1,
  },
  [TowerType.FROST]: {
    type: TowerType.FROST,
    damage: 5,
    range: 30,
    attackCooldown: 1.5,
    cost: 100,
    label: 'Frost Tower',
    key: '8',
    description: 'Slows enemies 50%',
    splashRadius: 0,
    slowDuration: 2.0,
    slowFactor: 0.5,
  },
  [TowerType.FIRE]: {
    type: TowerType.FIRE,
    damage: 15,
    range: 25,
    attackCooldown: 2.5,
    cost: 150,
    label: 'Fire Tower',
    key: '9',
    description: 'AoE splash damage',
    splashRadius: 8,
    slowDuration: 0,
    slowFactor: 1,
  },
};
