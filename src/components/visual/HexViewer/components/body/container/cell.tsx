import clsx from 'clsx';
import { HexStore, useCursor, useHover, useSearch, useSelect } from 'components/visual/HexViewer';
import React from 'react';

export type HexCellProps = {
  store?: HexStore;
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

export const WrappedHexCell = ({
  store = null,
  index = 0,
  value = '',
  colorClass = '',
  borderClass = '',
  cursorClass = '',
  selectClass = '',
  searchClass = '',
  selectedSearchClass = ''
}: HexCellProps) => {
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
        onHoverMouseDown();
        onCursorMouseDown(index);
        onSelectMouseDown(index);
        onSearchMouseDown(index);
      }}
    >
      {value}
    </div>
  ) : null;
};

export const HexCell = React.memo(
  WrappedHexCell,
  (
    prevProps: Readonly<React.PropsWithChildren<HexCellProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexCellProps>>
  ) =>
    prevProps.value === nextProps.value &&
    prevProps.index === nextProps.index &&
    prevProps.isLightTheme === nextProps.isLightTheme &&
    prevProps.initialized === nextProps.initialized
);
