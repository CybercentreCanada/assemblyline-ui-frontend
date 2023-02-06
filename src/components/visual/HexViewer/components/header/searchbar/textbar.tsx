import ClearIcon from '@mui/icons-material/Clear';
import { Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DelayedTextField,
  isWidthEqualUp,
  NumericField,
  StoreProps,
  TooltipIconButton,
  useDispatch,
  useEventListener
} from '../../..';

const useHexStyles = makeStyles(theme => ({
  endAdornment: {
    color: theme.palette.secondary.light
  },
  iconButton: {
    padding: 10,
    [theme.breakpoints.only('sm')]: {
      padding: 4
    },
    [theme.breakpoints.only('xs')]: {
      padding: 2
    }
  },
  root: {
    '& > fieldset': {
      border: 'none !important',
      borderWidth: '0px'
    }
  },
  formControl: {
    width: '100%'
  },
  outlinedInput: {
    paddingRight: '4px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  endAdornmentButton: {
    height: '20px',
    borderRadius: 0,
    minWidth: '20px'
  },
  input: {
    textAlign: 'left'
  },
  indexInput: {
    textAlign: 'right'
  },
  resultNoneIndexes: {
    textAlign: 'center',
    cursor: 'default',
    padding: 8,
    [theme.breakpoints.only('sm')]: {
      padding: 2
    },
    [theme.breakpoints.only('xs')]: {
      padding: 0
    }
  }
}));

export const WrappedTextBar = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  const {
    onSearchClear,
    onSearchBarFocus,
    onSearchBarKeyDown,
    onSearchBarValueChange,
    onSelectedSearchIndexChange,
    onSearchBarWheel
  } = useDispatch();

  const {
    search: { inputValue, results, selectedResult }
  } = store;

  const inputRef = useRef(null);

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.ctrlKey === false || event.code !== 'KeyF') return;
    event.preventDefault();
    inputRef.current.focus();
  });

  return (
    <>
      <DelayedTextField
        classes={{
          formControl: classes.formControl,
          outlinedInput: classes.outlinedInput,
          root: classes.root,
          input: classes.input
        }}
        inputRef={inputRef}
        type="text"
        placeholder={t('header.searchfield.text')}
        fullWidth
        autoFocus
        delay={250}
        value={inputValue}
        size="small"
        margin="dense"
        preventSubmit={true}
        onFocus={() => onSearchBarFocus()}
        onWheel={event => onSearchBarWheel({ event })}
        onChange={event => onSearchBarValueChange({ value: event.target.value })}
        onKeyDown={event => onSearchBarKeyDown({ event }, { store })}
      />

      {(inputValue === null || inputValue === '') && (results === null || results.length === 0) ? (
        <></>
      ) : results === null || results.length === 0 ? (
        isWidthEqualUp(store, 'sm') ? (
          <Typography className={classes.resultNoneIndexes} variant="subtitle1" color="error">
            {t('no-results.desktop')}
          </Typography>
        ) : (
          <Typography className={classes.resultNoneIndexes} variant="subtitle1" color="error">
            {t('no-results.mobile')}
          </Typography>
        )
      ) : (
        <>
          <NumericField
            classes={{ root: classes.root, input: classes.indexInput }}
            // label={t('offset.label')}
            labelWidth={0}
            placeholder={''}
            size="small"
            range="loop"
            margin="dense"
            value={selectedResult as number}
            min={0}
            max={results.length - 1}
            allowNull={true}
            offset={1}
            direction="inverse"
            preventArrowKeyDown
            endAdornment={
              <div className={classes.endAdornment}>{t('of') + results.length.toString().toUpperCase()}</div>
            }
            onFocus={() => onSearchBarFocus()}
            onChange={event => onSelectedSearchIndexChange({ index: event.target.valueAsNumber as number })}
            // onKeyDown={event => onSearchBarKeyDown(event,store)}
          />
          <TooltipIconButton
            classes={{ iconButton: classes.iconButton }}
            title={t('clear')}
            onClick={() => onSearchClear()}
            disabled={inputValue === null || inputValue === ''}
            icon={<ClearIcon />}
          />
        </>
      )}
    </>
  );
};

export const TextBar = React.memo(
  WrappedTextBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.mode.width === nextProps.store.mode.width &&
    prevProps.store.search.mode === nextProps.store.search.mode &&
    prevProps.store.search.inputValue === nextProps.store.search.inputValue &&
    prevProps.store.search.mode === nextProps.store.search.mode &&
    prevProps.store.search.selectedResult === nextProps.store.search.selectedResult &&
    prevProps.store.search.results === nextProps.store.search.results
);
