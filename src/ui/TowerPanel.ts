import { TowerType } from '../types';
import { TOWER_STATS } from '../constants';
import { EventBus } from '../core/EventBus';

const TOWER_TYPE_ORDER: TowerType[] = [TowerType.ARROW, TowerType.FROST, TowerType.FIRE];

export class TowerPanel {
  private container: HTMLElement;
  private buttons: HTMLButtonElement[] = [];
  private eventBus: EventBus;
  private selectedType: TowerType | null = null;
  private statusEl: HTMLElement;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.container = document.getElementById('tower-panel')!;
    this.statusEl = document.getElementById('tower-status')!;
    this.createButtons();
  }

  private createButtons(): void {
    for (const type of TOWER_TYPE_ORDER) {
      const stats = TOWER_STATS[type];
      const btn = document.createElement('button');
      btn.className = 'tower-btn';
      btn.dataset.towerType = type;
      btn.innerHTML = `
        <span class="tower-key">${stats.key}</span>
        <span class="tower-name">${stats.label}</span>
        <span class="tower-cost">${stats.cost}g</span>
        <span class="tower-desc">${stats.description}</span>
      `;
      btn.addEventListener('click', () => {
        this.selectType(type);
      });
      this.container.appendChild(btn);
      this.buttons.push(btn);
    }
  }

  selectType(type: TowerType): void {
    if (this.selectedType === type) {
      this.cancelSelection();
      return;
    }
    this.selectedType = type;
    this.eventBus.emit('towerTypeSelected', type);
    this.updateButtonStates();
    this.statusEl.textContent = `Click an empty slot to place ${TOWER_STATS[type].label}`;
    this.statusEl.classList.remove('hidden');
  }

  cancelSelection(): void {
    this.selectedType = null;
    this.eventBus.emit('towerTypeSelected', null);
    this.updateButtonStates();
    this.statusEl.classList.add('hidden');
  }

  getSelectedType(): TowerType | null {
    return this.selectedType;
  }

  private updateButtonStates(): void {
    for (const btn of this.buttons) {
      const type = btn.dataset.towerType as TowerType;
      btn.classList.toggle('selected', type === this.selectedType);
    }
  }

  update(gold: number, slotsFull: boolean[]): void {
    for (const btn of this.buttons) {
      const type = btn.dataset.towerType as TowerType;
      const cost = TOWER_STATS[type].cost;
      const allFull = slotsFull.every(Boolean);
      btn.classList.toggle('disabled', gold < cost || allFull);
    }
  }
}
