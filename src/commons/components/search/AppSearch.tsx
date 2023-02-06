import { Search } from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  Dialog,
  DialogContent,
  DialogTitle,
  emphasize,
  IconButton,
  Popper,
  Slide,
  styled,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';

import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import { parseEvent } from 'commons/components/utils/keyboard';
import { ChangeEvent, forwardRef, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppSearchService from '../app/hooks/useAppSearchService';
import AppSearchInput from './AppSearchInput';
import AppSearchResult from './AppSearchResult';

const MENU_LIST_SX = { maxHeight: 500, overflow: 'auto' };

const AppSearchRoot = styled(Box, { shouldForwardProp: prop => prop !== 'menuOpen' })<{ menuOpen: boolean }>(
  ({ theme, menuOpen }) => {
    const backgroundColor = emphasize(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.1 : 0.033);
    return {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      '.app-search-input': {
        backgroundColor: backgroundColor,
        boxShadow: menuOpen && theme.shadows[4]
      },
      '.app-search-result': {
        backgroundColor: theme.palette.mode === 'dark' ? backgroundColor : theme.palette.background.default,
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
        boxShadow: menuOpen && theme.shadows[4],
        color: theme.palette.text.primary
      }
    };
  }
);

const ModalTransition = forwardRef(function Transition(props: any, ref: any) {
  const { children, ..._props } = props;
  return (
    <Slide direction="down" ref={ref} {..._props}>
      {children}
    </Slide>
  );
});

export default function AppSearch() {
  const theme = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const isPhoneMode = useMediaQuery(theme.breakpoints.only('xs'));
  const isTabletMode = useMediaQuery(theme.breakpoints.only('sm'));
  const { t } = useTranslation();
  const { provided, state, service } = useAppSearchService();
  const [value, setValue] = useState<string>('');

  useEffectOnce(() => {
    if (service.onMounted) {
      service.onMounted(setValue, state);
    }
  });

  // keyboard[window] handler.
  // this is to trigger the CTLR+K shortcut to appsearch.
  useEffect(() => {
    const keyHandler = event => {
      const { key, isCtrl } = parseEvent(event);
      if (isCtrl && key === 'k') {
        event.preventDefault();
        const inputRef = menuRef.current.querySelector('input');
        if (!inputRef || isPhoneMode) {
          state.set({ ...state, menu: state.menu || isPhoneMode, mode: 'fullscreen' });
        } else {
          inputRef.focus();
        }
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, [provided, isPhoneMode, state]);

  // Search input focus handler.
  const onFocus = useCallback(() => {
    //state.setMenu(!!state?.items && state.items.length > 0);
    state.set({ ...state, menu: true });
  }, [state]);

  // Search input change handler.
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.value);
      if (service.onChange) {
        service.onChange(event.currentTarget.value, state, setValue);
      }
    },
    [service, state]
  );

  // keyboard[ENTER] handler.
  const onEnter = useCallback(() => {
    if (service.onEnter) {
      if (state.autoReset) {
        const inputRef = menuRef.current.querySelector('input');
        if (inputRef) {
          inputRef.blur();
        }
        state.set({ ...state, menu: false, mode: 'inline' });
        setValue('');
      } else {
        state.set({ ...state, menu: true });
      }
      service.onEnter(value, state);
    }
  }, [value, state, service]);

  // Keyboard handler.
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const { isEnter, isEscape, isArrowDown } = parseEvent(event);
      if (isEnter) {
        onEnter();
      } else if (isEscape) {
        state.set({ ...state, menu: !state.menu });
      } else if (isArrowDown) {
        const result = document.querySelector('[data-tui-id="tui-app-search-result"]') as HTMLElement;
        if (result) {
          // Prevent scolling before menu list gets focus.
          // Doing this prevents the menu list from scrolling down
          //  and then back up on second arrow down.
          event.preventDefault(); // prevent native scroll.
          result.focus();
        }
      }
    },
    [state, onEnter]
  );

  // Clear search input handler.
  const onClear = useCallback(() => {
    setValue('');
    state.set({ ...state, items: null });
  }, [state]);

  // Fullscreen modal toggle handler.
  const onToggleFullscreen = useCallback(() => {
    state.set({
      ...state,
      menu: state.menu || isPhoneMode,
      mode: state.mode === 'inline' ? 'fullscreen' : 'inline'
    });
  }, [isPhoneMode, state]);

  return (
    <ClickAwayListener onClickAway={() => state.set({ ...state, menu: false })}>
      <AppSearchRoot
        ref={menuRef}
        sx={{ mr: !isPhoneMode && 1, display: 'flex', flexGrow: 1, justifyContent: 'flex-end' }}
        menuOpen={state.menu}
      >
        {isPhoneMode ? (
          <IconButton color="inherit" size="large" onClick={onToggleFullscreen}>
            <Tooltip title={t('app.search.fullscreen')}>
              <Search />
            </Tooltip>
          </IconButton>
        ) : (
          <>
            <AppSearchInput
              autoFocus={false}
              showToggle
              provided={provided}
              className="app-search-input"
              value={value}
              searching={state.searching}
              open={state.menu}
              onFocus={onFocus}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onClear={onClear}
              minWidth={isTabletMode ? '100%' : '250px'}
              maxWidth={isTabletMode ? '100%' : '350px'}
            />
            {provided && (
              <Popper
                open={state.menu && state.mode === 'inline'}
                anchorEl={menuRef.current}
                placement="bottom-end"
                sx={_theme => ({ width: '100%', zIndex: _theme.zIndex.appBar + 1 })}
                disablePortal
              >
                <AppSearchResult className="app-search-result" sx={MENU_LIST_SX} />
              </Popper>
            )}
          </>
        )}
        <Dialog
          disableRestoreFocus
          fullWidth
          maxWidth="md"
          TransitionComponent={ModalTransition}
          open={state.menu && state.mode === 'fullscreen'}
          onClose={() => state.set({ ...state, mode: 'inline', menu: false })}
          sx={{
            maxHeight: '75%',
            margin: 0,
            '.MuiDialog-container': {
              alignItems: 'start'
            }
          }}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              margin: 0,
              width: '100%'
            }
          }}
        >
          <DialogTitle
            sx={{
              padding: theme.spacing(1, 1.5)
            }}
          >
            <AppSearchInput
              autoFocus
              className="app-search-input"
              style={{ backgroundColor: emphasize(theme.palette.background.default, 0.1) }}
              showToggle={false}
              value={value}
              searching={state.searching}
              open={false}
              onFocus={onFocus}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onClear={onClear}
            />
          </DialogTitle>
          {provided && state.items && (
            <DialogContent>
              <AppSearchResult />
            </DialogContent>
          )}
        </Dialog>
      </AppSearchRoot>
    </ClickAwayListener>
  );
}
