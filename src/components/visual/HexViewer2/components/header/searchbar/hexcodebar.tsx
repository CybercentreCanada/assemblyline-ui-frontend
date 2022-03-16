import { makeStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import ClearIcon from '@material-ui/icons/Clear';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isEscapeKey, NumericField, StoreProps, TooltipIconButton, useDispatch, useReducer } from '../../..';

const useHexStyles = makeStyles(theme => ({
  endAdornment: {
    color: theme.palette.secondary.light
  },
  iconButton: {
    padding: 10,
    [theme.breakpoints.down('sm')]: {
      padding: 4
    },
    [theme.breakpoints.down('xs')]: {
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
  }
}));

export const WrappedHexcodeBar = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();

  const { refs } = useReducer();
  const {
    onSearchClear,
    onSearchBarFocus,
    onSearchBarKeyDown,
    onSearchBarValueChange,
    onSelectedSearchIndexChange,
    onSearchBarWheel,
    onLocationLoaded
  } = useDispatch();

  const {
    cursor: { index: cursorIndex },
    offset: { base: offsetBase, size: offsetSize },
    search: { value, indexes, selectedIndex }
  } = store;
  const { codes: hexcodes } = refs.current.hex;
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    if (store.history.values !== null && store.history.values !== undefined && store.history.values.length !== 0)
      setSearchValue(store.history.values[store.history.index].value as string);
  }, [store.history.index]);

  // useEffect(() => {
  //   const newValue = store.location.searchValue as string;
  //   console.log(store.location.searchValue, store.location.loaded);
  //   if (newValue !== null && newValue !== undefined && store.location.loaded === false) {
  //     onLocationLoaded();
  //     setSearchValue(newValue);
  //   }
  // }, [store.location]);

  return (
    <>
      <FormControl className={classes.formControl} variant="outlined" size="small">
        <OutlinedInput
          className={classes.outlinedInput}
          classes={{
            root: classes.root,
            input: classes.input
          }}
          type="text"
          placeholder={t('header.searchfield.hexcode')}
          fullWidth
          margin="dense"
          autoFocus
          value={searchValue}
          onFocus={() => onSearchBarFocus()}
          onWheel={e => onSearchBarWheel(e)}
          onChange={event => {
            setSearchValue(event.target.value);
            onSearchBarValueChange(event.target.value);
          }}
          onKeyDown={event => {
            if (isEscapeKey(event)) setSearchValue('');
            onSearchBarKeyDown(event, store, refs);
          }}
        />
      </FormControl>

      {indexes === null || indexes.length === 0 ? (
        <></>
      ) : (
        <>
          <NumericField
            classes={{ root: classes.root, input: classes.indexInput }}
            // label={t('offset.label')}
            labelWidth={0}
            placeholder={''}
            margin="dense"
            range="loop"
            value={selectedIndex as number}
            min={0}
            max={indexes.length - 1}
            allowNull={true}
            offset={1}
            direction="inverse"
            preventArrowKeyDown
            endAdornment={
              <div className={classes.endAdornment}>{t('of') + (indexes.length - 1).toString().toUpperCase()}</div>
            }
            onFocus={() => onSearchBarFocus()}
            onChange={event => onSelectedSearchIndexChange(event.target.valueAsNumber as number)}
            // onKeyDown={event => onSearchBarKeyDown(event)}
          />
          <TooltipIconButton
            classes={{ iconButton: classes.iconButton }}
            title={t('clear')}
            onClick={() => {
              setSearchValue('');
              onSearchClear();
            }}
            disabled={searchValue === null || searchValue === ''}
            icon={<ClearIcon />}
          />
        </>
      )}
    </>
  );
};

export const HexcodeBar = React.memo(
  WrappedHexcodeBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.type === nextProps.store.search.type &&
    prevProps.store.search.value === nextProps.store.search.value &&
    prevProps.store.search.indexes.length === nextProps.store.search.indexes.length &&
    prevProps.store.search.selectedIndex === nextProps.store.search.selectedIndex
);
