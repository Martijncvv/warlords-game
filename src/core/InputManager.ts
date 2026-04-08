import * as THREE from 'three';
import { LANE_COUNT, LANE_HEIGHT, FIELD_SPAN, TOWER_SLOT_POSITIONS } from '../constants';
import { EventBus } from './EventBus';

export class InputManager {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  private eventBus: EventBus;
  private keysDown = new Set<string>();
  selectedLane = 0;
  enabled = false;

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement, eventBus: EventBus) {
    this.camera = camera;
    this.canvas = canvas;
    this.eventBus = eventBus;

    canvas.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onClick = (e: MouseEvent): void => {
    if (!this.enabled) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, intersection);

    if (intersection) {
      // Check if clicking a tower slot
      for (let i = 0; i < TOWER_SLOT_POSITIONS.length; i++) {
        const [sx, , sz] = TOWER_SLOT_POSITIONS[i];
        const dx = intersection.x - sx;
        const dz = intersection.z - sz;
        if (Math.sqrt(dx * dx + dz * dz) < 4) {
          this.eventBus.emit('towerSlotClicked', i);
          return;
        }
      }

      // Lane selection: lanes spread along Z axis
      const z = intersection.z + FIELD_SPAN / 2;
      const lane = Math.floor(z / LANE_HEIGHT);
      if (lane >= 0 && lane < LANE_COUNT) {
        this.selectedLane = lane;
        this.eventBus.emit('laneSelected', lane);
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return;
    this.keysDown.add(e.key);

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
      this.selectedLane = Math.max(0, this.selectedLane - 1);
      this.eventBus.emit('laneSelected', this.selectedLane);
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
      this.selectedLane = Math.min(LANE_COUNT - 1, this.selectedLane + 1);
      this.eventBus.emit('laneSelected', this.selectedLane);
    } else if (e.key >= '1' && e.key <= '5') {
      this.eventBus.emit('unitKeyPressed', parseInt(e.key));
    } else if (e.key >= '7' && e.key <= '9') {
      this.eventBus.emit('towerKeyPressed', parseInt(e.key));
    } else if (e.key === 'p' || e.key === 'P') {
      this.eventBus.emit('togglePause');
    } else if (e.key === 'Escape') {
      this.eventBus.emit('cancelPlacement');
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysDown.delete(e.key);
  };

  isKeyDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  dispose(): void {
    this.canvas.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
