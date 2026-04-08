import { Unit, UnitState } from '../entities/Unit';
import { Faction } from '../types';
import { LANE_COUNT } from '../constants';
import * as THREE from 'three';

export class LaneManager {
  lanes: Unit[][] = [];

  constructor() {
    for (let i = 0; i < LANE_COUNT; i++) {
      this.lanes.push([]);
    }
  }

  addUnit(unit: Unit): void {
    this.lanes[unit.lane].push(unit);
  }

  removeUnit(unit: Unit): void {
    const lane = this.lanes[unit.lane];
    const idx = lane.indexOf(unit);
    if (idx !== -1) lane.splice(idx, 1);
  }

  getUnitsInLane(lane: number, faction?: Faction): Unit[] {
    if (faction === undefined) return this.lanes[lane];
    return this.lanes[lane].filter((u) => u.faction === faction && u.isAlive());
  }

  getAllUnits(): Unit[] {
    const all: Unit[] = [];
    for (const lane of this.lanes) {
      all.push(...lane);
    }
    return all;
  }

  getAliveUnits(faction?: Faction): Unit[] {
    return this.getAllUnits().filter((u) => {
      if (!u.isAlive()) return false;
      if (faction !== undefined && u.faction !== faction) return false;
      return true;
    });
  }

  findClosestEnemy(unit: Unit): Unit | null {
    const lane = this.lanes[unit.lane];
    let closest: Unit | null = null;
    let closestDist = Infinity;

    for (const other of lane) {
      if (other.faction === unit.faction || !other.isAlive()) continue;
      const dist = Math.abs(unit.x - other.x);
      if (dist < closestDist) {
        closestDist = dist;
        closest = other;
      }
    }
    return closest;
  }

  /** Find closest enemy unit across ALL lanes (for tower targeting) */
  findClosestEnemyGlobal(position: THREE.Vector3, maxRange: number): Unit | null {
    let closest: Unit | null = null;
    let closestDist = Infinity;

    for (const lane of this.lanes) {
      for (const unit of lane) {
        if (unit.faction !== Faction.ENEMY || !unit.isAlive()) continue;
        const dx = unit.mesh.position.x - position.x;
        const dz = unit.mesh.position.z - position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= maxRange && dist < closestDist) {
          closestDist = dist;
          closest = unit;
        }
      }
    }
    return closest;
  }

  /** Get all enemy units within radius of a position */
  getEnemiesInRadius(position: THREE.Vector3, radius: number): Unit[] {
    const result: Unit[] = [];
    for (const lane of this.lanes) {
      for (const unit of lane) {
        if (unit.faction !== Faction.ENEMY || !unit.isAlive()) continue;
        const dx = unit.mesh.position.x - position.x;
        const dz = unit.mesh.position.z - position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= radius) {
          result.push(unit);
        }
      }
    }
    return result;
  }

  countByFaction(faction: Faction): number {
    let count = 0;
    for (const lane of this.lanes) {
      for (const unit of lane) {
        if (unit.faction === faction && unit.isAlive()) count++;
      }
    }
    return count;
  }

  countInLane(lane: number, faction: Faction): number {
    return this.lanes[lane].filter((u) => u.faction === faction && u.isAlive()).length;
  }

  cleanup(scene: THREE.Scene): void {
    for (const lane of this.lanes) {
      for (let i = lane.length - 1; i >= 0; i--) {
        if (lane[i].state === UnitState.DEAD) {
          scene.remove(lane[i].mesh);
          lane[i].dispose();
          lane.splice(i, 1);
        }
      }
    }
  }

  clear(scene: THREE.Scene): void {
    for (const lane of this.lanes) {
      for (const unit of lane) {
        scene.remove(unit.mesh);
        unit.dispose();
      }
      lane.length = 0;
    }
  }
}
