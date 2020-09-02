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
  const [cursor, setCursor] = useState<number>(-1);
  const classes = useStyles();
  const throttler = new Throttler(10);

  const _onKeyUp = (event: React.KeyboardEvent) => {};

  const _onKeyDown = (event: React.KeyboardEvent) => {
    console.log(`kd[${event.keyCode}]`);
    const { keyCode } = event;

    if (isArrowUp(keyCode) || isArrowDown(keyCode)) {
      throttler.throttle(() => {
        if (isArrowUp(keyCode)) {
          const nextIndex = cursor - 1 >= 0 ? cursor - 1 : items.length - 1;
          setCursor(nextIndex);
        } else if (isArrowDown(keyCode)) {
          const nextIndex = cursor + 1 < items.length ? cursor + 1 : 0;
          setCursor(nextIndex);
        }
      });
    } else if (isEnter(keyCode)) {
      onSelection(items[cursor], cursor);
    }

    onKeyDown(keyCode, items, selected);
  };

  const onSelection = (item, i) => {
    setCursor(i);
    onItemSelected(item);
  };

  //
  if (loading) {
    return <ListSkeleton />;
  }

  //
  return (
    <Box tabIndex={-1} onKeyUp={_onKeyUp} onKeyDown={_onKeyDown} className={classes.list}>
      {items.map((item, i) => (
        <Box
          key={item.id}
          className={classes.listItem}
          onClick={() => onSelection(item, i)}
          data-listposition={i}
          data-listitemselected={i === cursor || item.id === selected}
        >
          {onRenderItem(item)}
          <Divider />
        </Box>
      ))}
    </Box>
  );
}

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
