import { Box, Divider, makeStyles, useTheme } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import React, { useState } from 'react';
import { isArrowDown, isArrowUp, isEnter } from './keyboard';
import Throttler from './throttler';

const useStyles = makeStyles(theme => ({
  list: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'auto',
    width: '100%',
    '&:focus': { outline: 'none' }
  },
  listContent: {
    flex: '1 1 auto'
  },
  listItem: {
    padding: theme.spacing(2),
    wordBreak: 'break-all',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitemfocus="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitemselected="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 92%)'
    }
  }
}));

export interface ListItemProps {
  id: number | string;
}

interface ListProps<I extends ListItemProps> {
  loading?: boolean;
  selected?: number | string;
  items: I[];
  onKeyDown?: (keyCode: number, items: I[], selectedId: string | number) => void;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: I) => React.ReactNode;
  onScrollAtTop?: () => void;
  onScrollAtBottom?: () => void;
}

List.defaultProps = {
  selected: null,
  loading: false,
  onKeyDown: () => null,
  onScrollAtTop: () => null,
  onScrollAtBottom: () => null
};

export default function List<I extends ListItemProps>({
  loading,
  selected,
  items,
  onRenderItem,
  onItemSelected,
  onKeyDown,
  onScrollAtTop,
  onScrollAtBottom
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
    //
    event.preventDefault();
    // console.log(`kd[${event.keyCode}]`);
    // const { currentTarget } = event;
    const { keyCode } = event;

    if (isArrowUp(keyCode) || isArrowDown(keyCode)) {
      _onKeyDownThrottled(keyCode, event.currentTarget as HTMLDivElement);
    } else if (isEnter(keyCode)) {
      onSelection(items[cursor], cursor);
    }

    onKeyDown(keyCode, items, selected);
  };

  // throttled keydown handler.
  const _onKeyDownThrottled = (keyCode: number, target: HTMLDivElement) => {
    throttler.throttle(() => {
      if (isArrowUp(keyCode)) {
        const nextIndex = cursor - 1 >= 0 ? cursor - 1 : items.length - 1;
        setCursor(nextIndex);
        scrollSelection(target, nextIndex);
      } else if (isArrowDown(keyCode)) {
        const nextIndex = cursor + 1 < items.length ? cursor + 1 : 0;
        setCursor(nextIndex);
        scrollSelection(target, nextIndex);
      }
    });
  };

  const _onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { currentTarget } = event;
    const cH = currentTarget.getBoundingClientRect().height;
    const sT = currentTarget.scrollTop;
    const sH = currentTarget.scrollHeight;

    console.log(currentTarget.scrollHeight);
    const currentPosition = cH + sT;

    if (currentPosition >= sH) {
      console.log('We go to the bottom of things...');
      onScrollAtTop();
    } else if (sT === 0) {
      console.log('We at the to of it.');
      onScrollAtBottom();
    }
  };

  // Ensure the list element at specified position is into view.
  const scrollSelection = (target: HTMLDivElement, position: number) => {
    target.querySelector(`[data-listposition="${position}"`).scrollIntoView({ block: 'nearest' });
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
    <Box tabIndex={-1} onKeyUp={_onKeyUp} onKeyDown={_onKeyDown} className={classes.list} onScroll={_onScroll}>
      <div className={classes.listContent}>
        {items.map((item, i) => (
          <Box mr={0} key={item.id}>
            <Box
              className={classes.listItem}
              onClick={() => onSelection(item, i)}
              data-listposition={i}
              data-listitemselected={item.id === selected}
              data-listitemfocus={i === cursor}
            >
              {onRenderItem(item)}
            </Box>
            <Divider />
          </Box>
        ))}
      </div>
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
