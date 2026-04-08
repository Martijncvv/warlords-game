type Callback = (...args: any[]) => void;

export class EventBus {
  private listeners = new Map<string, Callback[]>();

  on(event: string, callback: Callback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Callback): void {
    const cbs = this.listeners.get(event);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx !== -1) cbs.splice(idx, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    const cbs = this.listeners.get(event);
    if (cbs) {
      for (const cb of cbs) {
        cb(...args);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
