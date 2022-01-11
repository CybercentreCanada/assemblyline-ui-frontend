import { Paper, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Divider from '@material-ui/core/Divider';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';
import MenuIcon from '@material-ui/icons/Menu';
import NavigationIcon from '@material-ui/icons/Navigation';
import SettingsIcon from '@material-ui/icons/Settings';
import ShareIcon from '@material-ui/icons/Share';
import Autocomplete from '@material-ui/lab/Autocomplete';
import 'moment/locale/fr';
import { default as React, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NumberFieldPopper,
  StoreState,
  useCursor,
  useHex,
  useHistory,
  useLayout,
  useLocation,
  useSearch,
  useSetting,
  useStyles,
  useSuggestion
} from '..';

export const WrappedHexToolBar = (states: StoreState) => {
  const { toolbarClasses } = useStyles();
  const { t, i18n } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const upXS = useMediaQuery(theme.breakpoints.up('xs'));

  const { hexMap } = useHex();
  const { layoutRef } = useLayout();
  const { onSettingOpen } = useSetting();
  const { onSearchKeyDown, onSearchClear, onSearchClick, onSearchIndexChange, onSearchInputChange } = useSearch();
  const { onCursorIndexChange } = useCursor();
  const { onHistoryChange, onHistoryKeyDown } = useHistory();
  const { onLocationShare } = useLocation();

  const {
    suggestionLabels,
    onSuggestionLabelChange,
    onSuggestionFocus,
    onSuggestionBlur,
    onSuggestionChange,
    onSuggestionInputChange,
    onSuggestionKeyDown
  } = useSuggestion();

  const { cursorIndex, searchValue, searchIndexes, searchIndex, suggestionOpen } = states;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, setValue] = useState<string>('');

  const searchPopperRef = useRef(null);
  const handleSearchClick = useCallback(event => searchPopperRef.current.open(event), []);

  const cursorPopperRef = useRef(null);
  const handleCursorClick = useCallback(event => cursorPopperRef.current.open(event), []);

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) return;
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  // const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);
  // const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorMenuEl(event.currentTarget);
  // const handleMenuClose = () => setAnchorMenuEl(null);

  useLayoutEffect(() => onSuggestionLabelChange(i18n.language), [i18n.language, onSuggestionLabelChange]);

  return (
    <div className={toolbarClasses.root}>
      <Paper component="form" className={toolbarClasses.toolbar}>
        <Autocomplete
          classes={{
            inputRoot: toolbarClasses.autocompleteInputRoot,
            popper: toolbarClasses.autocompletePopper,
            paper: toolbarClasses.autocompletePaper,
            listbox: toolbarClasses.autocompleteList,
            option: toolbarClasses.autocompleteOption
          }}
          freeSolo
          disableClearable
          handleHomeEndKeys
          open={suggestionOpen && upXS}
          closeIcon={null}
          fullWidth
          size="small"
          value={value}
          options={suggestionLabels.current}
          onFocus={event => {
            onSuggestionFocus();
          }}
          onBlur={event => {
            onSuggestionBlur();
          }}
          onChange={(event: React.ChangeEvent, newValue: string | null) => {
            onSuggestionChange(newValue);
          }}
          inputValue={searchValue}
          onInputChange={(event: React.ChangeEvent, newInputValue: string) => {
            onSuggestionInputChange(newInputValue);
            onHistoryChange();
            onSearchInputChange(newInputValue);
          }}
          onKeyDown={event => {
            onSearchKeyDown(event);
            onHistoryKeyDown(event);
            onSuggestionKeyDown(event);
          }}
          renderInput={params => (
            <TextField
              {...params}
              placeholder={t('find')}
              variant={'outlined'}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password'
              }}
            />
          )}
        />

        {upSM ? (
          <>
            <Tooltip title={t('search')}>
              {upXS ? (
                searchIndexes.length > 0 ? (
                  <Typography
                    className={toolbarClasses.resultIndexes}
                    variant="subtitle1"
                    color={
                      searchValue && searchValue.length > 0 && searchIndexes.length === 0 ? 'error' : 'textPrimary'
                    }
                    onClick={handleSearchClick}
                  >
                    {searchIndex + 1 + t('of') + searchIndexes.length}
                  </Typography>
                ) : (
                  <Typography
                    className={toolbarClasses.resultNoneIndexes}
                    variant="subtitle1"
                    color={searchValue.length > 0 ? 'error' : 'textPrimary'}
                  >
                    {t('no-results')}
                  </Typography>
                )
              ) : (
                <></>
              )}
            </Tooltip>

            <TooltipButton
              title={t('previous-match')}
              onClick={() => onSearchClick('previous')}
              icon={<ArrowUpward />}
            />
            <TooltipButton title={t('next-match')} onClick={() => onSearchClick('next')} icon={<ArrowDownward />} />
            <TooltipButton title={t('clear')} onClick={onSearchClear} icon={<ClearIcon />} />
            <Divider className={toolbarClasses.divider} orientation="vertical" />
            <TooltipButton title={t('navigation')} onClick={handleCursorClick} icon={<NavigationIcon />} />
            <TooltipButton title={t('share')} onClick={onLocationShare} icon={<ShareIcon />} />
            <TooltipButton title={t('settings')} onClick={onSettingOpen} icon={<SettingsIcon />} />
          </>
        ) : (
          <Tooltip title={t('menu')}>
            <IconButton
              aria-label={t('menu')}
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}

        <NumberFieldPopper
          ref={searchPopperRef}
          id="search-index"
          label={t('search-label')}
          placeholder={t('search-placeholder')}
          value={searchIndex + 1}
          min={0}
          max={searchIndexes.length}
          onNumberChange={(index: number) => onSearchIndexChange(index)}
        />
        <NumberFieldPopper
          ref={cursorPopperRef}
          id="cursor-index"
          label={t('navigation-label')}
          placeholder={t('navigation-placeholder')}
          value={cursorIndex ? cursorIndex : ''}
          min={0}
          max={hexMap.current.size - 1}
          onNumberChange={(index: number) => onCursorIndexChange(index)}
        />
        <Popper open={open} anchorEl={layoutRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: 'right bottom' }}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Paper>
    </div>
  );
};
export const HexToolBar = React.memo(
  WrappedHexToolBar,
  (prevProps: Readonly<StoreState>, nextProps: Readonly<StoreState>) =>
    prevProps.hexBase === nextProps.hexBase &&
    prevProps.layoutRows === nextProps.layoutRows &&
    prevProps.layoutColumns === nextProps.layoutColumns &&
    prevProps.searchValue === nextProps.searchValue &&
    prevProps.searchIndexes === nextProps.searchIndexes &&
    prevProps.searchIndex === nextProps.searchIndex &&
    prevProps.searchHexIndex === nextProps.searchHexIndex &&
    prevProps.suggestionOpen === nextProps.suggestionOpen &&
    prevProps.cursorIndex === nextProps.cursorIndex
);
export default HexToolBar;

const TooltipButton = React.memo(
  ({
    title = '',
    icon = null,
    onClick = () => null
  }: {
    title: string;
    icon: React.ReactElement;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  }) => {
    const { toolbarClasses } = useStyles();

    return (
      <Tooltip title={title}>
        <IconButton className={toolbarClasses.iconButton} aria-label={title} onClick={onClick} size="small">
          {icon}
        </IconButton>
      </Tooltip>
    );
  }
);
