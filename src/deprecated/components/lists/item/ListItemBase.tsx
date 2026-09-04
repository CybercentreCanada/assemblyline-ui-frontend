import type { IconButtonProps } from '@mui/material';
import { Divider, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import { memo, useCallback } from 'react';

type ItemProps = {
  disableBackgrounds?: boolean;
  card?: boolean;
};

const Item = styled('div', {
  shouldForwardProp: prop => prop !== 'disableBackgrounds' && prop !== 'card'
})<ItemProps>(({ theme, disableBackgrounds, card }) => ({
  position: 'relative',
  ['&:hover']: {
    cursor: 'pointer',
    ...(!disableBackgrounds && {
      backgroundColor: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 19%)' : 'hsl(0, 0%, 95%)'
    })
  },

  ['&:hover .itemActions']: {
    display: 'inherit'
  },

  ...(!disableBackgrounds && {
    '&[data-listitem-focus="true"]': {
      backgroundColor: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 19%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitem-selected="true"]': {
      backgroundColor: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 92%)'
    }
  }),

  ...(card && {
    backgroundColor: grey[theme.palette.mode === 'dark' ? 900 : 100]
  })
}));

const DividerContainer = styled('div')(() => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0
}));

const ItemActions = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: 'none',
  backgroundColor: 'inherit',
  '& button': {
    marginRight: theme.spacing(1),
    boxShadow: theme.shadows[2]
  }
}));

export interface LineItem {
  index?: number;
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

const ListItemBase = ({
  selected,
  item,
  index,
  height,
  card,
  noDivider,
  disableBackgrounds,
  children,
  onRenderActions,
  onClick
}: ListItemBaseProps) => {
  // Item click handler.
  const _onClick = useCallback(() => {
    if (onClick) {
      onClick(item, index);
    }
  }, [onClick, item, index]);

  // Ensure clicking on action items container doesn't trigger item click handler
  const onItemActionsClick = useCallback(event => event.stopPropagation(), []);

  // console.log(`rendering: ${index}`);

  return (
    <Item
      disableBackgrounds={disableBackgrounds}
      card={card}
      data-listitem-position={index}
      data-listitem-selected={selected}
      data-listitem-focus="false"
      onClick={_onClick}
      style={{ height }}
    >
      {children(item)}
      <DividerContainer style={{ display: noDivider ? 'none' : null }}>
        <Divider />
      </DividerContainer>
      <ItemActions className="itemActions" onClick={onItemActionsClick}>
        {onRenderActions && onRenderActions(item, index)}
      </ItemActions>
    </Item>
  );
};
export default memo(ListItemBase);
