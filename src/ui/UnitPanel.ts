import { UnitType } from '../types';
import { UNIT_STATS } from '../constants';
import { UNIT_TYPE_ORDER } from '../entities/UnitTypes';
import { EventBus } from '../core/EventBus';

export class UnitPanel {
  private container: HTMLElement;
  private buttons: HTMLButtonElement[] = [];
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.container = document.getElementById('unit-panel')!;
    this.createButtons();
  }

  private createButtons(): void {
    for (const type of UNIT_TYPE_ORDER) {
      const stats = UNIT_STATS[type];
      const btn = document.createElement('button');
      btn.className = 'unit-btn';
      btn.dataset.unitType = type;
      btn.innerHTML = `
        <span class="unit-key">${stats.key}</span>
        <span class="unit-name">${stats.label}</span>
        <span class="unit-cost">${stats.cost}g</span>
      `;
      btn.addEventListener('click', () => {
        this.eventBus.emit('unitButtonClicked', type);
      });
      this.container.appendChild(btn);
      this.buttons.push(btn);
    }
  }

  update(gold: number): void {
    for (const btn of this.buttons) {
      const type = btn.dataset.unitType as UnitType;
      const cost = UNIT_STATS[type].cost;
      btn.classList.toggle('disabled', gold < cost);
    }
  }
}
