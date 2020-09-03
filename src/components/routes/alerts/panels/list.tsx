import { Box, Divider, makeStyles, useTheme } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import React, { useState } from 'react';
import { isArrowDown, isArrowUp, isEnter } from './keyboard';
import Throttler from './throttler';

const useStyles = makeStyles(theme => ({
  list: {
    '&:focus': { outline: 'none' }
  },
  listItem: {
    // minHeight: theme.spacing(5),
    padding: theme.spacing(2),
    // margin: theme.spacing(1),
    wordBreak: 'break-all',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]
    },
    '&[data-listitemselected="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]
    }
  }
}));

export interface ListItemProps {
  id: number | string;
}

interface ListProps<I extends ListItemProps> {
  loading?: boolean;
  selected?: number | string;
  onKeyDown?: (keyCode: number, items: I[], selectedId: string | number) => void;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: I) => React.ReactNode;
  items: I[];
}

List.defaultProps = {
  selected: null,
  loading: false,
  onKeyDown: () => null
};

export default function List<I extends ListItemProps>({
  loading,
  selected,
  items,
  onRenderItem,
  onItemSelected,
  onKeyDown
}: ListProps<I>) {
  // Setup hooks.
  const [cursor, setCursor] = useState<number>(-1);
  const classes = useStyles();

  // Function throttler to streamline keydown event handlers.
  const throttler = new Throttler(10);

  // key_hander:keyup
  const _onKeyUp = (event: React.KeyboardEvent) => {};

  // key_hander:keydown
  const _onKeyDown = (event: React.KeyboardEvent) => {
    // console.log(`kd[${event.keyCode}]`);
    const { keyCode } = event;

    if (isArrowUp(keyCode) || isArrowDown(keyCode)) {
      _onKeyDownThrottled(keyCode);
    } else if (isEnter(keyCode)) {
      onSelection(items[cursor], cursor);
    }

    onKeyDown(keyCode, items, selected);
  };

  // throttled keydown handler.
  const _onKeyDownThrottled = (keyCode: number) => {
    throttler.throttle(() => {
      if (isArrowUp(keyCode)) {
        const nextIndex = cursor - 1 >= 0 ? cursor - 1 : items.length - 1;
        setCursor(nextIndex);
      } else if (isArrowDown(keyCode)) {
        const nextIndex = cursor + 1 < items.length ? cursor + 1 : 0;
        setCursor(nextIndex);
      }
    });
  };

  // Items selection handler.
  const onSelection = (item, i) => {
    setCursor(i);
    onItemSelected(item);
  };

  // If its loading show skeleton of list.
  if (loading) {
    return <ListSkeleton />;
  }

  // Render the List component.
  return (
    <Box tabIndex={-1} onKeyUp={_onKeyUp} onKeyDown={_onKeyDown} className={classes.list}>
      {items.map((item, i) => (
        <Box mr={0}>
          <Box
            key={item.id}
            className={classes.listItem}
            onClick={() => onSelection(item, i)}
            data-listposition={i}
            data-listitemselected={i === cursor || item.id === selected}
          >
            {onRenderItem(item)}
          </Box>
          <Divider />
        </Box>
      ))}
    </Box>
  );
}

// List skeleton component.
const ListSkeleton = () => {
  const theme = useTheme();
  return (
    <Box p={0} m={0}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <Box key={i}>
          <Skeleton height={theme.spacing(5)} animation="wave" />
        </Box>
      ))}
    </Box>
  );
};
