export default class Throttler {
  private throttleId: NodeJS.Timeout = null;

  private delayId: NodeJS.Timeout = null;

  private msec: number = null;

  private immediate: boolean = null;

  constructor(msec: number, immediate = false) {
    this.msec = msec;
    this.immediate = immediate;
    this.delay = this.delay.bind(this);
  }

  public throttle(fn: () => void): void {
    if (!this.throttleId) {
      if (this.immediate) {
        fn();
      }

      this.throttleId = setTimeout(() => {
        if (!this.immediate) {
          fn();
        }
        this.throttleId = null;
      }, this.msec);
    }
  }

  public delay(fn: () => void): void {
    if (this.delayId) {
      clearTimeout(this.delayId);
    }
    this.delayId = setTimeout(fn, this.msec);
  }

  public delayAsync(fn: (...args: any[]) => Promise<any>, ...args: any[]): Promise<any> {
    if (this.delayId) {
      clearTimeout(this.delayId);
    }
    return new Promise((resolve, reject) => {
      this.delayId = setTimeout(async () => {
        try {
          resolve(await fn?.(...args));
        } catch (error) {
          reject(error);
        }
      }, this.msec);
    });
  }
}
