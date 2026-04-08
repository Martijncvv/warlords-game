import * as THREE from 'three';
import { LANE_COUNT, LANE_HEIGHT, FIELD_SPAN, FIELD_LENGTH } from '../constants';

export class LaneSelector {
  private highlight: THREE.Mesh;
  private indicators: HTMLElement[] = [];
  private indicatorContainer: HTMLElement;
  selectedLane = 0;

  constructor(scene: THREE.Scene) {
    // Horizontal highlight strip (lane runs left-to-right along X)
    const geo = new THREE.PlaneGeometry(FIELD_LENGTH - 14, LANE_HEIGHT - 0.5);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    this.highlight = new THREE.Mesh(geo, mat);
    this.highlight.rotation.x = -Math.PI / 2;
    this.highlight.position.y = 0.02;
    scene.add(this.highlight);

    // HTML lane indicators
    this.indicatorContainer = document.getElementById('lane-indicators')!;
    for (let i = 0; i < LANE_COUNT; i++) {
      const div = document.createElement('div');
      div.className = 'lane-indicator';
      div.textContent = `${i + 1}`;
      this.indicatorContainer.appendChild(div);
      this.indicators.push(div);
    }

    this.updateHighlight(0);
  }

  updateHighlight(lane: number): void {
    this.selectedLane = lane;
    // Lanes spread along Z axis
    const z = -FIELD_SPAN / 2 + lane * LANE_HEIGHT + LANE_HEIGHT / 2;
    this.highlight.position.z = z;

    for (let i = 0; i < this.indicators.length; i++) {
      this.indicators[i].classList.toggle('active', i === lane);
    }
  }

  setVisible(visible: boolean): void {
    this.highlight.visible = visible;
    this.indicatorContainer.style.display = visible ? 'flex' : 'none';
  }
}
