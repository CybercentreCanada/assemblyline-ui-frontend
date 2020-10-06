/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Divider } from '@material-ui/core';
import React, { useCallback } from 'react';
import useListStyles from './hooks/useListStyles';

export interface LineItem {
  id: number | string;
}

interface ListRowProps {
  index: number;
  loaded: boolean;
  item: LineItem;
  selected: boolean;
  rowHeight?: number;
  onClick: (item: LineItem, index: number) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
}

const ListRow: React.FC<ListRowProps> = React.memo(
  ({ loaded, selected, item, index, rowHeight, onClick, onRenderRow }) => {
    const { listItemClasses: classes } = useListStyles();

    const _onClick = useCallback(() => {
      if (onClick) {
        onClick(item, index);
      }
    }, [onClick, item, index]);

    // console.log(`rendering: ${index}`);

    return (
      <div
        className={classes.itemCt}
        data-listitem-position={index}
        data-listitem-selected={selected}
        data-listitem-focus="false"
        onClick={_onClick}
      >
        <div className={classes.itemOuter} style={{ height: !loaded ? rowHeight : null }}>
          <div className={classes.itemInner}>{loaded ? onRenderRow(item) : '...loading'}</div>
        </div>
        <div className={classes.itemDivider}>
          <Divider />
        </div>
      </div>
    );
  }
);

export default ListRow;
