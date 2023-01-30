import { Divider, IconButtonProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { memo, useCallback } from 'react';

const useStyles = makeStyles(theme => ({
  itemCt: {
    position: 'relative',
    '&:hover': {
      cursor: 'pointer'
    },
    '&:hover $itemActions': {
      display: 'inherit'
    }
  },
  backgrounds: {
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 19%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitem-focus="true"]': {
      backgroundColor: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 19%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitem-selected="true"]': {
      backgroundColor: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 92%)'
    }
  },
  outer: {
    position: 'relative',
    overflow: 'auto'
  },
  inner: {},
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  itemActions: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    display: 'none',
    backgroundColor: 'inherit',
    '& button': {
      marginRight: theme.spacing(1),
      boxShadow: theme.shadows[2]
    }
  },
  card: {
    backgroundColor: grey[theme.palette.mode === 'dark' ? 900 : 100]
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
  // MUI styles.
  const classes = useStyles();

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
    <div
      className={`${classes.itemCt} ${!disableBackgrounds && classes.backgrounds}  ${card && classes.card}`}
      data-listitem-position={index}
      data-listitem-selected={selected}
      data-listitem-focus="false"
      onClick={_onClick}
      style={{ height }}
    >
      {children(item)}
      <div className={classes.divider} style={{ display: noDivider ? 'none' : null }}>
        <Divider />
      </div>
      <div className={classes.itemActions} onClick={onItemActionsClick}>
        {onRenderActions && onRenderActions(item, index)}
      </div>
    </div>
  );
};
export default memo(ListItemBase);
