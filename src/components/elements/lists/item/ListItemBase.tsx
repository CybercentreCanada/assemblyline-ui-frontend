/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Divider, IconButtonProps } from '@material-ui/core';
import useListStyles from 'commons/components/elements/lists/hooks/useListStyles';
import React, { useCallback } from 'react';

export interface LineItem {
  id: number | string;
}

export interface LineItemAction {
  icon: React.ReactNode;
  props: IconButtonProps;
}

export interface ListItemBaseProps {
  index: number;
  item: LineItem;
  height?: string | number;
  selected: boolean;
  noDivider?: boolean;
  children: (item: LineItem) => React.ReactNode;
  onClick: (item: LineItem, index: number) => void;
  onRenderActions?: (item: LineItem) => React.ReactNode;
}

const ListItemBase: React.FC<ListItemBaseProps> = React.memo(
  ({ selected, item, index, height, noDivider = false, children, onRenderActions, onClick }) => {
    const { listItemClasses: classes } = useListStyles();

    const _onClick = useCallback(() => {
      if (onClick) {
        onClick(item, index);
      }
    }, [onClick, item, index]);

    // console.log(`rendering: ${index}`);

    const onItemActionsClick = useCallback(event => event.stopPropagation(), []);

    return (
      <div
        className={classes.itemCt}
        data-listitem-position={index}
        data-listitem-selected={selected}
        data-listitem-focus="false"
        onClick={_onClick}
        style={{ height }}
      >
        {children(item)}
        <div className={classes.itemDivider} style={{ display: noDivider ? 'none' : null }}>
          <Divider />
        </div>
        <div className={classes.itemActions} onClick={onItemActionsClick}>
          {onRenderActions && onRenderActions(item)}
        </div>
      </div>
    );
  }
);

export default ListItemBase;
