import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private shakeIntensity = 0;
  private shakeDecay = 5;
  private basePosition = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.resetPosition();
  }

  resetPosition(): void {
    // Elevated view from south, looking at center — battlefield runs left to right
    this.camera.position.set(0, 80, 75);
    this.camera.lookAt(0, 0, 0);
    this.basePosition.copy(this.camera.position);
  }

  shake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  update(dt: number): void {
    if (this.shakeIntensity > 0.01) {
      this.camera.position.x = this.basePosition.x + (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y = this.basePosition.y + (Math.random() - 0.5) * this.shakeIntensity * 0.5;
      this.shakeIntensity *= Math.exp(-this.shakeDecay * dt);
    } else {
      this.shakeIntensity = 0;
      this.camera.position.copy(this.basePosition);
    }
  }
}
