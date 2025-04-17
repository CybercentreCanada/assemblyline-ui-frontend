/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { styled } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';
import { memo, ReactElement, useCallback } from 'react';
import { LineItem } from '../item/ListItemBase';

type ItemProps = {
  divider?: boolean;
  hover?: boolean;
};

const Item = styled('div', {
  shouldForwardProp: prop => prop !== 'divider' && prop !== 'hover'
})<ItemProps>(({ theme, divider, hover }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&[data-listitem-focus="true"]': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.25)
        : darken(theme.palette.background.default, 0.25)
  },
  '&[data-listitem-selected="true"]': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.025)
        : darken(theme.palette.background.default, 0.025)
  },

  ...(divider && {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider
  }),

  ...(hover && {
    '& $actions': {
      display: 'none',
      verticalAlign: 'center'
    },
    '&:hover': {
      cursor: 'pointer',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.background.default, 0.05)
          : darken(theme.palette.background.default, 0.05)
    },
    '&:hover $actions': {
      display: 'inherit'
    }
  })
}));

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
  const onClick = useCallback(() => {
    if (onSelection) {
      onSelection(item, index);
    }
  }, [onSelection, item, index]);

  return (
    <Item
      hover={!noHover}
      divider={!noDivider}
      data-listitem-position={index}
      data-listitem-selected={selected}
      onClick={onClick}
    >
      <div>{children(item, index)}</div>
      {onRenderActions && (
        <div
          onClick={event => event.stopPropagation()}
          style={{ position: 'absolute', right: 0, backgroundColor: 'inherit', margin: 'auto' }}
        >
          {onRenderActions(item, index)}
        </div>
      )}
    </Item>
  );
};

export default memo(TableListItem);
