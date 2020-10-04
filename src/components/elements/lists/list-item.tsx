/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Divider } from '@material-ui/core';
import React from 'react';
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
  onClick?: (item: LineItem) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
}

const ListRow: React.FC<ListRowProps> = ({ loaded, selected, item, index, rowHeight, onClick, onRenderRow }) => {
  const { listItemClasses: classes } = useListStyles();
  return (
    <div
      className={classes.itemCt}
      data-listitem-position={index}
      data-listitem-selected={selected}
      data-listitem-focus="false"
      onClick={onClick ? () => onClick(item) : null}
    >
      <div className={classes.itemOuter} style={{ height: !loaded ? rowHeight : null }}>
        <div className={classes.itemInner}>{loaded ? onRenderRow(item) : '...loading'}</div>
      </div>
      <div className={classes.itemDivider}>
        <Divider />
      </div>
    </div>
  );
};

export default ListRow;
