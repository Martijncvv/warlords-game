export class ResultScreen {
  private el: HTMLElement;
  private title: HTMLElement;
  private subtitle: HTMLElement;
  private playAgainBtn: HTMLButtonElement;
  onPlayAgain: (() => void) | null = null;

  constructor() {
    this.el = document.getElementById('result-screen')!;
    this.title = document.getElementById('result-title')!;
    this.subtitle = document.getElementById('result-subtitle')!;
    this.playAgainBtn = document.getElementById('play-again-btn') as HTMLButtonElement;
    this.playAgainBtn.addEventListener('click', () => {
      this.onPlayAgain?.();
    });
  }

  show(winner: 'player' | 'enemy'): void {
    if (winner === 'player') {
      this.title.textContent = 'VICTORY';
      this.title.className = 'result-victory';
      this.subtitle.textContent = 'The enemy castle has fallen!';
    } else {
      this.title.textContent = 'DEFEAT';
      this.title.className = 'result-defeat';
      this.subtitle.textContent = 'Your castle has been destroyed.';
    }
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }
}
