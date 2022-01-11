import clsx from 'clsx';
import React from 'react';
import { StoreState, useCursor, useHover, useSearch, useSelect } from '..';

export type HexItemProps = {
  store?: StoreState;
  index?: number;
  value?: string;
  colorClass?: string;
  borderClass?: string;
  cursorClass?: string;
  selectClass?: string;
  searchClass?: string;
  selectedSearchClass?: string;
  isLightTheme?: boolean;
  initialized?: boolean;
  getColorClass?: (value: string) => string;
};

export const WrappedHexItem = ({
  store = null,
  index = 0,
  value = '',
  colorClass = '',
  borderClass = '',
  cursorClass = '',
  selectClass = '',
  searchClass = '',
  selectedSearchClass = ''
}: // isLightTheme = false
HexItemProps) => {
  const { onHoverMouseEnter, onHoverMouseLeave, onHoverMouseDown } = useHover();
  const { onCursorMouseDown, onCursorMouseEnter } = useCursor();
  const { onSelectMouseEnter, onSelectMouseDown } = useSelect();
  const { onSearchMouseDown } = useSearch();

  return value ? (
    <div
      data-index={index}
      className={clsx(colorClass, borderClass, cursorClass, selectClass, searchClass, selectedSearchClass)}
      onMouseEnter={event => {
        onHoverMouseEnter(index);
        onCursorMouseEnter(index);
        onSelectMouseEnter(index);
      }}
      onMouseLeave={event => onHoverMouseLeave(index)}
      onMouseDown={event => {
        // event.preventDefault();
        onHoverMouseDown();
        onCursorMouseDown(index);
        onSelectMouseDown(index);
        onSearchMouseDown(index);
      }}
      onMouseUp={event => {
        // event.preventDefault();
        // onHoverMouseUp();
        // onCursorMouseUp(store);
        // onSelectMouseUp(store);
      }}
    >
      {value}
    </div>
  ) : null;
};

export const HexItem = React.memo(
  WrappedHexItem,
  (
    prevProps: Readonly<React.PropsWithChildren<HexItemProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexItemProps>>
  ) =>
    prevProps.value === nextProps.value &&
    prevProps.index === nextProps.index &&
    // prevProps.colorClass === nextProps.colorClass &&
    // prevProps.borderClass === nextProps.borderClass &&
    // prevProps.cursorClass === nextProps.cursorClass &&
    // prevProps.selectClass === nextProps.selectClass &&
    // prevProps.searchClass === nextProps.searchClass &&
    prevProps.isLightTheme === nextProps.isLightTheme &&
    prevProps.initialized === nextProps.initialized
);
