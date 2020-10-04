import { isArrowDown, isArrowUp, isEnter, isEscape } from 'components/elements/utils/keyboard';
import Throttler from 'components/elements/utils/throttler';
import { useState } from 'react';

const THROTTLER = new Throttler(10);

// Ensure the list element at specified position is into view.
const selectionScroller = (target: HTMLDivElement, position: number, rowHeight: number) => {
  // We take care of all scrolling. [impl. is same has same behaviour as 'block:nearest'].

  const scrollToEl = target.querySelector(`[data-listitem-position="${position}"]`);
  const { top: targetTop, bottom: targetBottom, height: targetHeight } = target.getBoundingClientRect();

  // We compute the scrolling factor based on whether the next element to scroll to is already render
  //  in the DOM.
  if (scrollToEl) {
    // If there's already an element rendered we use that to compute srolling factor.
    const { top: nextTop, bottom: nextBottom, height: nextHeight } = scrollToEl.getBoundingClientRect();
    if (nextTop < targetTop) {
      const scrollBy = nextTop - targetTop;
      target.scrollBy({ top: scrollBy });
    } else if (nextTop + nextHeight > targetBottom) {
      const scrollBy = nextBottom - targetBottom;
      target.scrollBy({ top: scrollBy });
    }
  } else {
    // If the next element isn't already rnedered then we fallback on the specified rowHeight.
    const frameTop = target.scrollTop;
    const frameBottom = frameTop + targetHeight;
    const top = position * rowHeight;
    const bottom = top + rowHeight;
    if (top < frameTop) {
      target.scrollBy({ top: top - frameTop });
    } else if (bottom > frameBottom) {
      target.scrollBy({ top: bottom - frameBottom });
    }
  }
};

// Specification interface return by custom hook
interface UsingListKeyboard {
  cursor: number;
  setCursor: (cursor: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

// Specification interface to configure custom hook.
interface UseListKeyboard {
  count: number;
  infinite?: boolean;
  rowHeight?: number;
  onEscape?: (cursor: number) => void;
  onEnter?: (cursor: number) => void;
}

export default function useListKeyboard({
  count,
  infinite,
  rowHeight,
  onEscape,
  onEnter
}: UseListKeyboard): UsingListKeyboard {
  const [cursor, setCursor] = useState<number>(0);

  // hander:keydown
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent default behaviors.
    event.preventDefault();

    // What key was hit?
    const { key, currentTarget } = event;

    // Only run events after 10ms after receiving last one.
    THROTTLER.throttle(() => {
      // Handle each keys.
      if (isEnter(key)) {
        // key[ENTER ]: handler
        onEnter(cursor);
      } else if (isEscape(key)) {
        // key[ESCAPE]: handler
        onEscape(cursor);
      } else if (isArrowUp(key)) {
        // key[ARROW_UP]: handler
        const nextCursor = cursor - 1 > -1 ? cursor - 1 : infinite ? 0 : count - 1;
        setCursor(nextCursor);
        selectionScroller(currentTarget, nextCursor, rowHeight);
      } else if (isArrowDown(key)) {
        // key[ARROW_DOWN]: handler
        const nextCursor = cursor + 1 < count || infinite ? cursor + 1 : 0;
        setCursor(nextCursor);
        selectionScroller(currentTarget, nextCursor, rowHeight);
      }
    });
  };

  return { cursor, setCursor, onKeyDown };
}
