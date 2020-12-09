import ListScroller from './ListScroller';

function elementInViewport(el, offset, listElement) {
  const top = el.offsetTop;
  const height = el.offsetHeight;
  const listElementRect = listElement.getBoundingClientRect();

  return top >= -listElementRect.top + offset && top + height <= -listElementRect.top + window.innerHeight;
}

export default class SimpleListScroller implements ListScroller {
  constructor(private scrollTarget: HTMLElement, private listElement: HTMLElement, private rowHeight?: number) {}

  public scrollTo(position: number) {
    const scrollElement = this.scrollElement(position);
    const offset = this.offset();
    if (offset > 0 && !elementInViewport(scrollElement, offset, this.listElement)) {
      scrollElement.scrollIntoView({ block: 'end' });
    } else {
      scrollElement.scrollIntoView({ block: 'nearest' });
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
