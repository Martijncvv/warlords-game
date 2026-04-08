import * as THREE from 'three';
import { GamePhase, Faction, UnitType, TowerType } from '../types';
import { CHARGE_KILL_THRESHOLD, TOWER_STATS } from '../constants';
import { GameState } from './GameState';
import { EventBus } from './EventBus';
import { Clock } from './Clock';
import { InputManager } from './InputManager';
import { SceneManager } from '../scene/SceneManager';
import { CameraController } from '../scene/CameraController';
import { LightingSetup } from '../scene/LightingSetup';
import { Terrain } from '../scene/Terrain';
import { ParticleSystem } from '../scene/ParticleSystem';
import { Castle } from '../entities/Castle';
import { Unit } from '../entities/Unit';
import { UNIT_TYPE_ORDER } from '../entities/UnitTypes';
import { LaneManager } from '../systems/LaneManager';
import { MovementSystem } from '../systems/MovementSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { AISystem } from '../systems/AISystem';
import { WinConditionSystem } from '../systems/WinConditionSystem';
import { TowerSystem } from '../systems/TowerSystem';
import { UIManager } from '../ui/UIManager';

export class Game {
  private sceneManager: SceneManager;
  private cameraController: CameraController;
  private lighting: LightingSetup;
  private terrain: Terrain;
  private particles: ParticleSystem;

  private state: GameState;
  private eventBus: EventBus;
  private clock: Clock;
  private input: InputManager;

  private laneManager: LaneManager;
  private movementSystem: MovementSystem;
  private combatSystem: CombatSystem;
  private economySystem: EconomySystem;
  private spawnSystem: SpawnSystem;
  private aiSystem: AISystem;
  private winCondition: WinConditionSystem;
  private towerSystem!: TowerSystem;

  private ui: UIManager;

  private playerCastle!: Castle;
  private enemyCastle!: Castle;

  // Tower placement state
  private pendingTowerType: TowerType | null = null;
  private paused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.state = new GameState();
    this.eventBus = new EventBus();
    this.clock = new Clock();

    // Scene
    this.sceneManager = new SceneManager(canvas);
    this.cameraController = new CameraController(this.sceneManager.camera);
    this.lighting = new LightingSetup(this.sceneManager.scene);
    this.terrain = new Terrain();
    this.sceneManager.scene.add(this.terrain.group);
    this.particles = new ParticleSystem(this.sceneManager.scene);

    // Input
    this.input = new InputManager(this.sceneManager.camera, canvas, this.eventBus);

    // Systems
    this.laneManager = new LaneManager();
    this.movementSystem = new MovementSystem();
    this.combatSystem = new CombatSystem(this.eventBus);
    this.economySystem = new EconomySystem(this.eventBus);
    this.spawnSystem = new SpawnSystem(this.eventBus);
    this.aiSystem = new AISystem();
    this.winCondition = new WinConditionSystem(this.eventBus);

    // UI
    this.ui = new UIManager(this.sceneManager.scene, this.eventBus);

