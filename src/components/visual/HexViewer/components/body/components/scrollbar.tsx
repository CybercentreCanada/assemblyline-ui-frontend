import { Button, Slider } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import clsx from 'clsx';
import { default as React } from 'react';
import { HexStoreProps, useScroll, useStyles } from '../../..';

export const WrappedHexScrollBar = ({ store }: HexStoreProps) => {
  const { scrollbarClasses } = useStyles();
  const { nextScrollMaxIndex, onScrollClick, onScrollSliderChange, onScrollSliderMouseDown } = useScroll();
  const { scrollIndex } = store;

  return (
    <div className={clsx(scrollbarClasses.root)}>
      <div className={clsx(scrollbarClasses.buttonBox, scrollbarClasses.buttonUpBox)}>
        <Button
          className={clsx(scrollbarClasses.button)}
          onClick={() => onScrollClick(-1)}
          size={'small'}
          disabled={scrollIndex === 0}
        >
          <ArrowDropUpIcon />
        </Button>
      </div>
      <Slider
        value={nextScrollMaxIndex.current - scrollIndex}
        onChange={(e, newValue: number) => onScrollSliderChange(newValue)}
        onMouseDown={event => onScrollSliderMouseDown()}
        orientation={'vertical'}
        track={false}
        min={0}
        step={1}
        max={nextScrollMaxIndex.current}
      />
      <div className={clsx(scrollbarClasses.buttonBox, scrollbarClasses.buttonDownBox)}>
        <Button
          className={clsx(scrollbarClasses.button)}
          onClick={() => onScrollClick(1)}
          size={'small'}
          disabled={scrollIndex === nextScrollMaxIndex.current}
        >
          <ArrowDropDownIcon />
        </Button>
      </div>
    </div>
  );
};
export const HexScrollBar = React.memo(
  WrappedHexScrollBar,
  (prevProps: Readonly<HexStoreProps>, nextProps: Readonly<HexStoreProps>) =>
    prevProps.store.scrollIndex === nextProps.store.scrollIndex &&
    prevProps.store.layoutRows === nextProps.store.layoutRows
);
export default HexScrollBar;
