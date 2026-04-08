import * as THREE from 'three';
import { UnitType, Faction } from '../types';
import { FACTION_COLORS } from '../constants';

export function buildUnitMesh(type: UnitType, faction: Faction): THREE.Group {
  const group = new THREE.Group();
  const color = FACTION_COLORS[faction];
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
  const weaponMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

  // Body
  const bodyH = type === UnitType.CAVALRY ? 1.2 : 1.4;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, bodyH, 0.5), bodyMat);
  body.position.y = bodyH / 2 + 0.3;
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), skinMat);
  head.position.y = bodyH + 0.6;
  head.castShadow = true;
  group.add(head);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
  const leftLeg = new THREE.Mesh(legGeo, bodyMat);
  leftLeg.position.set(-0.15, 0.3, 0);
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, bodyMat);
  rightLeg.position.set(0.15, 0.3, 0);
  group.add(rightLeg);

  // Type-specific weapons/details
  switch (type) {
    case UnitType.SWORDSMAN: {
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.05), weaponMat);
      sword.position.set(0.55, 1.2, 0);
      sword.rotation.z = -0.3;
      group.add(sword);
      // Shield
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.5), bodyMat);
      shield.position.set(-0.5, 1.0, 0);
      group.add(shield);
      break;
    }
    case UnitType.ARCHER: {
      // Bow
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 4, 8, Math.PI), weaponMat);
      bow.position.set(-0.5, 1.2, 0);
      bow.rotation.z = Math.PI / 2;
      group.add(bow);
      break;
    }
    case UnitType.PIKEMAN: {
      // Long pike
      const pike = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 4), weaponMat);
      pike.position.set(0.5, 1.8, 0);
      group.add(pike);
      // Pike head
      const pikeHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), weaponMat);
      pikeHead.position.set(0.5, 3.1, 0);
      group.add(pikeHead);
      break;
    }
    case UnitType.CAVALRY: {
      // Horse body
      const horse = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 1.6), new THREE.MeshLambertMaterial({ color: 0x8B4513 }));
      horse.position.set(0, 0.5, 0);
      horse.castShadow = true;
      group.add(horse);
      // Horse head
      const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.6), new THREE.MeshLambertMaterial({ color: 0x8B4513 }));
      horseHead.position.set(0, 0.9, -0.9);
      horseHead.rotation.x = 0.3;
      group.add(horseHead);
      // Move rider up
      body.position.y += 0.8;
      head.position.y += 0.8;
      leftLeg.position.y += 0.5;
      rightLeg.position.y += 0.5;
      // Lance
      const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 4), weaponMat);
      lance.position.set(0.5, 2.2, -0.5);
      lance.rotation.x = -0.5;
      group.add(lance);
      break;
    }
    case UnitType.MAGE: {
      // Staff
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.0, 6), new THREE.MeshLambertMaterial({ color: 0x5c3a1e }));
      staff.position.set(0.5, 1.5, 0);
      group.add(staff);
      // Orb on top
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0x9966ff }));
      orb.position.set(0.5, 2.6, 0);
      group.add(orb);
      // Hat
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 6), bodyMat);
      hat.position.set(0, bodyH + 1.0, 0);
      group.add(hat);
      break;
    }
  }

  group.scale.setScalar(1.0);
  return group;
}
