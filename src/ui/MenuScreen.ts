export class MenuScreen {
  private el: HTMLElement;
  private startBtn: HTMLButtonElement;
  onStart: (() => void) | null = null;

  constructor() {
    this.el = document.getElementById('menu-screen')!;
    this.startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    this.startBtn.addEventListener('click', () => {
      this.onStart?.();
    });
  }

  show(): void {
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }
}
