import { ClickAwayListener, Paper, Popper, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';
import SettingsIcon from '@material-ui/icons/Settings';
import Autocomplete from '@material-ui/lab/Autocomplete';
import 'moment/locale/fr';
import { default as React, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StoreState,
  SuggestionType,
  useCursor,
  useHex,
  useHistory,
  useLayout,
  useSearch,
  useStyles,
  useSuggestion
} from '..';

export const WrappedHexToolBar = (states: StoreState) => {
  const { toolbarClasses } = useStyles();
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const upXS = useMediaQuery(theme.breakpoints.up('xs'));

  const { layoutRef } = useLayout();

  const { hexMap, getAddressValue } = useHex();
  const { onOpenSettings } = useLayout();
  const { onSearchChange, onSearchKeyDown, onSearchClear, onSearchClick, onSearchIndexChange, onSearchInputChange } =
    useSearch();
  const { onCursorIndexChange } = useCursor();
  const { onHistoryChange, onHistoryKeyDown } = useHistory();
  const { suggestionLabels, onSuggestionFocus, onSuggestionBlur, onSuggestionChange, onSuggestionInputChange } =
    useSuggestion();

  const { cursorIndex, searchValue, searchIndexes, searchIndex, suggestionOpen } = states;

  // const [open, setOpen] = useState<boolean>(false);
  const element = useRef<HTMLDivElement>();
  const optionsElement = useRef<HTMLDivElement>();
  const isLTEMedium = useMediaQuery(theme.breakpoints.up('xs'));

  const [value, setValue] = React.useState<string | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const defaultProps = {
    options: suggestionLabels.current,
    getOptionLabel: (option: SuggestionType) => (option.hasOwnProperty('text') ? option.label : option)
  };

  // Search
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleSearchClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setSearchAnchorEl(event.currentTarget);
    setSearchOpen(true);
  }, []);
  const handleSearchClickAway = useCallback(() => setSearchOpen(false), []);

  // Cursor
  const [cursorOpen, setCursorOpen] = useState<boolean>(false);
  const [cursorAnchorEl, setCursorAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleCursorClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setCursorAnchorEl(event.currentTarget);
    setCursorOpen(true);
  }, []);
  const handleCursorClickAway = useCallback(() => setCursorOpen(false), []);

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
          options={suggestionLabels.current}
          onFocus={event => {
            onSuggestionFocus();
          }}
          onBlur={event => {
            onSuggestionBlur();
          }}
          value={value}
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

        {upXS ? (
          searchIndexes.length > 0 ? (
            <Typography
              className={toolbarClasses.resultIndexes}
              variant="subtitle1"
              color={searchValue && searchValue.length > 0 && searchIndexes.length === 0 ? 'error' : 'textPrimary'}
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
              No Results
            </Typography>
          )
        ) : null}
        <Tooltip title={t('previous-match')}>
          <IconButton
            className={toolbarClasses.iconButton}
            aria-label="previous-match"
            onClick={() => onSearchClick('previous')}
            disabled={searchIndexes.length === 0}
            size="small"
          >
            <ArrowUpward />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('next-match')}>
          <IconButton
            className={toolbarClasses.iconButton}
            aria-label="next-match"
            onClick={() => onSearchClick('next')}
            disabled={searchIndexes.length === 0}
            size="small"
          >
            <ArrowDownward />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('clear')}>
          <IconButton
            className={toolbarClasses.iconButton}
            aria-label="clear"
            onClick={() => onSearchClear()}
            disabled={searchIndexes.length === 0}
            size="small"
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
        <Divider className={toolbarClasses.divider} orientation="vertical" />
        <Typography
          className={toolbarClasses.cursorIndex}
          variant="subtitle1"
          color="textPrimary"
          onClick={handleCursorClick}
        >
          {cursorIndex ? 'addr: ' + getAddressValue(cursorIndex) : 'Go to'}
        </Typography>
        <Tooltip title={t('settings')}>
          <IconButton
            className={toolbarClasses.iconButton}
            aria-label="settings"
            onClick={() => onOpenSettings()}
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        <Popper open={searchOpen} anchorEl={searchAnchorEl} placement="bottom" transition>
          {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={handleSearchClickAway}>
              <Fade {...TransitionProps} timeout={200}>
                <Paper className={toolbarClasses.searchPaper}>
                  <form noValidate autoComplete="off">
                    <TextField
                      id="search-index"
                      fullWidth
                      label="Search Index:"
                      type="number"
                      size="small"
                      margin="dense"
                      variant="outlined"
                      InputProps={{
                        autoCorrect: 'off',
                        autoCapitalize: 'off',
                        inputProps: { min: 1, max: searchIndexes.length }
                      }}
                      value={searchIndex + 1}
                      onChange={event => {
                        onSearchIndexChange(parseInt(event.target.value));
                        // event.currentTarget.blur();
                      }}
                      onSubmit={() => {}}
                      style={{ margin: 0 }}
                    />
                  </form>
                </Paper>
              </Fade>
            </ClickAwayListener>
          )}
        </Popper>
        <Popper open={cursorOpen} anchorEl={cursorAnchorEl} placement="bottom" transition>
          {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={handleCursorClickAway}>
              <Fade {...TransitionProps} timeout={200}>
                <Paper className={toolbarClasses.searchPaper}>
                  <TextField
                    id="cursor-address"
                    fullWidth
                    label="Cursor Address:"
                    size="small"
                    margin="dense"
                    variant="outlined"
                    type="number"
                    value={cursorIndex ? cursorIndex : ''}
                    InputProps={{
                      autoCorrect: 'off',
                      autoCapitalize: 'off',
                      inputProps: { min: 0, max: hexMap.current.size - 1 }
                    }}
                    onChange={event => {
                      // onCursorIndexChange(event);
                      // event.currentTarget.blur();
                    }}
                    // onKeyPress={event => console.log(event)}
                    onInput={(event: any) => {
                      // console.log(event.target.valueAsNumber);
                      onCursorIndexChange(event.target.valueAsNumber);
                    }}
                    onSubmit={() => {}}
                    style={{ margin: 0 }}
                  />
                </Paper>
              </Fade>
            </ClickAwayListener>
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
