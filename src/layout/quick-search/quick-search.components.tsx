import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import type { InputBaseProps } from '@mui/material';
import {
  Button,
  CircularProgress,
  ClickAwayListener,
  Dialog,
  DialogContent,
  DialogTitle,
  emphasize,
  InputAdornment,
  InputBase,
  MenuItem,
  MenuList,
  Popper,
  Slide,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppPreferenceStore } from 'core/preference';
import { AppLink, useAppNavigate } from 'core/router';
import type { QuickSearchItem } from 'layout/quick-search';
import { fetchQuickSearchItems, parseQuickSearchKeyEvent, RESULT_LIST_ID } from 'layout/quick-search';
import type { ChangeEvent, ComponentProps, CSSProperties, KeyboardEvent } from 'react';
import { forwardRef, memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

const RESULT_LIST_STYLE: CSSProperties = { maxHeight: 500, overflow: 'auto' };

//*****************************************************************************************
// Quick Search Root
//*****************************************************************************************

export const QuickSearchRoot = styled('div', { shouldForwardProp: prop => prop !== 'menuOpen' })<{
  menuOpen: boolean;
}>(({ theme, menuOpen }) => {
  const backgroundColor = emphasize(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.1 : 0.033);

  return {
    position: 'relative',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
    borderRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: menuOpen ? 0 : theme.shape.borderRadius,
    borderBottomRightRadius: menuOpen ? 0 : theme.shape.borderRadius,

    '.quicksearch-input': {
      backgroundColor:
        theme.palette.mode === 'dark' ? backgroundColor : menuOpen ? theme.palette.background.default : backgroundColor,
      boxShadow: menuOpen ? theme.shadows[4] : 'none'
    },
    '.quicksearch-result': {
      backgroundColor: theme.palette.mode === 'dark' ? backgroundColor : theme.palette.background.default,
      borderBottomLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius,
      boxShadow: menuOpen ? theme.shadows[4] : 'none',
      color: theme.palette.text.primary
    }
  };
});

QuickSearchRoot.displayName = 'QuickSearchRoot';

type QuickSearchModalTransitionProps = ComponentProps<typeof Slide>;

const QuickSearchModalTransition = forwardRef<HTMLDivElement, QuickSearchModalTransitionProps>(
  function QuickSearchModalTransition({ children, ...transitionProps }, ref) {
    return (
      <Slide direction="down" ref={ref} {...transitionProps}>
        {children}
      </Slide>
    );
  }
);

//*****************************************************************************************
// Quick Search Empty
//*****************************************************************************************

const QuickSearchEmpty = memo(() => {
  const { t } = useTranslation(['quicksearch']);
  const theme = useTheme();
  const bgColor = emphasize(theme.palette.background.default, 0.1);
  const color = emphasize(bgColor, 0.4);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing(2),
        margin: theme.spacing(1),
        borderRadius: theme.shape.borderRadius * 2,
        backgroundColor: bgColor,
        color
      }}
    >
      <InfoIcon fontSize="large" />
      <div style={{ margin: theme.spacing(1) }} />
      <Typography variant="h5">{t('noresults')}</Typography>
    </div>
  );
});

QuickSearchEmpty.displayName = 'QuickSearchEmpty';

//*****************************************************************************************
// Quick Search Input
//*****************************************************************************************

export type QuickSearchInputProps = {
  searching?: boolean;
  provided?: boolean;
  focused?: boolean;
  showToggle?: boolean;
  showClear?: boolean;
  open?: boolean;
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
  onClear: () => void;
  onToggleFullscreen: () => void;
} & InputBaseProps;

