import { KeyboardEvent, useCallback, WheelEvent } from 'react';
import { ACTIONS, DispatchProp, isEnterKey, isEscapeKey, isFocus, isUpDownKey, SearchType, Store, StoreRef } from '..';

export type ToolbarActions = {
  searchBarFocus: 'SEARCH_BAR_FOCUS_ACTION';
  searchBarBlur: 'SEARCH_BAR_BLUR_ACTION';
  searchBarChange: 'SEARCH_BAR_CHANGE_ACTION';
  searchBarValueChange: 'SEARCH_BAR_VALUE_CHANGE_ACTION';
  searchBarKeyDown: 'SEARCH_BAR_KEYDOWN_ACTION';
  searchBarEnterKeyDown: 'SEARCH_BAR_ENTER_KEY_DOWN_ACTION';
  searchBarEscapeKeyDown: 'SEARCH_BAR_ESCAPE_KEY_DOWN_ACTION';
  searchBarArrowKeyDown: 'SEARCH_BAR_ARROW_KEY_DOWN_ACTION';
  searchBarWheel: 'SEARCH_BAR_WHEEL_ACTION';
  selectedSearchIndexChange: 'SELECTED_SEARCH_INDEX_CHANGE_ACTION';
  searchClear: 'SEARCH_CLEAR_ACTION';
  searchTypeChange: 'SEARCH_TYPE_CHANGE_ACTION';
  cursorIndexChange: 'CURSOR_INDEX_CHANGE_ACTION';
  cursorClear: 'CURSOR_CLEAR_ACTION';
  historyAddValue: 'HISTORY_ADD_VALUE_ACTION';
  historyIndexChange: 'HISTORY_INDEX_CHANGE_ACTION';
  locationShare: 'LOCATION_SHARE_ACTION';
  locationLoaded: 'LOCATION_LOADED_ACTION';
  fullscreenToggle: 'FULLSCREEN_TOGGLE_ACTION';
};

export const TOOLBAR_ACTIONS: ToolbarActions = {
  searchBarFocus: 'SEARCH_BAR_FOCUS_ACTION',
  searchBarBlur: 'SEARCH_BAR_BLUR_ACTION',
  searchBarChange: 'SEARCH_BAR_CHANGE_ACTION',
  searchBarValueChange: 'SEARCH_BAR_VALUE_CHANGE_ACTION',
  searchBarKeyDown: 'SEARCH_BAR_KEYDOWN_ACTION',
  searchBarEnterKeyDown: 'SEARCH_BAR_ENTER_KEY_DOWN_ACTION',
  searchBarEscapeKeyDown: 'SEARCH_BAR_ESCAPE_KEY_DOWN_ACTION',
  searchBarArrowKeyDown: 'SEARCH_BAR_ARROW_KEY_DOWN_ACTION',
  searchBarWheel: 'SEARCH_BAR_WHEEL_ACTION',
  selectedSearchIndexChange: 'SELECTED_SEARCH_INDEX_CHANGE_ACTION',
  searchClear: 'SEARCH_CLEAR_ACTION',
  searchTypeChange: 'SEARCH_TYPE_CHANGE_ACTION',
  cursorIndexChange: 'CURSOR_INDEX_CHANGE_ACTION',
  cursorClear: 'CURSOR_CLEAR_ACTION',
  historyAddValue: 'HISTORY_ADD_VALUE_ACTION',
  historyIndexChange: 'HISTORY_INDEX_CHANGE_ACTION',
  locationShare: 'LOCATION_SHARE_ACTION',
  locationLoaded: 'LOCATION_LOADED_ACTION',
  fullscreenToggle: 'FULLSCREEN_TOGGLE_ACTION'
} as ToolbarActions;

export type ToolbarActionProps = {
  onSearchBarValueChange: (inputValue: string) => void;
  onSearchBarInputChange: (inputValue: string) => void;
  onSearchBarFocus: () => void;
  onSearchBarBlur: () => void;
  onSearchBarChange: (value: string) => void;
  onSearchBarWheel: (event: WheelEvent) => void;
  onSelectedSearchIndexChange: (index: number) => void;
  onCursorIndexChange: (index: number) => void;
  onCursorClear: () => void;
  onSearchTypeChange: (type: SearchType) => void;
  onSearchClear: () => void;
  onLocationShare: () => void;
  onLocationLoaded: () => void;
  onSearchBarKeyDown: (event: KeyboardEvent<HTMLDivElement> | any, store: Store, refs: StoreRef) => void;
  onFullscreenToggle: () => void;
};

export const useToolbarAction = (dispatch: DispatchProp): ToolbarActionProps => {
  const onSearchBarKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement> | any, store: Store, refs: StoreRef) => {
      if (!isFocus.toolbar(store) || !(isEnterKey(event) || isUpDownKey(event) || isEscapeKey(event))) return;
      event.preventDefault();

      if (isEnterKey(event)) dispatch(ACTIONS.searchBarEnterKeyDown, { event });
      else if (isUpDownKey(event) && store.history.values.length > 0)
        dispatch(ACTIONS.searchBarArrowKeyDown, { event });
      else if (isEscapeKey(event)) dispatch(ACTIONS.searchBarEscapeKeyDown, { event }, true, false);
    },
    [dispatch]
  );

  const onSearchBarFocus = useCallback(() => dispatch(ACTIONS.searchBarFocus, null), [dispatch]);

  const onSearchBarBlur = useCallback(() => dispatch(ACTIONS.searchBarBlur, null), [dispatch]);

  const onSearchBarChange = useCallback((value: string) => dispatch(ACTIONS.searchBarChange, { value }), [dispatch]);

  const onSearchBarValueChange = useCallback(
    (inputValue: string) => dispatch(ACTIONS.searchBarValueChange, { inputValue }),
    [dispatch]
  );

  const onSearchBarInputChange = useCallback(
    (inputValue: string) => dispatch(ACTIONS.searchBarValueChange, { inputValue }),
    [dispatch]
  );

  const onSelectedSearchIndexChange = useCallback(
    (index: number) => dispatch(ACTIONS.selectedSearchIndexChange, { index }),
    [dispatch]
  );

  const onSearchTypeChange = useCallback(
    (type: SearchType) => dispatch(ACTIONS.searchTypeChange, { type }),
    [dispatch]
  );

  const onSearchClear = useCallback(() => dispatch(ACTIONS.searchClear, null), [dispatch]);

  const onSearchBarWheel = useCallback((event: WheelEvent) => dispatch(ACTIONS.searchBarWheel, { event }), [dispatch]);

  const onCursorIndexChange = useCallback(
    (index: number) => dispatch(ACTIONS.cursorIndexChange, { index }),
    [dispatch]
  );

  const onCursorClear = useCallback(() => dispatch(ACTIONS.cursorClear, null), [dispatch]);

  const onLocationShare = useCallback(() => dispatch(ACTIONS.locationShare, null), [dispatch]);

  const onLocationLoaded = useCallback(() => dispatch(ACTIONS.locationLoaded, null), [dispatch]);

  const onFullscreenToggle = useCallback(() => dispatch(ACTIONS.fullscreenToggle, null), [dispatch]);

  return {
    onSearchBarValueChange,
    onSearchBarInputChange,
    onSearchBarFocus,
    onSelectedSearchIndexChange,
    onSearchBarBlur,
    onSearchBarChange,
    onSearchBarKeyDown,
    onSearchBarWheel,
    onCursorIndexChange,
    onCursorClear,
    onSearchTypeChange,
    onSearchClear,
    onLocationShare,
    onLocationLoaded,
    onFullscreenToggle
  };
};
