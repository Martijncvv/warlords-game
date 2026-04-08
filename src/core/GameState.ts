import { GamePhase } from '../types';

export class GameState {
  phase: GamePhase = GamePhase.MENU;
  winner: 'player' | 'enemy' | null = null;

  setPhase(phase: GamePhase): void {
    this.phase = phase;
  }

  reset(): void {
    this.phase = GamePhase.MENU;
    this.winner = null;
  }
}
