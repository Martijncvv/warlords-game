import { MAX_DELTA } from '../constants';

export class Clock {
  private lastTime = 0;
  private _delta = 0;
  private _elapsed = 0;
  private _running = false;

  get delta(): number {
    return this._delta;
  }

  get elapsed(): number {
    return this._elapsed;
  }

  start(): void {
    this.lastTime = performance.now() / 1000;
    this._running = true;
    this._elapsed = 0;
  }

  tick(): number {
    if (!this._running) {
      this.start();
      return 0;
    }
    const now = performance.now() / 1000;
    this._delta = Math.min(now - this.lastTime, MAX_DELTA);
    this.lastTime = now;
    this._elapsed += this._delta;
    return this._delta;
  }

  reset(): void {
    this._delta = 0;
    this._elapsed = 0;
    this._running = false;
  }
}
