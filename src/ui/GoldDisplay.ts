import { VILLAGER_INCOME_BONUS } from '../systems/EconomySystem';

export class GoldDisplay {
  private el: HTMLElement;
  private villagerBtn: HTMLElement;
  private villagerCostEl: HTMLElement;
  private villagerCountEl: HTMLElement;
  private incomeRateEl: HTMLElement;
  private onBuyVillager: (() => void) | null = null;

  constructor() {
    this.el = document.getElementById('gold-display')!;
    this.villagerBtn = document.getElementById('villager-btn')!;
    this.villagerCostEl = document.getElementById('villager-cost')!;
    this.villagerCountEl = document.getElementById('villager-count')!;
    this.incomeRateEl = document.getElementById('income-rate')!;

    this.villagerBtn.addEventListener('click', () => {
      this.onBuyVillager?.();
    });
  }

  setBuyVillagerCallback(cb: () => void): void {
    this.onBuyVillager = cb;
  }

  update(gold: number): void {
    this.el.textContent = `Gold: ${Math.floor(gold)}`;
  }

  updateVillagerUI(gold: number, villagerCount: number, nextCost: number, incomeRate: number): void {
    this.villagerCostEl.textContent = `${nextCost}g`;
    this.villagerCountEl.textContent = `Villagers: ${villagerCount}`;
    this.incomeRateEl.textContent = `Income: ${incomeRate.toFixed(1)}g/s`;

    if (gold >= nextCost) {
      this.villagerBtn.classList.remove('disabled');
    } else {
      this.villagerBtn.classList.add('disabled');
    }
  }
}
