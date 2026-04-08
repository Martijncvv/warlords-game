import * as THREE from 'three';

export class LightingSetup {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  hemisphereLight: THREE.HemisphereLight;

  constructor(scene: THREE.Scene) {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.3);
    scene.add(this.hemisphereLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(30, 60, 30);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 200;
    this.directionalLight.shadow.camera.left = -80;
    this.directionalLight.shadow.camera.right = 80;
    this.directionalLight.shadow.camera.top = 80;
    this.directionalLight.shadow.camera.bottom = -80;
    scene.add(this.directionalLight);
  }
}
