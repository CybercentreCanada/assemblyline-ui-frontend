import { makeStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import ClearIcon from '@material-ui/icons/Clear';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericField, StoreProps, TooltipIconButton, useDispatch } from '../../..';

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
  const {
    onSearchClear,
    onSearchBarFocus,
    onSearchBarKeyDown,
    onSearchBarValueChange,
    onSelectedSearchIndexChange,
    onSearchBarWheel
  } = useDispatch();

  const {
    search: { indexes, selectedIndex }
  } = store;
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    if (store.search.inputValue !== searchValue) setSearchValue(store.search.inputValue);
  }, [searchValue, store.search.inputValue]);

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
            onSearchBarKeyDown(event, store);
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
              <div className={classes.endAdornment}>{t('of') + indexes.length.toString().toUpperCase()}</div>
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
    prevProps.store.search.inputValue === nextProps.store.search.inputValue &&
    prevProps.store.search.value === nextProps.store.search.value &&
    prevProps.store.search.indexes.length === nextProps.store.search.indexes.length &&
    prevProps.store.search.selectedIndex === nextProps.store.search.selectedIndex
);
