import * as THREE from 'three';
import { FIELD_LENGTH, FIELD_SPAN, LANE_COUNT, LANE_HEIGHT, TOWER_SLOT_POSITIONS } from '../constants';

export class Terrain {
  group: THREE.Group;
  towerSlotMeshes: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.createGround();
    this.createLaneDividers();
    this.createDecorations();
    this.createTowerSlots();
  }

  private createGround(): void {
    const geo = new THREE.PlaneGeometry(FIELD_LENGTH + 40, FIELD_SPAN + 40);
    const mat = new THREE.MeshLambertMaterial({ color: 0x4a7c3f });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  private createLaneDividers(): void {
    // Horizontal dividers (lanes run left-to-right, dividers separate them along Z)
    const mat = new THREE.MeshBasicMaterial({ color: 0x3d6633, transparent: true, opacity: 0.4 });
    for (let i = 1; i < LANE_COUNT; i++) {
      const z = -FIELD_SPAN / 2 + i * LANE_HEIGHT;
      const geo = new THREE.PlaneGeometry(FIELD_LENGTH - 10, 0.3);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0.01, z);
      this.group.add(mesh);
    }
  }

  private createTowerSlots(): void {
    const platformGeo = new THREE.CylinderGeometry(2.5, 3, 1, 8);
    const platformMat = new THREE.MeshLambertMaterial({ color: 0x888888, transparent: true, opacity: 0.6 });

    for (const [x, y, z] of TOWER_SLOT_POSITIONS) {
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(x, 0.5, z);
      platform.receiveShadow = true;
      platform.userData.isTowerSlot = true;
      this.group.add(platform);
      this.towerSlotMeshes.push(platform);
    }
  }

  private createDecorations(): void {
    const treeGeo = new THREE.ConeGeometry(1.5, 4, 6);
    const treeMat = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });

    // Trees along top and bottom edges
    const positions = [
      [-40, -45], [-10, -47], [20, -44], [50, -46],
      [-40, 45], [-10, 47], [20, 44], [50, 46],
    ];

    for (const [x, z] of positions) {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 0.75, z);
      trunk.castShadow = true;
      this.group.add(trunk);

      const crown = new THREE.Mesh(treeGeo, treeMat);
      crown.position.set(x, 3.5, z);
      crown.castShadow = true;
      this.group.add(crown);
    }

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
    const rockPositions = [[-30, -43], [10, 46], [40, -45], [-20, 44]];
    for (const [x, z] of rockPositions) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, 0.5, z);
      rock.scale.set(1 + Math.random() * 0.5, 0.6 + Math.random() * 0.4, 1 + Math.random() * 0.5);
      rock.castShadow = true;
      this.group.add(rock);
    }
  }

  highlightSlot(index: number, highlight: boolean): void {
    if (index < 0 || index >= this.towerSlotMeshes.length) return;
    const mat = this.towerSlotMeshes[index].material as THREE.MeshLambertMaterial;
    mat.color.setHex(highlight ? 0xffdd44 : 0x888888);
    mat.opacity = highlight ? 0.9 : 0.6;
  }

  hideSlot(index: number): void {
    if (index < 0 || index >= this.towerSlotMeshes.length) return;
    this.towerSlotMeshes[index].visible = false;
  }

  resetSlots(): void {
    for (const mesh of this.towerSlotMeshes) {
      mesh.visible = true;
      const mat = mesh.material as THREE.MeshLambertMaterial;
      mat.color.setHex(0x888888);
      mat.opacity = 0.6;
    }
  }
}
