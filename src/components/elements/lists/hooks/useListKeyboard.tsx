import { isArrowDown, isArrowUp, isEnter, isEscape } from 'components/elements/utils/keyboard';
import Throttler from 'components/elements/utils/throttler';
import { useState } from 'react';

const THROTTLER = new Throttler(10);

// Ensure the list element at specified position is into view.
const selectionScroller = (target: HTMLDivElement, position: number, rowHeight?: number) => {
  const scrollToEl = target.querySelector(`[data-listitem-position="${position}"]`);
  if (scrollToEl) {
    scrollToEl.scrollIntoView({ block: 'nearest' });
  } else {
    // Items might not be rendered yet because of we might have only rendered what's
    //  within visual range. e.g. metalist.
    // Compute scrollby relative to current position.
    const sT = target.scrollTop;
    const tP = position * rowHeight;
    const scrollBy = tP - sT;
    if (scrollBy !== 0) {
      target.scrollBy({ top: scrollBy });
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
    THROTTLER.delay(() => {
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
        const nextCursor = cursor + 1 < count ? cursor + 1 : infinite ? cursor : 0;
        setCursor(nextCursor);
        selectionScroller(currentTarget, nextCursor, rowHeight);
      }
    });
  };

  return { cursor, setCursor, onKeyDown };
}
