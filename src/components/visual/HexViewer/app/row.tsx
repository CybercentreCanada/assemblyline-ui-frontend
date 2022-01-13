import React, { useMemo } from 'react';
import { HexItem, StoreState } from '..';

export type HexRowProps = {
  isLightTheme?: boolean;
  initialized?: boolean;
  rowIndexes?: Array<number>;
  store?: StoreState;
  getValue?: (index: number) => string;
  getColorClass?: (index: number) => string;
  getBorderClass?: (index: number) => string;
  getCursorClass?: (index: number) => string;
  getSelectClass?: (index: number) => string;
  getSearchClass?: (index: number) => string;
  getSelectedSearchClass?: (index: number) => string;
};

export const WrappedHexRow = ({
  isLightTheme,
  initialized,
  rowIndexes,
  store,
  getValue = (index: number) => null,
  getColorClass = (index: number) => null,
  getBorderClass = (index: number) => null,
  getCursorClass = (index: number) => null,
  getSelectClass = (index: number) => null,
  getSearchClass = (index: number) => null,
  getSelectedSearchClass = (index: number) => null
}: HexRowProps) => {
  const itemValues: Array<string> = useMemo(() => rowIndexes.map(index => getValue(index)), [getValue, rowIndexes]);

  const colorClasses: Array<string> = useMemo(
    () => rowIndexes.map(index => getColorClass(index)),
    [rowIndexes, getColorClass]
  );
  const cursorClasses: Array<string> = useMemo(
    () => rowIndexes.map(index => getCursorClass(index)),
    [rowIndexes, getCursorClass]
  );
  const selectClasses: Array<string> = useMemo(
    () => rowIndexes.map(index => getSelectClass(index)),
    [rowIndexes, getSelectClass]
  );
  const searchClasses: Array<string> = useMemo(
    () => rowIndexes.map(index => getSearchClass(index)),
    [rowIndexes, getSearchClass]
  );
  const selectedSearchClasses: Array<string> = useMemo(
    () => rowIndexes.map(index => getSelectedSearchClass(index)),
    [rowIndexes, getSelectedSearchClass]
  );

  return (
    <div>
      {rowIndexes.map((index, j) => (
        <HexItem
          key={index}
          store={store}
          index={index}
          value={itemValues[j]}
          colorClass={colorClasses[j]}
          cursorClass={cursorClasses[j]}
          selectClass={selectClasses[j]}
          searchClass={searchClasses[j]}
          selectedSearchClass={selectedSearchClasses[j]}
          isLightTheme={isLightTheme}
          initialized={initialized}
        />
      ))}
    </div>
  );
};

export const HexRow = React.memo(
  WrappedHexRow,
  (
    prevProps: Readonly<React.PropsWithChildren<HexRowProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexRowProps>>
  ) =>
    prevProps.rowIndexes[0] === nextProps.rowIndexes[0] &&
    prevProps.rowIndexes.length === nextProps.rowIndexes.length &&
    prevProps.initialized === nextProps.initialized &&
    prevProps.isLightTheme === nextProps.isLightTheme
);