    this.setupEvents();
    this.showMenu();
    this.loop();
  }

  private setupEvents(): void {
    // Lane selection
    this.eventBus.on('laneSelected', (lane: number) => {
      this.ui.laneSelector.updateHighlight(lane);
    });

    // Unit deployment via button
    this.eventBus.on('unitButtonClicked', (type: UnitType) => {
      this.deployUnit(type);
    });

    // Unit deployment via keyboard
    this.eventBus.on('unitKeyPressed', (keyNum: number) => {
      const idx = keyNum - 1;
      if (idx >= 0 && idx < UNIT_TYPE_ORDER.length) {
        this.deployUnit(UNIT_TYPE_ORDER[idx]);
      }
    });

    // Tower type selected from panel
    this.eventBus.on('towerTypeSelected', (type: TowerType | null) => {
      this.pendingTowerType = type;
      this.updateSlotHighlights();
    });

    // Tower slot clicked
    this.eventBus.on('towerSlotClicked', (slotIndex: number) => {
      if (this.state.phase !== GamePhase.BATTLE) return;
      if (this.pendingTowerType && this.towerSystem.isSlotEmpty(slotIndex)) {
        const success = this.towerSystem.buildTower(
          this.pendingTowerType,
          slotIndex,
          this.economySystem
        );
        if (success) {
          this.terrain.hideSlot(slotIndex);
          this.ui.towerPanel.cancelSelection();
          this.pendingTowerType = null;
          this.updateSlotHighlights();
        }
      }
    });

    // Tower key shortcut: 7/8/9 selects tower type, then click slot
    this.eventBus.on('towerKeyPressed', (keyNum: number) => {
      const types = [TowerType.ARROW, TowerType.FROST, TowerType.FIRE];
      const idx = keyNum - 7;
      if (idx >= 0 && idx < types.length) {
        this.ui.towerPanel.selectType(types[idx]);
      }
    });

    // Pause toggle
    this.eventBus.on('togglePause', () => {
      if (this.state.phase !== GamePhase.BATTLE) return;
      this.paused = !this.paused;
      this.ui.showPause(this.paused);
    });

    // Cancel placement
    this.eventBus.on('cancelPlacement', () => {
      this.ui.towerPanel.cancelSelection();
      this.pendingTowerType = null;
      this.updateSlotHighlights();
    });

    // Tower built event
    this.eventBus.on('towerBuilt', (slotIndex: number) => {
      this.cameraController.shake(0.3);
    });

    // Combat effects
    this.eventBus.on('unitHit', (unit: Unit, damage: number) => {
      this.particles.emit(unit.mesh.position, 0xffaa00, 3);
    });

    this.eventBus.on('unitKilled', (unit: Unit) => {
      this.particles.emit(unit.mesh.position, 0xff4444, 6);
      this.cameraController.shake(0.5);
    });

    this.eventBus.on('projectileHit', (pos: THREE.Vector3) => {
      this.particles.emit(pos, 0xff8800, 4);
    });

    // Charge mechanic
    this.eventBus.on('chargeReady', (faction: Faction) => {
      this.spawnSystem.spawnCharge(
        faction,
        this.economySystem,
        this.laneManager,
        this.sceneManager.scene
      );
      if (faction === Faction.PLAYER) {
        this.cameraController.shake(2);
      }
    });

    // Game over
    this.eventBus.on('gameOver', (winner: string) => {
      this.state.winner = winner as 'player' | 'enemy';
      this.state.setPhase(GamePhase.RESULT);
      this.input.enabled = false;
      this.ui.showResult(winner as 'player' | 'enemy');
    });

    // Menu callbacks
    this.ui.menuScreen.onStart = () => this.startBattle();
    this.ui.resultScreen.onPlayAgain = () => this.showMenu();
  }

  private updateSlotHighlights(): void {
    for (let i = 0; i < 3; i++) {
      if (this.towerSystem && !this.towerSystem.isSlotEmpty(i)) continue;
      this.terrain.highlightSlot(i, this.pendingTowerType !== null);
    }
  }

  private showMenu(): void {
    this.state.setPhase(GamePhase.MENU);
    this.input.enabled = false;
    this.cleanup();
    this.ui.showMenu();
    this.cameraController.resetPosition();
    this.terrain.resetSlots();
  }

  private startBattle(): void {
    this.cleanup();
    this.state.setPhase(GamePhase.BATTLE);
    this.state.winner = null;

    // Create castles
    this.playerCastle = new Castle(Faction.PLAYER);
    this.enemyCastle = new Castle(Faction.ENEMY);
    this.sceneManager.scene.add(this.playerCastle.mesh);
    this.sceneManager.scene.add(this.enemyCastle.mesh);

    // Tower system
    this.towerSystem = new TowerSystem(this.sceneManager.scene, this.eventBus);

    // Reset systems
    this.economySystem.reset();
    this.spawnSystem.reset();
    this.aiSystem.reset();
    this.clock.reset();
    this.terrain.resetSlots();
    this.pendingTowerType = null;

    this.paused = false;
    this.input.enabled = true;
    this.input.selectedLane = 0;
    this.ui.showBattle();
    this.ui.laneSelector.updateHighlight(0);
    this.ui.towerPanel.cancelSelection();
    this.cameraController.resetPosition();
  }

  private deployUnit(type: UnitType): void {
    if (this.state.phase !== GamePhase.BATTLE) return;
    this.spawnSystem.spawnUnit(
      type,
      Faction.PLAYER,
      this.input.selectedLane,
      this.economySystem,
      this.laneManager,
      this.sceneManager.scene
    );
  }

  private cleanup(): void {
    this.laneManager.clear(this.sceneManager.scene);
    this.combatSystem.clear(this.sceneManager.scene);
    if (this.towerSystem) this.towerSystem.clear();
    if (this.playerCastle) {
      this.sceneManager.scene.remove(this.playerCastle.mesh);
      this.playerCastle.dispose();
    }
    if (this.enemyCastle) {
      this.sceneManager.scene.remove(this.enemyCastle.mesh);
      this.enemyCastle.dispose();
    }
  }

  private loop = (): void => {
    requestAnimationFrame(this.loop);
    const dt = this.clock.tick();

    if (this.state.phase === GamePhase.BATTLE && !this.paused) {
      // Update systems
      this.economySystem.update(dt);
      this.spawnSystem.update(dt);
      this.movementSystem.update(dt, this.laneManager, this.playerCastle, this.enemyCastle);
      this.combatSystem.update(dt, this.laneManager, this.sceneManager.scene);
      this.towerSystem.update(dt, this.laneManager);
      this.aiSystem.update(dt, this.laneManager, this.economySystem, this.spawnSystem, this.sceneManager.scene);
      this.winCondition.update(this.playerCastle, this.enemyCastle);

      // Update animations
      for (const unit of this.laneManager.getAllUnits()) {
        unit.updateAnimation(dt);
      }

      // Cleanup dead units
      this.laneManager.cleanup(this.sceneManager.scene);

      // Update UI
      this.ui.goldDisplay.update(this.economySystem.playerGold);
      this.ui.unitPanel.update(this.economySystem.playerGold);
      this.ui.territoryBar.update(this.playerCastle, this.enemyCastle);
      this.ui.updateCharge(this.spawnSystem.playerKillCount, CHARGE_KILL_THRESHOLD);

      // Tower panel: show which slots are full
      const slotsFull = this.towerSystem.towers.map((t) => t !== null);
      this.ui.towerPanel.update(this.economySystem.playerGold, slotsFull);
    }

    this.particles.update(dt);
    this.cameraController.update(dt);
    this.sceneManager.render();
  };
}
