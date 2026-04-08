import { UnitType } from '../types';
import { UNIT_STATS } from '../constants';

export class Tooltip {
  private el: HTMLElement;

  constructor() {
    this.el = document.getElementById('tooltip')!;
    this.setupListeners();
  }

  private setupListeners(): void {
    document.querySelectorAll('.unit-btn').forEach((btn) => {
      btn.addEventListener('mouseenter', (e) => {
        const type = (btn as HTMLElement).dataset.unitType as UnitType;
        if (type) this.show(type, e as MouseEvent);
      });
      btn.addEventListener('mouseleave', () => this.hide());
    });

    // Also handle dynamically created buttons
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.unit-btn:not([data-tooltip-bound])').forEach((btn) => {
        (btn as HTMLElement).dataset.tooltipBound = 'true';
        btn.addEventListener('mouseenter', (e) => {
          const type = (btn as HTMLElement).dataset.unitType as UnitType;
          if (type) this.show(type, e as MouseEvent);
        });
        btn.addEventListener('mouseleave', () => this.hide());
      });
    });
    observer.observe(document.getElementById('unit-panel')!, { childList: true });
  }

  show(type: UnitType, e: MouseEvent): void {
    const stats = UNIT_STATS[type];
    const rangeLabel = stats.range <= 5 ? 'Melee' : `${stats.range}`;
    this.el.innerHTML = `
      <strong>${stats.label}</strong><br>
      HP: ${stats.hp} | DMG: ${stats.damage}<br>
      Range: ${rangeLabel} | Speed: ${stats.speed}<br>
      Cost: ${stats.cost}g
    `;
    this.el.style.left = `${e.clientX + 10}px`;
    this.el.style.top = `${e.clientY - 60}px`;
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }
}
