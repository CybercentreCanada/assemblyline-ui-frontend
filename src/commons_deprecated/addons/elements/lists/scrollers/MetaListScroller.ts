import ListScroller from './ListScroller';

export default class MetaListScroller implements ListScroller {
  constructor(private scrollTarget: HTMLElement, private listElement: HTMLElement, private rowHeight?: number) {}

  public scrollTo(position: number) {
    const scrollElement = this.scrollElement(position);
    if (scrollElement) {
      // If element exists already, use native scrollIntoView.
      const offset = this.offset();
      scrollElement.scrollIntoView({ block: offset > 0 ? 'end' : 'nearest' });
    } else {
      // If the next element isn't already rendered then we fallback on the specified rowHeight.
      this.withRowHeight(position);
    }
  }

  private withRowHeight(position: number) {
    const { height: targetHeight } = this.scrollTarget.getBoundingClientRect();
    const frameTop = this.scrollTarget.scrollTop;
    const frameBottom = frameTop + targetHeight;
    const top = position * this.rowHeight;
    const bottom = top + this.rowHeight;
    if (top < frameTop) {
      this.scrollTarget.scrollBy({ top: top - frameTop });
    } else if (bottom > frameBottom) {
      this.scrollTarget.scrollBy({ top: bottom - frameBottom });
    }
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
