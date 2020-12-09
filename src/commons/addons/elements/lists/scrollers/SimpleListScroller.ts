import ListScroller from './ListScroller';

export default class SimpleListScroller implements ListScroller {
  constructor(private scrollTarget: HTMLElement, private listElement: HTMLElement, private rowHeight?: number) {}

  public scrollTo(position: number) {
    const scrollElement = this.scrollElement(position);
    if (scrollElement === null) return;
    const offset = this.offset();
    if (offset > 0) {
      const block = this.getScrollBlock(scrollElement, offset);
      if (block) scrollElement.scrollIntoView({ block });
    } else {
      scrollElement.scrollIntoView({ block: 'nearest' });
    }
  }

  private getScrollBlock(el: HTMLElement, offset: number) {
    const top = el.offsetTop;
    const height = el.offsetHeight;
    const listElementRect = this.listElement.getBoundingClientRect();
    const stElementRect = this.scrollTarget.getBoundingClientRect();

    if (offset - listElementRect.top !== 0 && top < -listElementRect.top + stElementRect.height / 2) {
      return 'center';
    }

    if (top + height > -listElementRect.top + stElementRect.height) {
      return 'end';
    }

    return null;
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
