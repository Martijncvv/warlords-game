import * as THREE from 'three';
import { FACTION_COLORS } from '../constants';
import { Faction } from '../types';

export function createCastleModel(faction: Faction): THREE.Group {
  const group = new THREE.Group();
  const color = FACTION_COLORS[faction];
  const mat = new THREE.MeshLambertMaterial({ color });
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const roofMat = new THREE.MeshLambertMaterial({ color: faction === Faction.PLAYER ? 0x1a4a99 : 0x991a1a });

  // Main keep (tall along Z to span lanes visually)
  const keep = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 12), stoneMat);
  keep.position.y = 4;
  keep.castShadow = true;
  keep.receiveShadow = true;
  group.add(keep);

  // Banner on top
  const banner = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 10), mat);
  banner.position.y = 8.5;
  group.add(banner);

  // Towers at corners (X stays narrow, Z spreads)
  const towerPositions = [[-3, 7], [3, 7], [-3, -7], [3, -7]];
  for (const [x, z] of towerPositions) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 10, 8), stoneMat);
    tower.position.set(x, 5, z);
    tower.castShadow = true;
    group.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), roofMat);
    roof.position.set(x, 11.5, z);
    roof.castShadow = true;
    group.add(roof);
  }

  // Gate faces inward (toward battlefield center)
  const gateX = faction === Faction.PLAYER ? 3.25 : -3.25;
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 3), new THREE.MeshLambertMaterial({ color: 0x3a2a1a }));
  gate.position.set(gateX, 2, 0);
  group.add(gate);

  return group;
}
