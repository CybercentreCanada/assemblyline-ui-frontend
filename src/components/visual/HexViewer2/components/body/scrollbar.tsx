import { Button, makeStyles, Slider } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import clsx from 'clsx';
import { ChangeEvent, default as React } from 'react';
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
    scroll: { index, speed, maxIndex }
  } = store;

  return (
    <div className={clsx(classes.root)}>
      <div className={clsx(classes.buttonBox, classes.buttonUpBox)}>
        <Button
          className={clsx(classes.button)}
          onClick={() => onScrollButtonClick(-1)}
          size={'small'}
          disabled={index === 0}
        >
          <ArrowDropUpIcon />
        </Button>
      </div>
      <Slider
        value={maxIndex - index}
        orientation={'vertical'}
        track={false}
        min={0}
        step={speed}
        max={maxIndex}
        onChange={(e: ChangeEvent, newValue: number) => onScrollSliderChange(e, newValue)}
      />
      <div className={clsx(classes.buttonBox, classes.buttonDownBox)}>
        <Button
          className={clsx(classes.button)}
          onClick={() => onScrollButtonClick(1)}
          size={'small'}
          disabled={index === maxIndex}
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
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.scroll.index === nextProps.store.scroll.index &&
    prevProps.store.scroll.speed === nextProps.store.scroll.speed &&
    prevProps.store.scroll.maxIndex === nextProps.store.scroll.maxIndex &&
    prevProps.store.layout.row.size === nextProps.store.layout.row.size &&
    prevProps.store.mode.bodyType === nextProps.store.mode.bodyType &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width
);
export default HexScrollBar;