export const QuickSearchInput = memo(
  ({
    searching = false,
    provided = false,
    focused = false,
    autoFocus = false,
    showToggle = false,
    showClear = false,
    value,
    open = false,
    maxWidth = '100%',
    minWidth = '100%',
    onBlur,
    onClear,
    onToggleFullscreen,
    onFocus,
    onChange,
    onKeyDown,
    ...inputProps
  }: QuickSearchInputProps) => {
    const { t } = useTranslation(['quicksearch']);
    const rootRef = useRef<HTMLDivElement>(null);

    const handleToggleClick = useCallback(() => {
      if (open && provided) {
        onToggleFullscreen();
      } else {
        rootRef.current?.querySelector('input')?.focus();
      }
    }, [open, provided, onToggleFullscreen]);

    return (
      <div ref={rootRef} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', flexGrow: 2 }}>
        <InputBase
          {...inputProps}
          fullWidth
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={t('placeholder')}
          inputProps={{ 'aria-label': t('aria') }}
          startAdornment={
            <InputAdornment position="start" sx={theme => ({ color: theme.palette.text.disabled })}>
              {searching ? <CircularProgress size={24} color="inherit" /> : <SearchIcon color="inherit" />}
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end" sx={theme => ({ color: theme.palette.text.disabled })}>
              {showToggle && !focused && (
                <Tooltip title={t(open && provided ? 'fullscreen' : 'shortcut')}>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={handleToggleClick}
                    sx={{ fontSize: 'small', marginRight: '8px', padding: 0, minWidth: 'auto' }}
                  >
                    CTRL+K
                  </Button>
                </Tooltip>
              )}
              {showClear && (
                <IconButton color="inherit" onClick={onClear} disabled={!value}>
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          }
          sx={theme => ({
            color: theme.palette.text.secondary,
            paddingTop: 0.5,
            paddingBottom: 0.5,
            paddingLeft: 1.5,
            paddingRight: 1,
            maxWidth,
            minWidth,
            borderRadius: theme.spacing(0.5)
          })}
        />
      </div>
    );
  }
);

QuickSearchInput.displayName = 'QuickSearchInput';

//*****************************************************************************************
// Quick Search Result
//*****************************************************************************************

type QuickSearchResultProps = {
  items: QuickSearchItem[] | null;
  onSelect: (item: QuickSearchItem) => void;
  onEscape: () => void;
};

export const QuickSearchResult = memo(({ items, onSelect, onEscape }: QuickSearchResultProps) => {
  const { t } = useTranslation(['quicksearch']);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, item: QuickSearchItem) => {
      const { isEnter, isEscape } = parseQuickSearchKeyEvent(event);
      if (isEnter) {
        onSelect(item);
      } else if (isEscape) {
        onEscape();
      }
    },
    [onSelect, onEscape]
  );

  return !items?.length ? null : (
    <MenuList data-quicksearch-id={RESULT_LIST_ID} className="quicksearch-result" sx={RESULT_LIST_STYLE}>
      {items && items.length > 0 ? (
        items.map(item => (
          <MenuItem key={item.id} onKeyDown={event => handleKeyDown(event, item)}>
            <AppLink nav={item.nav} style={{ display: 'block', width: '100%' }}>
              {item.label}
            </AppLink>
          </MenuItem>
        ))
      ) : items ? (
        <QuickSearchEmpty />
      ) : (
        <MenuItem disabled>
          <Typography variant="body2" style={{ marginTop: 8, marginBottom: 8 }}>
            <em>{t('starttyping')}</em>
          </Typography>
        </MenuItem>
      )}
    </MenuList>
  );
});

QuickSearchResult.displayName = 'QuickSearchResult';

//*****************************************************************************************
// Quick Search
//*****************************************************************************************

