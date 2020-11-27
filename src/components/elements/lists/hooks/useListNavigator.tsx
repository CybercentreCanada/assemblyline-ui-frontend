export const LIST_SELECT_EVENTNAME = 'mui.elements.list.cursor.set';
export const LIST_SELECT_NEXT_EVENTNAME = 'mui.elements.list.cursor.next';
export const LIST_SELECT_PREVIOUS_EVENTNAME = 'mui.elements.list.cursor.previous';

interface UsingList {
  select: (index: number) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  register: (handers: { onSelect; onSelectNext; onSelectPrevious }) => void;
}

export default function useList(listId: string): UsingList {
  const select = (cursor: number) => {
    window.dispatchEvent(new CustomEvent(`${LIST_SELECT_EVENTNAME}.${listId}`, { detail: { cursor } }));
  };
  const selectNext = () => {
    window.dispatchEvent(new CustomEvent(`${LIST_SELECT_NEXT_EVENTNAME}.${listId}`));
  };
  const selectPrevious = () => {
    window.dispatchEvent(new CustomEvent(`${LIST_SELECT_PREVIOUS_EVENTNAME}.${listId}`));
  };

  const register = handlers => {
    window.addEventListener(`${LIST_SELECT_EVENTNAME}.${listId}`, handlers.onSelect);
    window.addEventListener(`${LIST_SELECT_NEXT_EVENTNAME}.${listId}`, handlers.onSelectNext);
    window.addEventListener(`${LIST_SELECT_PREVIOUS_EVENTNAME}.${listId}`, handlers.onSelectPrevious);
    return () => {
      window.removeEventListener(`${LIST_SELECT_EVENTNAME}.${listId}`, handlers.onSelect);
      window.removeEventListener(`${LIST_SELECT_NEXT_EVENTNAME}.${listId}`, handlers.onSelectNext);
      window.removeEventListener(`${LIST_SELECT_PREVIOUS_EVENTNAME}.${listId}`, handlers.onSelectPrevious);
    };
  };

  return { select, selectNext, selectPrevious, register };
}
