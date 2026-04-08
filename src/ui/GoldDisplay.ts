export class GoldDisplay {
  private el: HTMLElement;

  constructor() {
    this.el = document.getElementById('gold-display')!;
  }

  update(gold: number): void {
    this.el.textContent = `Gold: ${Math.floor(gold)}`;
  }
}