export const QuickSearch = memo(() => {
  const { t } = useTranslation(['quicksearch']);
  const theme = useTheme();
  const navigate = useAppNavigate();

  const showQuickSearch = useAppPreferenceStore(store => store.template.showQuickSearch);
  const value = useAppInterfaceStore(store => store.quicksearch.value);
  const searching = useAppInterfaceStore(store => store.quicksearch.searching);
  const menu = useAppInterfaceStore(store => store.quicksearch.menu);
  const mode = useAppInterfaceStore(store => store.quicksearch.mode);
  const focused = useAppInterfaceStore(store => store.quicksearch.focused);
  const autoReset = useAppInterfaceStore(store => store.quicksearch.autoReset);
  const items = useAppInterfaceStore(store => store.quicksearch.items);
  const setInterfaceStore = useAppSetInterfaceStore();

  const rootRef = useRef<HTMLDivElement>(null);
  const requestId = useRef<number>(0);

  const isPhoneMode = useMediaQuery(theme.breakpoints.only('xs'));
  const isTabletMode = useMediaQuery(theme.breakpoints.only('sm'));

  const patch = useCallback(
    (next: Partial<AppInterfaceStore['quicksearch']>) => {
      setInterfaceStore(store => ({ quicksearch: { ...store.quicksearch, ...next } }));
    },
    [setInterfaceStore]
  );

  const selectItem = useCallback((item: QuickSearchItem) => item.nav?.(navigate), [navigate]);

  useEffect(() => {
    patch({ value: '', items: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CTRL+K global shortcut to open/focus quicksearch.
  useEffect(() => {
    if (!showQuickSearch) return undefined;

    const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      const { isCtrl } = parseQuickSearchKeyEvent(event);
      if (isCtrl && event.key === 'k') {
        event.preventDefault();
        const input = rootRef.current?.querySelector('input');
        if (!input || isPhoneMode) {
          patch({ menu: menu || isPhoneMode, mode: 'fullscreen' });
        } else {
          input.focus();
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [showQuickSearch, isPhoneMode, menu, patch]);

  const handleFocus = useCallback(() => patch({ focused: true }), [patch]);

  const handleBlur = useCallback(() => patch({ focused: false }), [patch]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      const currentRequestId = ++requestId.current;

      if (!nextValue.trim()) {
        patch({ value: nextValue, menu: false, searching: false, items: null });
        return;
      }

      patch({ value: nextValue, menu: true, searching: true });

      void fetchQuickSearchItems(nextValue).then(items => {
        if (currentRequestId !== requestId.current) return; // stale response, a newer search has started
        patch({ searching: false, items });
      });
    },
    [patch]
  );

  const handleEnter = useCallback(() => {
    const [first] = items ?? [];
    if (first) selectItem(first);
    navigate.to().only({ route: '/search', search: { query: value } });

    if (autoReset) {
      const input = rootRef.current?.querySelector('input');
      let nextFocused = true;
      if (input) {
        input.blur();
        nextFocused = false;
      }
      patch({ menu: false, mode: 'inline', focused: nextFocused, value: '' });
    } else {
      patch({ menu: true });
    }
  }, [items, autoReset, value, selectItem, navigate, patch]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const { isEnter, isEscape, isTab, isArrowDown } = parseQuickSearchKeyEvent(event);
      if (isEnter) {
        handleEnter();
      } else if (isEscape || isTab) {
        setTimeout(() => rootRef.current?.querySelector('input')?.blur(), 50);
        patch({ menu: false });
      } else if (isArrowDown) {
        const result = document.querySelector<HTMLElement>(`[data-quicksearch-id="${RESULT_LIST_ID}"]`);
        if (result) {
          // Prevent scrolling before the result list gets focus.
          event.preventDefault();
          result.focus();
        }
      }
    },
    [patch, handleEnter]
  );

  const handleClear = useCallback(() => patch({ value: '', items: null, menu: false }), [patch]);

  const handleToggleFullscreen = useCallback(() => {
    patch({
      menu: menu || isPhoneMode,
      mode: mode === 'inline' ? 'fullscreen' : 'inline'
    });
  }, [isPhoneMode, menu, mode, patch]);

  const handleClose = useCallback(() => patch({ menu: false }), [patch]);

  const handleOpenFullscreen = useCallback(() => patch({ menu: !menu, mode: 'fullscreen' }), [menu, patch]);

  if (!showQuickSearch) return null;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <QuickSearchRoot
        ref={rootRef}
        menuOpen={menu}
        style={{ marginRight: isPhoneMode ? 0 : theme.spacing(1), ...(isTabletMode && { width: '100%' }) }}
      >
        {isPhoneMode ? (
          <Tooltip
            title={
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <span>{t('fullscreen')}</span>
                <span>CTRL+K</span>
              </div>
            }
          >
            <IconButton color="inherit" size="large" onClick={handleOpenFullscreen}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <QuickSearchInput
              autoFocus={false}
              focused={focused}
              showToggle
              provided
              className="quicksearch-input"
              value={value}
              searching={searching}
              open={menu}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onClear={handleClear}
              onToggleFullscreen={handleToggleFullscreen}
              minWidth={isTabletMode ? '100%' : '250px'}
              maxWidth={isTabletMode ? '100%' : '350px'}
            />
            <Popper
              open={menu && mode === 'inline'}
              anchorEl={rootRef.current}
              placement="bottom-end"
              sx={_theme => ({ width: '100%', zIndex: _theme.zIndex.appBar + 1 })}
              disablePortal
            >
              <QuickSearchResult items={items} onSelect={selectItem} onEscape={handleClose} />
            </Popper>
          </>
        )}
        <Dialog
          disableRestoreFocus
          fullWidth
          maxWidth="md"
          TransitionComponent={QuickSearchModalTransition}
          open={menu && mode === 'fullscreen'}
          onClose={() => patch({ mode: 'inline', menu: false })}
          sx={{
            maxHeight: '75%',
            margin: 0,
            '.MuiDialog-container': { alignItems: 'start' }
          }}
          PaperProps={{ sx: { borderRadius: 0, margin: 0, width: '100%' } }}
        >
          <DialogTitle sx={{ padding: theme.spacing(1, 1.5) }}>
            <QuickSearchInput
              autoFocus
              focused={focused}
              className="quicksearch-input"
              style={{ backgroundColor: emphasize(theme.palette.background.default, 0.1) }}
              showToggle={false}
              value={value}
              searching={searching}
              open={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onClear={handleClear}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </DialogTitle>
          {items && items.length > 0 && (
            <DialogContent>
              <QuickSearchResult items={items} onSelect={selectItem} onEscape={handleClose} />
            </DialogContent>
          )}
        </Dialog>
      </QuickSearchRoot>
    </ClickAwayListener>
  );
});

QuickSearch.displayName = 'QuickSearch';
