import ListScroller from './ListScroller';

export default class BasicScroller implements ListScroller {
  constructor(private scrollTarget: HTMLElement) {}

  public scrollTo(position: number): void {
    const scrollEl = this.getScrollElement(position);
    if (scrollEl) {
      scrollEl.scrollIntoView({ block: 'nearest' });
    }
  }

  protected getScrollElement(position: number): HTMLElement {
    return this.scrollTarget.querySelector(`[data-listitem-position="${position}"]`);
  }
}
