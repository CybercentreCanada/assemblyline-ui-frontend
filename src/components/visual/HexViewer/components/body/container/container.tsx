import { HexStore } from 'components/visual/HexViewer';
import React, { useMemo } from 'react';
import { HexRow } from '.';

export type HexContainerProps = {
  isLightTheme?: boolean;
  isSliding?: boolean;
  initialized?: boolean;
  containerRef?: React.MutableRefObject<any>;
  containerClass?: string;
  store?: HexStore;
  values?: Map<number, string>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  getValue?: (index: number) => string;
  getColorClass?: (index: number) => string;
  getBorderClass?: (index: number) => string;
  getCursorClass?: (index: number) => string;
  getSelectClass?: (index: number) => string;
  getSearchClass?: (index: number) => string;
  getSelectedSearchClass?: (index: number) => string;
};

export const WrappedHexContainer = ({
  isLightTheme,
  initialized,
  containerRef,
  containerClass,
  store,
  values,
  onMouseEnter,
  onMouseLeave,
  getValue,
  getColorClass,
  getBorderClass,
  getCursorClass,
  getSelectClass,
  getSearchClass,
  getSelectedSearchClass
}: HexContainerProps) => {
  const { layoutRows, layoutColumns, scrollIndex } = store;
  const hexIndex: number = useMemo(() => scrollIndex * layoutColumns, [layoutColumns, scrollIndex]);
  const indexes: Array<Array<number>> = useMemo(() => {
    let array = [];
    for (let i = 0; i < layoutRows; i++) {
      let row = [];
      for (let j = 0; j < layoutColumns; j++) row.push(i * layoutColumns + j);
      array.push(row);
    }
    return array;
  }, [layoutColumns, layoutRows]);

  return (
    <div ref={containerRef} className={containerClass} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {indexes.map(rowIndexes => (
        <HexRow
          key={rowIndexes[0] + hexIndex}
          initialized={initialized}
          isLightTheme={isLightTheme}
          rowIndexes={rowIndexes.map(index => index + hexIndex)}
          store={store}
          getValue={getValue}
          getColorClass={getColorClass}
          getBorderClass={getBorderClass}
          getCursorClass={getCursorClass}
          getSelectClass={getSelectClass}
          getSearchClass={getSearchClass}
          getSelectedSearchClass={getSelectedSearchClass}
        />
      ))}
    </div>
  );
};

export const HexContainer = React.memo(
  WrappedHexContainer,
  (
    prevProps: Readonly<React.PropsWithChildren<HexContainerProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexContainerProps>>
  ) =>
    nextProps.isSliding ||
    (prevProps.store.layoutRows === nextProps.store.layoutRows &&
      prevProps.store.layoutColumns === nextProps.store.layoutColumns &&
      prevProps.store.scrollIndex === nextProps.store.scrollIndex &&
      prevProps.store.initialized === nextProps.store.initialized &&
      prevProps.isLightTheme === nextProps.isLightTheme)
);
