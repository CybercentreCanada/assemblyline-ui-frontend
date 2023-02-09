import { useMemo } from 'react';
import Throttler from '../../utils/throttler';

const THROTTLER = new Throttler(10);

export const LIST_SELECT_EVENTNAME = 'mui.elements.list.cursor.set';
export const LIST_SELECT_NEXT_EVENTNAME = 'mui.elements.list.cursor.next';
export const LIST_SELECT_PREVIOUS_EVENTNAME = 'mui.elements.list.cursor.previous';

export default function useListNavigator(listId: string) {
  return useMemo(
    () => ({
      select: (cursor: number) => {
        THROTTLER.throttle(() =>
          window.dispatchEvent(new CustomEvent(`${LIST_SELECT_EVENTNAME}.${listId}`, { detail: { cursor } }))
        );
      },
      selectNext: () => {
        THROTTLER.throttle(() => window.dispatchEvent(new CustomEvent(`${LIST_SELECT_NEXT_EVENTNAME}.${listId}`)));
      },
      selectPrevious: () => {
        THROTTLER.throttle(() => window.dispatchEvent(new CustomEvent(`${LIST_SELECT_PREVIOUS_EVENTNAME}.${listId}`)));
      },
      register: handlers => {
        window.addEventListener(`${LIST_SELECT_EVENTNAME}.${listId}`, handlers.onSelect);
        window.addEventListener(`${LIST_SELECT_NEXT_EVENTNAME}.${listId}`, handlers.onSelectNext);
        window.addEventListener(`${LIST_SELECT_PREVIOUS_EVENTNAME}.${listId}`, handlers.onSelectPrevious);
        return () => {
          window.removeEventListener(`${LIST_SELECT_EVENTNAME}.${listId}`, handlers.onSelect);
          window.removeEventListener(`${LIST_SELECT_NEXT_EVENTNAME}.${listId}`, handlers.onSelectNext);
          window.removeEventListener(`${LIST_SELECT_PREVIOUS_EVENTNAME}.${listId}`, handlers.onSelectPrevious);
        };
      }
    }),
    [listId]
  );
}
