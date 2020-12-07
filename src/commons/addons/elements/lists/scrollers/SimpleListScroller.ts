import ListScroller from './ListScroller';

export default class SimpleListScroller implements ListScroller {
  constructor(private scrollTarget: HTMLElement, private listElement: HTMLElement, private rowHeight?: number) {}

  public scrollTo(position: number) {
    const scrollElement = this.scrollElement(position);
    const offset = this.offset();
    scrollElement.scrollIntoView({ block: offset > 0 ? 'end' : 'nearest' });
  }

  private scrollElement(position: number): HTMLElement {
    return this.scrollTarget.querySelector(`[data-listitem-position="${position}"]`);
  }

  private offset() {
    if (this.scrollTarget === this.listElement) {
      return 0;
    }
    const { scrollTop } = this.scrollTarget;
    const cTop = this.listElement.getBoundingClientRect().top;
    return scrollTop + cTop;
  }
}
