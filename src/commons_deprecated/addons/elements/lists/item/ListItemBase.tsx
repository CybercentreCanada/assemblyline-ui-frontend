/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Divider, IconButtonProps } from '@mui/material';
import useListStyles from 'commons_deprecated/addons/elements/lists/hooks/useListStyles';
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
  card?: boolean;
  noDivider?: boolean;
  disableBackgrounds?: boolean;
  children: (item: LineItem) => React.ReactNode;
  onClick: (item: LineItem, index: number) => void;
  onRenderActions?: (item: LineItem, index?: number) => React.ReactNode;
}

const ListItemBase: React.FC<ListItemBaseProps> = React.memo(
  ({ selected, item, index, height, card, noDivider, disableBackgrounds, children, onRenderActions, onClick }) => {
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
        className={`${classes.itemCt} ${!disableBackgrounds && classes.itemDefaultBackgrounds} ${
          card && classes.cardItemBackground
        }`}
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
          {onRenderActions && onRenderActions(item, index)}
        </div>
      </div>
    );
  }
);

export default ListItemBase;
