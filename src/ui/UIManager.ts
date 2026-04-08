import { GoldDisplay } from './GoldDisplay';
import { UnitPanel } from './UnitPanel';
import { LaneSelector } from './LaneSelector';
import { TerritoryBar } from './TerritoryBar';
import { MenuScreen } from './MenuScreen';
import { ResultScreen } from './ResultScreen';
import { Tooltip } from './Tooltip';
import { TowerPanel } from './TowerPanel';
import { EventBus } from '../core/EventBus';
import * as THREE from 'three';

export class UIManager {
  goldDisplay: GoldDisplay;
  unitPanel: UnitPanel;
  laneSelector: LaneSelector;
  territoryBar: TerritoryBar;
  menuScreen: MenuScreen;
  resultScreen: ResultScreen;
  tooltip: Tooltip;
  towerPanel: TowerPanel;
  private hudEl: HTMLElement;
  private chargeEl: HTMLElement;
  private pauseEl: HTMLElement;

  constructor(scene: THREE.Scene, eventBus: EventBus) {
    this.goldDisplay = new GoldDisplay();
    this.unitPanel = new UnitPanel(eventBus);
    this.laneSelector = new LaneSelector(scene);
    this.territoryBar = new TerritoryBar();
    this.menuScreen = new MenuScreen();
    this.resultScreen = new ResultScreen();
    this.tooltip = new Tooltip();
    this.towerPanel = new TowerPanel(eventBus);
    this.hudEl = document.getElementById('hud')!;
    this.chargeEl = document.getElementById('charge-bar')!;
    this.pauseEl = document.getElementById('pause-overlay')!;
  }

  showMenu(): void {
    this.menuScreen.show();
    this.resultScreen.hide();
    this.hudEl.classList.add('hidden');
    this.laneSelector.setVisible(false);
  }

  showBattle(): void {
    this.menuScreen.hide();
    this.resultScreen.hide();
    this.hudEl.classList.remove('hidden');
    this.laneSelector.setVisible(true);
  }

  showResult(winner: 'player' | 'enemy'): void {
    this.resultScreen.show(winner);
    this.hudEl.classList.add('hidden');
    this.laneSelector.setVisible(false);
  }

  showPause(paused: boolean): void {
    this.pauseEl.classList.toggle('hidden', !paused);
  }

  updateCharge(kills: number, threshold: number): void {
    const pct = (kills / threshold) * 100;
    this.chargeEl.style.width = `${pct}%`;
  }
}
