/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress } from '@material-ui/core';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import useListKeyboard from '../hooks/useListKeyboard';
import useListStyles from '../hooks/useListStyles';
import ListRow, { LineItem } from '../list-item';

interface InfinitelistProps {
  loading: boolean;
  threshold?: number;
  disableProgress?: boolean;
  scrollReset?: boolean;
  items: LineItem[];
  onItemSelected: (item: LineItem) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
  onLoadNext: () => void;
}

const Infinitelist: React.FC<InfinitelistProps> = ({
  loading,
  items,
  disableProgress = false,
  threshold = 75,
  scrollReset = false,
  onItemSelected,
  onRenderRow,
  onLoadNext
}) => {
  const { infinitelistClases: classes } = useListStyles();
  const { cursor, setCursor, onKeyDown } = useListKeyboard({
    infinite: true,
    count: items.length,
    onEscape: () => onItemSelected(null),
    onEnter: (_cursor: number) => onItemSelected(items[_cursor])
  });

  const outerEL = useRef<HTMLDivElement>();
  const innerEL = useRef<HTMLDivElement>();

  const _onRowClick = useCallback(
    (item: LineItem, index: number) => {
      setCursor(index);
      onItemSelected(item);
    },
    [setCursor, onItemSelected]
  );

  const onScroll = () => {
    // compute frame.
    const fH = outerEL.current.getBoundingClientRect().height;
    const sT = innerEL.current.scrollTop;
    const tH = innerEL.current.scrollHeight;
    const cP = sT + fH;
    const scrollPerc = Math.ceil((cP / tH) * 100);
    if (scrollPerc >= threshold && !loading) {
      onLoadNext();
    }
  };

  useLayoutEffect(() => {
    if (scrollReset) {
      innerEL.current.scrollTo({ top: 0 });
    }
  }, [scrollReset]);

  return (
    <div ref={outerEL} className={classes.outer} onScroll={!loading ? onScroll : null}>
      {loading && !disableProgress && (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      )}
      <div ref={innerEL} className={classes.inner} tabIndex={0} onKeyDown={onKeyDown}>
        {items.map((item, index) => (
          <ListRow
            key={`list.rowitem[${index}]`}
            loaded
            index={index}
            selected={cursor === index}
            item={item}
            onClick={_onRowClick}
            onRenderRow={onRenderRow}
          />
        ))}
      </div>
    </div>
  );
};

export default Infinitelist;
