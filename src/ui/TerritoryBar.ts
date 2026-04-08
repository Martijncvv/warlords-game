import { Castle } from '../entities/Castle';
import { CASTLE_HP } from '../constants';

export class TerritoryBar {
  private playerBar: HTMLElement;
  private enemyBar: HTMLElement;
  private playerText: HTMLElement;
  private enemyText: HTMLElement;

  constructor() {
    this.playerBar = document.getElementById('player-hp-fill')!;
    this.enemyBar = document.getElementById('enemy-hp-fill')!;
    this.playerText = document.getElementById('player-hp-text')!;
    this.enemyText = document.getElementById('enemy-hp-text')!;
  }

  update(playerCastle: Castle, enemyCastle: Castle): void {
    const playerPct = (playerCastle.hp / playerCastle.maxHp) * 100;
    const enemyPct = (enemyCastle.hp / enemyCastle.maxHp) * 100;

    this.playerBar.style.width = `${playerPct}%`;
    this.enemyBar.style.width = `${enemyPct}%`;

    this.playerText.textContent = `${Math.ceil(playerCastle.hp)}`;
    this.enemyText.textContent = `${Math.ceil(enemyCastle.hp)}`;
  }
}
