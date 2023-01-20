import ListScroller from 'commons_deprecated/addons/elements/lists/scrollers/ListScroller';
import { isArrowDown, isArrowUp, isEnter, isEscape } from 'commons_deprecated/addons/elements/utils/keyboard';
import Throttler from 'commons_deprecated/addons/elements/utils/throttler';
import { useState } from 'react';

const THROTTLER = new Throttler(10);

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
  scroller: ListScroller;
  pause?: boolean;
  onCursorChange?: (cursor: number) => void;
  onEscape?: (cursor: number) => void;
  onEnter?: (cursor: number) => void;
}

export default function useListKeyboard({
  id,
  count,
  infinite,
  scroller,
  pause,
  onCursorChange,
  onEscape,
  onEnter
}: UseListKeyboard): UsingListKeyboard {
  // Cursor state.
  const [cursor, setCursor] = useState<number>(0);

  // Update the cursor state and invoke callback if provided.
  const updateState = (nextCursor: number) => {
    setCursor(nextCursor);
    scroller.scrollTo(nextCursor);
    if (onCursorChange) {
      onCursorChange(nextCursor);
    }
  };

  // decrement cursor by one.
  const next = () => {
    const nextCursor = cursor + 1 < count || infinite ? cursor + 1 : 0;
    updateState(nextCursor);
  };

  // increment cursor by one.
  const previous = () => {
    const nextCursor = cursor - 1 > -1 ? cursor - 1 : infinite ? 0 : count - 1;
    updateState(nextCursor);
  };

  // hander:keydown
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!pause) {
      // What key was hit?
      const { key } = event;

      // Check to see if we should schedule throttled event.
      const accepts = isEnter(key) || isEscape(key) || isArrowUp(key) || isArrowDown(key);

      // do we care?
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
            previous();
          } else if (isArrowDown(key)) {
            // key[ARROW_DOWN]: handler
            next();
          }
        });
      }
    }
  };

  return { cursor, setCursor, next, previous, onKeyDown };
}
