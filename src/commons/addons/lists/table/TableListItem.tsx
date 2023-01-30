/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { memo, ReactElement, useCallback } from 'react';
import { LineItem } from '../item/ListItemBase';
import { useItemStyles } from './useStyles';

export interface TableListItemStyleProps {
  rowHover?: boolean;
  hoverCss?: string;
}

interface TableListItemProps<T extends LineItem> {
  item: T;
  index: number;
  itemCount: number;
  selected?: boolean;
  noHover?: boolean;
  noDivider?: boolean;
  onSelection?: (item: T, rowIndex?: number) => void;
  onRenderActions?: (item: T, rowIndex?: number) => ReactElement;
  children: (item: T, index: number) => ReactElement;
}

const TableListItem = <T extends LineItem>({
  item,
  index,
  itemCount,
  selected,
  noHover,
  noDivider,
  onSelection,
  onRenderActions,
  children
}: TableListItemProps<T>) => {
  const classes = useItemStyles();

  const buildStyles = useCallback(() => {
    const itemClasses = [classes.item];
    if (!noHover) {
      itemClasses.push(classes.itemHover);
    }
    if (!noDivider && index < itemCount - 1) {
      itemClasses.push(classes.itemDivider);
    }
    return itemClasses.join(' ');
  }, [noHover, noDivider, index, itemCount, classes]);

  const onClick = useCallback(() => {
    if (onSelection) {
      onSelection(item, index);
    }
  }, [onSelection, item, index]);

  return (
    <div className={buildStyles()} data-listitem-position={index} data-listitem-selected={selected} onClick={onClick}>
      <div className={classes.children}>{children(item, index)}</div>
      {onRenderActions && (
        <div className={classes.actions} onClick={event => event.stopPropagation()}>
          {onRenderActions(item, index)}
        </div>
      )}
    </div>
  );
};

export default memo(TableListItem);
