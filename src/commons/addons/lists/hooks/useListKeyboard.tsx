import ListScroller from 'commons/addons/elements/lists/scrollers/ListScroller';
import { isArrowDown, isArrowUp, isEnter, isEscape } from 'commons/addons/elements/utils/keyboard';
import Throttler from 'commons/addons/elements/utils/throttler';
import { useCallback, useEffect, useMemo, useState } from 'react';

//
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
  autofocus?: boolean;
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
  autofocus,
  onCursorChange,
  onEscape,
  onEnter
}: UseListKeyboard): UsingListKeyboard {
  // Cursor state.
  const [cursor, setCursor] = useState<number>(-1);

  // Update the cursor state and invoke callback if provided.
  const updateState = useCallback(
    (nextCursor: number) => {
      setCursor(nextCursor);
      scroller.scrollTo(nextCursor);
      if (onCursorChange) {
        onCursorChange(nextCursor);
      }
    },
    [scroller, onCursorChange]
  );

  // decrement cursor by one.
  const next = useCallback(() => {
    const nextCursor = cursor + 1 < count || infinite ? cursor + 1 : 0;
    updateState(nextCursor);
  }, [count, cursor, infinite, updateState]);

  // increment cursor by one.
  const previous = useCallback(() => {
    const nextCursor = cursor - 1 > -1 ? cursor - 1 : infinite ? 0 : count - 1;
    updateState(nextCursor);
  }, [count, cursor, infinite, updateState]);

  // hander:keydown
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
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
              setCursor(-1);
              if (onEscape) {
                onEscape(-1);
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
    },
    [cursor, next, previous, pause, onEnter, onEscape]
  );

  // Try autofocusing if specified.
  useEffect(() => {
    if (autofocus && id) {
      document.getElementById(id).focus();
    }
  }, [id, autofocus]);

  // Memoize returned object.
  return useMemo(
    () => ({ cursor, setCursor, next, previous, onKeyDown }),
    [cursor, setCursor, next, previous, onKeyDown]
  );
}
