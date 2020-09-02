export default class Throttler {
  private id: NodeJS.Timeout = null;

  private msec: number = null;

  constructor(msec: number) {
    this.msec = msec;
  }

  public throttle(fn: () => void): void {
    if (!this.id) {
      this.id = setTimeout(() => {
        fn();
        this.id = null;
      }, this.msec);
    }
  }
}
