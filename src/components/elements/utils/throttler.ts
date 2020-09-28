export default class Throttler {
  private id: NodeJS.Timeout = null;

  private delayId: NodeJS.Timeout = null;

  private msec: number = null;

  constructor(msec: number) {
    this.msec = msec;
    this.delay = this.delay.bind(this);
  }

  public delay(fn: () => void): void {
    if (this.delayId) {
      clearTimeout(this.delayId);
    }
    this.delayId = setTimeout(fn, this.msec);
  }
}
