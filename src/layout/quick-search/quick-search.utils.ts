import type { QuickSearchItem } from 'layout/quick-search/quick-search.models';
import type { KeyboardEvent } from 'react';

const RESULT_LIST_ID = 'quicksearch-result';

// TODO: replace with a real search API call once one exists.
export const fetchQuickSearchItems = async (value: string): Promise<QuickSearchItem[]> => {
  if (!value.trim()) return [];
  return [];
};

// Minimal keyboard-event parsing kept local, so this component has no external key-parsing dependency.
export const parseQuickSearchKeyEvent = (event: KeyboardEvent<HTMLElement> | globalThis.KeyboardEvent) => ({
  isCtrl: event.ctrlKey,
  isEnter: event.key === 'Enter',
  isEscape: event.key === 'Escape',
  isTab: event.key === 'Tab',
  isArrowDown: event.key === 'ArrowDown'
});

export { RESULT_LIST_ID };
