import clsx from 'clsx';
import { HexStore, useStyles } from 'components/visual/HexViewer';
import React, { useCallback, useMemo } from 'react';

export const WrappedHexOffsets = ({ layoutRows, layoutColumns, hexBase, hexOffsetBase, scrollIndex }: HexStore) => {
  const { hexClasses } = useStyles();

  const offsets = useMemo(() => Array.from(Array(layoutRows).keys()), [layoutRows]);

  const getOffset = useCallback(
    (_index: number, _layoutColumns: number, _hexBase: number, _hexOffsetBase: number) =>
      (_index * _layoutColumns).toString(_hexBase).toUpperCase().padStart(_hexOffsetBase, '0') + '\n',
    []
  );

  return (
    <div className={clsx(hexClasses.container, hexClasses.offsets)}>
      {offsets.map(index => (
        <div key={index + scrollIndex}>{getOffset(index + scrollIndex, layoutColumns, hexBase, hexOffsetBase)}</div>
      ))}
    </div>
  );
};
export const HexOffsets = React.memo(
  WrappedHexOffsets,
  (prevProps: Readonly<HexStore>, nextProps: Readonly<HexStore>) =>
    prevProps.layoutRows === nextProps.layoutRows &&
    prevProps.layoutColumns === nextProps.layoutColumns &&
    prevProps.hexBase === nextProps.hexBase &&
    prevProps.hexOffsetBase === nextProps.hexOffsetBase &&
    prevProps.scrollIndex === nextProps.scrollIndex
);
export default HexOffsets;
