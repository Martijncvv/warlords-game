export enum Faction {
  PLAYER = 'player',
  ENEMY = 'enemy',
}

export enum UnitType {
  SWORDSMAN = 'swordsman',
  ARCHER = 'archer',
  PIKEMAN = 'pikeman',
  CAVALRY = 'cavalry',
  MAGE = 'mage',
}

export interface UnitStats {
  type: UnitType;
  hp: number;
  damage: number;
  range: number;
  speed: number;
  cost: number;
  attackCooldown: number;
  label: string;
  key: string;
}

export interface TypeBonus {
  attacker: UnitType;
  defender: UnitType;
  multiplier: number;
}

export enum GamePhase {
  MENU = 'menu',
  BATTLE = 'battle',
  RESULT = 'result',
}

export interface SpawnRequest {
  unitType: UnitType;
  faction: Faction;
  lane: number;
}

// Tower Defense
export enum TowerType {
  ARROW = 'arrow',
  FROST = 'frost',
  FIRE = 'fire',
}

export interface TowerStats {
  type: TowerType;
  damage: number;
  range: number;
  attackCooldown: number;
  cost: number;
  label: string;
  key: string;
  description: string;
  splashRadius: number;
  slowDuration: number;
  slowFactor: number;
}
