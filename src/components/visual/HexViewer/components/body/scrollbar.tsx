import { Button, makeStyles, Slider } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import clsx from 'clsx';
import { default as React } from 'react';
import { StoreProps, useDispatch } from '../..';

export const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  buttonBox: {
    display: 'grid',
    height: '42px',
    minHeight: '42px'
  },
  buttonUpBox: {
    placeSelf: 'center',
    placeItems: 'start'
  },
  buttonDownBox: {
    placeSelf: 'center',
    placeItems: 'end'
  },
  button: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    minWidth: '28px',
    minHeight: '28px',
    fontSize: '0.8125rem',
    padding: 0
  }
}));

export const WrappedHexScrollBar = ({ store }: StoreProps) => {
  const classes = useStyles();
  const { onScrollButtonClick, onScrollSliderChange } = useDispatch();

  const {
    scroll: { rowIndex, speed, maxRowIndex }
  } = store;

  return (
    <div className={clsx(classes.root)}>
      <div className={clsx(classes.buttonBox, classes.buttonUpBox)}>
        <Button
          className={clsx(classes.button)}
          onClick={() => onScrollButtonClick({ value: -1 })}
          size={'small'}
          disabled={rowIndex === 0}
        >
          <ArrowDropUpIcon />
        </Button>
      </div>
      <Slider
        value={maxRowIndex - rowIndex}
        orientation={'vertical'}
        track={false}
        min={0}
        step={speed}
        max={maxRowIndex}
        onChange={(event, newValue) => onScrollSliderChange({ event, newValue })}
      />
      <div className={clsx(classes.buttonBox, classes.buttonDownBox)}>
        <Button
          className={clsx(classes.button)}
          onClick={() => onScrollButtonClick({ value: 1 })}
          size={'small'}
          disabled={rowIndex === maxRowIndex}
        >
          <ArrowDropDownIcon />
        </Button>
      </div>
    </div>
  );
};
export const HexScrollBar = React.memo(
  WrappedHexScrollBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.loading.status === nextProps.store.loading.status &&
    prevProps.store.scroll.rowIndex === nextProps.store.scroll.rowIndex &&
    prevProps.store.scroll.speed === nextProps.store.scroll.speed &&
    prevProps.store.scroll.maxRowIndex === nextProps.store.scroll.maxRowIndex &&
    prevProps.store.layout.row.size === nextProps.store.layout.row.size &&
    prevProps.store.mode.body === nextProps.store.mode.body &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width
);
export default HexScrollBar;
