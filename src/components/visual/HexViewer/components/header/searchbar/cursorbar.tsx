import { makeStyles } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumericField, StoreProps, TooltipIconButton, useDispatch } from '../../..';

const useHexStyles = makeStyles(theme => ({
  root: {
    '& > fieldset': {
      border: 'none !important',
      borderWidth: '0px'
    }
  },
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
  }
}));

export const WrappedHexCursorBar = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  const { onCursorIndexChange, onCursorClear, onSearchBarFocus, onSearchBarKeyDown } = useDispatch();

  const {
    cursor: { index: cursorIndex },
    offset: { base: offsetBase }
  } = store;
  const { codes: hexcodes } = store.hex;

  return (
    <>
      <NumericField
        classes={{ root: classes.root }}
        // label={t('offset.label')}
        labelWidth={0}
        placeholder={t('header.searchfield.cursor')}
        fullWidth
        margin="dense"
        range="loop"
        value={cursorIndex as number}
        min={0}
        max={hexcodes.size - 1}
        base={offsetBase}
        autoFocus
        allowNull={true}
        direction="inverse"
        preventArrowKeyDown
        endAdornment={
          <div className={classes.endAdornment}>{t('of') + (hexcodes.size - 1).toString(offsetBase).toUpperCase()}</div>
        }
        onFocus={() => onSearchBarFocus()}
        onChange={event => onCursorIndexChange({ index: event.target.valueAsNumber as number })}
        onKeyDown={event => onSearchBarKeyDown({ event }, { store })}
      />
      <TooltipIconButton
        classes={{ iconButton: classes.iconButton }}
        title={t('clear')}
        onClick={() => onCursorClear()}
        disabled={cursorIndex === null}
        icon={<ClearIcon />}
      />
    </>
  );
};

export const HexCursorBar = React.memo(
  WrappedHexCursorBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.type === nextProps.store.search.type &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.cursor.index === nextProps.store.cursor.index
);
