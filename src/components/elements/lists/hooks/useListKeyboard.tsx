import { isArrowDown, isArrowUp, isEnter, isEscape } from 'components/elements/utils/keyboard';
import Throttler from 'components/elements/utils/throttler';
import { useState } from 'react';

const THROTTLER = new Throttler(10);

// Ensure the list element at specified position is into view.
const selectionScroller = (target: HTMLElement, position: number, rowHeight: number) => {
  // We take care of all scrolling. [impl. is same has same behaviour as 'block:nearest'].

  const scrollToEl = target.querySelector(`[data-listitem-position="${position}"]`);
  const { top: targetTop, bottom: targetBottom, height: targetHeight } = target.getBoundingClientRect();

  // We compute the scrolling factor based on whether the next element to scroll to is already render
  //  in the DOM.
  if (scrollToEl) {
    // If there's already an element rendered we use that to compute srolling factor.
    const { top: nextTop, bottom: nextBottom, height: nextHeight } = scrollToEl.getBoundingClientRect();

    if (nextTop < targetTop) {
      // going up.
      const scrollBy = nextTop - targetTop;
      // console.log(`scrollBy: ${scrollBy}`);
      target.scrollBy({ top: scrollBy });
    } else if (nextTop + nextHeight > targetBottom) {
      // going down.
      const scrollBy = nextBottom - targetBottom;
      // console.log(`scrollBy: ${scrollBy}`);
      target.scrollBy({ top: scrollBy });
    }
  } else {
    // If the next element isn't already rendered then we fallback on the specified rowHeight.
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
  next: () => void;
  previous: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

// Specification interface to configure custom hook.
interface UseListKeyboard {
  id: string;
  count: number;
  infinite?: boolean;
  rowHeight?: number;
  scrollElementId?: string;
  onCursorChange?: (cursor: number) => void;
  onEscape?: (cursor: number) => void;
  onEnter?: (cursor: number) => void;
}

export default function useListKeyboard({
  id,
  count,
  infinite,
  rowHeight,
  scrollElementId,
  onCursorChange,
  onEscape,
  onEnter
}: UseListKeyboard): UsingListKeyboard {
  // Cursor state.
  const [cursor, setCursor] = useState<number>(0);

  // Update the cursor state and invoke callback if provided.
  const updateState = (nextCursor: number, target: HTMLDivElement) => {
    const scrollTarget = scrollElementId ? document.getElementById(scrollElementId) : target;
    setCursor(nextCursor);
    selectionScroller(scrollTarget, nextCursor, rowHeight);
    if (onCursorChange) {
      onCursorChange(nextCursor);
    }
  };

  //
  const next = (currentTarget = null) => {
    const _target = currentTarget || document.getElementById(id);
    const nextCursor = cursor + 1 < count || infinite ? cursor + 1 : 0;
    updateState(nextCursor, _target);
  };

  //
  const previous = (currentTarget = null) => {
    const _target = currentTarget || document.getElementById(id);
    const nextCursor = cursor - 1 > -1 ? cursor - 1 : infinite ? 0 : count - 1;
    updateState(nextCursor, _target);
  };

  // hander:keydown
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // What key was hit?
    const { key, currentTarget } = event;

    // Check to see if we should schedule throttled event.
    const accepts = isEnter(key) || isEscape(key) || isArrowUp(key) || isArrowDown(key);

    if (accepts) {
      // Prevent default behaviors.
      event.preventDefault();
      // Only run events after 10ms after receiving last one.
      THROTTLER.throttle(() => {
        // Handle each keys.
        if (isEnter(key)) {
          // key[ENTER ]: handler
          if (onEnter) {
            onEnter(cursor);
          }
        } else if (isEscape(key)) {
          // key[ESCAPE]: handler
          if (onEscape) {
            onEscape(cursor);
          }
        } else if (isArrowUp(key)) {
          // key[ARROW_UP]: handler
          previous(currentTarget);
          // const nextCursor = cursor - 1 > -1 ? cursor - 1 : infinite ? 0 : count - 1;
          // updateState(nextCursor, currentTarget);
        } else if (isArrowDown(key)) {
          // key[ARROW_DOWN]: handler
          next(currentTarget);
          // const nextCursor = cursor + 1 < count || infinite ? cursor + 1 : 0;
          // updateState(nextCursor, currentTarget);
        }
      });
    }
  };

  return { cursor, setCursor, next, previous, onKeyDown };
}
