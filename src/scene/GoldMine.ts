import * as THREE from 'three';
import { CASTLE_X_OFFSET } from '../constants';

export class GoldMine {
  group: THREE.Group;
  private miners: THREE.Group[] = [];
  private cart: THREE.Group;
  private coinTimer = 0;
  private coins: { mesh: THREE.Mesh; vy: number; life: number }[] = [];

  // Positions for new villagers (up to ~10)
  private readonly villagerSlots = [
    { x: -3, z: 5.5, rot: 0.5 },
    { x: 3.5, z: 4, rot: -0.6 },
    { x: -1, z: 7, rot: 0.2 },
    { x: 1.5, z: 7.5, rot: -0.3 },
    { x: -3.5, z: 7, rot: 0.7 },
    { x: 4, z: 6.5, rot: -0.1 },
    { x: 0, z: 8.5, rot: 0.4 },
    { x: -2.5, z: 8.5, rot: -0.5 },
    { x: 2.5, z: 9, rot: 0.3 },
    { x: 0, z: 9.5, rot: -0.2 },
  ];

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-CASTLE_X_OFFSET - 8, 0, 20);

    this.createMineEntrance();
    this.createStartingMiners();
    this.cart = this.createCart();
    this.createFarm();
  }

  private createMineEntrance(): void {
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b3a1f });
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    const mound = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), rockMat);
    mound.scale.set(1.2, 0.8, 1);
    mound.castShadow = true;
    this.group.add(mound);

    const opening = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 1), darkMat);
    opening.position.set(0, 1.2, 2.5);
    this.group.add(opening);

    const postGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
    const leftPost = new THREE.Mesh(postGeo, woodMat);
    leftPost.position.set(-1.3, 1.5, 3);
    this.group.add(leftPost);
    const rightPost = new THREE.Mesh(postGeo, woodMat);
    rightPost.position.set(1.3, 1.5, 3);
    this.group.add(rightPost);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 0.3), woodMat);
    lintel.position.set(0, 3, 3);
    this.group.add(lintel);

    const signPost = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2, 0.15), woodMat);
    signPost.position.set(3, 1, 3);
    this.group.add(signPost);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.1), woodMat);
    sign.position.set(3, 2.2, 3);
    this.group.add(sign);

    const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const speckPositions = [[-1.5, 1, 1], [0.5, 2, 0.5], [1.8, 0.8, 1.5], [-0.5, 2.5, 0.2]];
    for (const [x, y, z] of speckPositions) {
      const speck = new THREE.Mesh(new THREE.OctahedronGeometry(0.15), goldMat);
      speck.position.set(x, y, z);
      this.group.add(speck);
    }
  }

  private createStartingMiners(): void {
    // 3 starting miners
    const startPositions = [
      { x: -2, z: 4.5, rot: 0.3 },
      { x: 2, z: 5, rot: -0.4 },
      { x: 0, z: 6, rot: 0.1 },
    ];
    for (const pos of startPositions) {
      this.addMinerAtPosition(pos.x, pos.z, pos.rot);
    }
  }

  private addMinerAtPosition(x: number, z: number, rot: number): void {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    const toolMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

    const miner = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.3), clothMat);
    body.position.y = 0.7;
    miner.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 4), skinMat);
    head.position.y = 1.3;
    miner.add(head);

    const legGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
    const l1 = new THREE.Mesh(legGeo, clothMat);
    l1.position.set(-0.1, 0.2, 0);
    miner.add(l1);
    const l2 = new THREE.Mesh(legGeo, clothMat);
    l2.position.set(0.1, 0.2, 0);
    miner.add(l2);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4),
      new THREE.MeshLambertMaterial({ color: 0x5c3a1e })
    );
    handle.position.set(0.4, 1.2, 0);
    handle.rotation.z = -0.5;
    miner.add(handle);
    const pickHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.08), toolMat);
    pickHead.position.set(0.7, 1.5, 0);
    miner.add(pickHead);

    miner.position.set(x, 0, z);
    miner.rotation.y = rot;
    // Start with a pop-in scale animation
    miner.scale.setScalar(0.01);
    this.group.add(miner);
    this.miners.push(miner);
  }

  /** Add a new villager to the mine visually */
  addVillager(): void {
    const extraIndex = this.miners.length - 3; // first 3 are starters
    if (extraIndex < this.villagerSlots.length) {
      const slot = this.villagerSlots[extraIndex];
      this.addMinerAtPosition(slot.x, slot.z, slot.rot);
    } else {
      // Overflow: random position
      this.addMinerAtPosition(
        (Math.random() - 0.5) * 8,
        5 + Math.random() * 5,
        (Math.random() - 0.5) * 1
      );
    }
  }

  get minerCount(): number {
    return this.miners.length;
  }

  private createCart(): THREE.Group {
    const cart = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b3a1f });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1), woodMat);
    body.position.y = 0.6;
    cart.add(body);

    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
    for (const [x, z] of [[-0.8, 0.55], [0.8, 0.55], [-0.8, -0.55], [0.8, -0.55]]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(x, 0.3, z);
      wheel.rotation.x = Math.PI / 2;
      cart.add(wheel);
    }

    const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    for (let i = 0; i < 5; i++) {
      const nugget = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 + Math.random() * 0.08), goldMat);
      nugget.position.set(
        (Math.random() - 0.5) * 1,
        0.95 + Math.random() * 0.15,
        (Math.random() - 0.5) * 0.5
      );
      cart.add(nugget);
    }

    cart.position.set(0, 0, 8);
    this.group.add(cart);
    return cart;
  }

  private createFarm(): void {
    const farmGroup = new THREE.Group();
    farmGroup.position.set(6, 0, 4);

    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    const postGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const railGeo = new THREE.BoxGeometry(0.05, 0.05, 3);
    for (let i = 0; i < 4; i++) {
      const post = new THREE.Mesh(postGeo, fenceMat);
      post.position.set(i * 1 - 1.5, 0.4, -1.5);
      farmGroup.add(post);
      const post2 = new THREE.Mesh(postGeo, fenceMat);
      post2.position.set(i * 1 - 1.5, 0.4, 1.5);
      farmGroup.add(post2);
    }
    const rail1 = new THREE.Mesh(railGeo, fenceMat);
    rail1.position.set(-1.5, 0.5, 0);
    farmGroup.add(rail1);
    const rail2 = new THREE.Mesh(railGeo, fenceMat);
    rail2.position.set(1.5, 0.5, 0);
    farmGroup.add(rail2);

    const wheatMat = new THREE.MeshLambertMaterial({ color: 0xdaa520 });
    const stalkGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 3);
    const headGeo = new THREE.SphereGeometry(0.06, 4, 4);
    for (let x = -1; x <= 1; x += 0.5) {
      for (let z = -1; z <= 1; z += 0.5) {
        const stalk = new THREE.Mesh(stalkGeo, new THREE.MeshLambertMaterial({ color: 0x228B22 }));
        stalk.position.set(x + Math.random() * 0.2, 0.35, z + Math.random() * 0.2);
        farmGroup.add(stalk);
        const head = new THREE.Mesh(headGeo, wheatMat);
        head.position.set(stalk.position.x, 0.72, stalk.position.z);
        farmGroup.add(head);
      }
    }

    this.group.add(farmGroup);
  }

  update(dt: number): void {
    for (let i = 0; i < this.miners.length; i++) {
      const miner = this.miners[i];
      // Pop-in animation for newly added miners
      if (miner.scale.x < 0.99) {
        miner.scale.addScalar(dt * 3);
        if (miner.scale.x > 1) miner.scale.setScalar(1);
        continue;
      }
      const phase = performance.now() * 0.003 + i * 2.1;
      const swing = Math.sin(phase) * 0.4;
      if (miner.children[4]) miner.children[4].rotation.z = -0.5 + swing;
      if (miner.children[5]) miner.children[5].position.y = 1.5 + Math.sin(phase) * 0.2;
      miner.position.y = Math.abs(Math.sin(phase * 0.5)) * 0.05;
    }

    this.cart.rotation.z = Math.sin(performance.now() * 0.002) * 0.02;

    this.coinTimer += dt;
    if (this.coinTimer > 1.5) {
      this.coinTimer = 0;
      // More coins with more miners
      const coinCount = Math.min(this.miners.length, 5);
      for (let i = 0; i < Math.ceil(coinCount / 3); i++) {
        this.spawnCoin();
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.life += dt;
      coin.mesh.position.y += coin.vy * dt;
      coin.mesh.rotation.y += dt * 4;
      coin.vy -= 1 * dt;

      const opacity = 1 - coin.life / 1.5;
      (coin.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacity);

      if (coin.life > 1.5) {
        this.group.remove(coin.mesh);
        coin.mesh.geometry.dispose();
        (coin.mesh.material as THREE.Material).dispose();
        this.coins.splice(i, 1);
      }
    }
  }

  private spawnCoin(): void {
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 1 })
    );
    coin.position.set(
      (Math.random() - 0.5) * 2,
      2 + Math.random(),
      3
    );
    coin.rotation.x = Math.PI / 2;
    this.group.add(coin);
    this.coins.push({ mesh: coin, vy: 2 + Math.random(), life: 0 });
  }
}
