/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress } from '@material-ui/core';
import React, { useCallback, useRef } from 'react';
import useListKeyboard from '../hooks/useListKeyboard';
import useListStyles from '../hooks/useListStyles';
import ListRow, { LineItem } from '../list-item';

interface InfinitelistProps {
  loading: boolean;
  threshold?: number;
  items: LineItem[];
  onItemSelected: (item: LineItem) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
  onLoadNext: () => void;
}

const Infinitelist: React.FC<InfinitelistProps> = ({
  loading,
  items,
  threshold = 10,
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

    // how much we have to go until scroll is at bottom.
    const rH = tH - cP;

    // if withing threshold, load more items.
    if (rH <= threshold && !loading) {
      onLoadNext();
    }
  };

  return (
    <div ref={outerEL} className={classes.outer} onScroll={onScroll}>
      {loading && (
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
