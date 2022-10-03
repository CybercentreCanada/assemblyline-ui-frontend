import { useCallback, WheelEvent } from 'react';
import {
  ACTIONS,
  ActionTypesConfig,
  Dispatch,
  DispatchersConfig,
  isEnterKey,
  isEscapeKey,
  isType,
  isUpDownKey,
  SearchType,
  Store
} from '..';

type KE = React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement> | any;

export type ToolbarAction =
  | { type: 'searchBarFocus'; payload: void }
  | { type: 'searchBarBlur'; payload: void }
  | { type: 'searchBarChange'; payload: { value: string } }
  | { type: 'searchBarValueChange'; payload: { value: string } }
  | { type: 'searchBarInputChange'; payload: { inputValue: string } }
  | { type: 'searchBarKeyDown'; payload: { event: KE }; guard: { store: Store } }
  | { type: 'searchBarEnterKeyDown'; payload: { event: KE | any }; guard: { store: Store } }
  | { type: 'searchBarEscapeKeyDown'; payload: { event: KE }; guard: { store: Store }; tracked: true; repeat: false }
  | { type: 'searchBarArrowKeyDown'; payload: { event: KE }; guard: { store: Store } }
  | { type: 'searchBarWheel'; payload: { event: WheelEvent } }
  | { type: 'selectedSearchIndexChange'; payload: { index: number } }
  | { type: 'searchClear'; payload: void }
  | { type: 'searchTypeChange'; payload: { type: SearchType } }
  | { type: 'cursorIndexChange'; payload: { index: number } }
  | { type: 'cursorClear'; payload: void }
  | { type: 'historyAddValue'; payload: null }
  | { type: 'historyIndexChange'; payload: null }
  | { type: 'locationShare'; payload: void }
  | { type: 'locationLoaded'; payload: void }
  | { type: 'fullscreenToggle'; payload: void };

export type ToolbarActionTypes = ActionTypesConfig<ToolbarAction>;
export type ToolbarDispatchers = DispatchersConfig<ToolbarAction>;

export const TOOLBAR_ACTION_TYPES: ToolbarActionTypes = {
  searchBarFocus: 'SearchBarFocus_Action',
  searchBarBlur: 'SearchBarBlur_Action',
  searchBarChange: 'SearchBarChange_Action',
  searchBarValueChange: 'SearchBarValueChange_Action',
  searchBarKeyDown: 'SearchBarKeyDown_Action',
  searchBarEnterKeyDown: 'SearchBarEnterKeyDown_Action',
  searchBarEscapeKeyDown: 'SearchBarEscapeKeyDown_Action',
  searchBarArrowKeyDown: 'SearchBarArrowKeyDown_Action',
  searchBarWheel: 'SearchBarWheel_Action',
  selectedSearchIndexChange: 'SelectedSearchIndexChange_Action',
  searchClear: 'SearchClear_Action',
  searchTypeChange: 'SearchTypeChange_Action',
  cursorIndexChange: 'CursorIndexChange_Action',
  cursorClear: 'CursorClear_Action',
  historyAddValue: 'HistoryAddValue_Action',
  historyIndexChange: 'HistoryIndexChange_Action',
  locationShare: 'LocationShare_Action',
  locationLoaded: 'LocationLoaded_Action',
  fullscreenToggle: 'FullscreenToggle_Action'
} as ToolbarActionTypes;

export const useToolbarDispatcher = (dispatch: Dispatch): ToolbarDispatchers => {
  const onSearchBarKeyDown: ToolbarDispatchers['onSearchBarKeyDown'] = useCallback(
    ({ event }, { store }) => {
      if (
        !isType.layout.isFocusing(store, 'toolbar') ||
        !(isEnterKey(event) || isUpDownKey(event) || isEscapeKey(event))
      )
        return;
      event.preventDefault();

      if (isEnterKey(event)) dispatch({ type: ACTIONS.searchBarEnterKeyDown, payload: { event } });
      else if (isUpDownKey(event) && store.history.values.length > 0)
        dispatch({ type: ACTIONS.searchBarArrowKeyDown, payload: { event } });
      else if (isEscapeKey(event))
        dispatch({ type: ACTIONS.searchBarEscapeKeyDown, payload: { event }, tracked: true, repeat: false });
    },
    [dispatch]
  );

  const onSearchBarEnterKeyDown: ToolbarDispatchers['onSearchBarEnterKeyDown'] = useCallback(
    ({ event }, { store }) => {
      if (!isType.layout.isFocusing(store, 'toolbar') || !isEnterKey(event)) return;
      event.preventDefault();
      dispatch({ type: ACTIONS.searchBarEnterKeyDown, payload: { event } });
    },
    [dispatch]
  );

  const onSearchBarArrowKeyDown: ToolbarDispatchers['onSearchBarArrowKeyDown'] = useCallback(
    ({ event }, { store }) => {
      if (!isType.layout.isFocusing(store, 'toolbar') || !isUpDownKey(event)) return;
      event.preventDefault();
      dispatch({ type: ACTIONS.searchBarArrowKeyDown, payload: { event } });
    },
    [dispatch]
  );

  const onSearchBarEscapeKeyDown: ToolbarDispatchers['onSearchBarEscapeKeyDown'] = useCallback(
    ({ event }, { store }) => {
      if (!isType.layout.isFocusing(store, 'toolbar') || !isEscapeKey(event)) return;
      event.preventDefault();
      dispatch({ type: ACTIONS.searchBarEscapeKeyDown, payload: { event }, tracked: true, repeat: false });
    },
    [dispatch]
  );

  return {
    onSearchBarEnterKeyDown,
    onSearchBarArrowKeyDown,
    onSearchBarEscapeKeyDown,
    onSearchBarValueChange: payload => dispatch({ type: ACTIONS.searchBarValueChange, payload }),
    onSearchBarInputChange: payload => dispatch({ type: ACTIONS.searchBarInputChange, payload }),
    onSearchBarFocus: payload => dispatch({ type: ACTIONS.searchBarFocus, payload }),
    onSelectedSearchIndexChange: payload => dispatch({ type: ACTIONS.selectedSearchIndexChange, payload }),
    onSearchBarBlur: payload => dispatch({ type: ACTIONS.searchBarBlur, payload }),
    onSearchBarChange: payload => dispatch({ type: ACTIONS.searchBarChange, payload }),
    onSearchBarWheel: payload => dispatch({ type: ACTIONS.searchBarWheel, payload }),
    onCursorIndexChange: payload => dispatch({ type: ACTIONS.cursorIndexChange, payload }),
    onCursorClear: payload => dispatch({ type: ACTIONS.cursorClear, payload }),
    onSearchTypeChange: payload => dispatch({ type: ACTIONS.searchTypeChange, payload }),
    onSearchClear: payload => dispatch({ type: ACTIONS.searchClear, payload }),
    onLocationShare: payload => dispatch({ type: ACTIONS.locationShare, payload }),
    onLocationLoaded: payload => dispatch({ type: ACTIONS.locationLoaded, payload }),
    onFullscreenToggle: payload => dispatch({ type: ACTIONS.fullscreenToggle, payload }),
    onSearchBarKeyDown,
    onHistoryAddValue: payload => dispatch({ type: ACTIONS.historyAddValue, payload }),
    onHistoryIndexChange: payload => dispatch({ type: ACTIONS.historyIndexChange, payload })
  };
};
