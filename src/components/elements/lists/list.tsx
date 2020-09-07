import { Box, Divider, LinearProgress, makeStyles, useTheme } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import React, { useRef, useState } from 'react';
import { isArrowDown, isArrowUp, isEnter } from '../keyboard';
import Throttler from '../throttler';

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
  },
  progressCt: {
    display: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: theme.palette.background.default
  },
  progress: {
    height: 10,
    backgroundColor: theme.palette.background.default
  }
}));

export interface ListItemProps {
  id: number | string;
}

export interface ListPage<I extends ListItemProps> {
  index: number;
  items: I[];
}

interface ListProps<I extends ListItemProps> {
  loading?: boolean;
  selected?: number | string;
  page: ListPage<I>;
  onKeyDown?: (keyCode: number, page: ListPage<I>, selectedId: string | number) => void;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: I) => React.ReactNode;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

List.defaultProps = {
  selected: null,
  loading: false,
  onKeyDown: () => null,
  onNextPage: () => null,
  onPreviousPage: () => null
};

export default function List<I extends ListItemProps>({
  loading,
  selected,
  page,
  onRenderItem,
  onItemSelected,
  onKeyDown,
  onNextPage,
  onPreviousPage
}: ListProps<I>) {
  // Setup hooks.

  const classes = useStyles();
  const [cursor, setCursor] = useState<number>(-1);
  const listEl = useRef<HTMLDivElement>();
  const maskEl = useRef<HTMLDivElement>();

  // Function throttler to streamline keydown event handlers.
  const throttler = new Throttler(10);

  // key_hander:keyup
  const _onKeyUp = (event: React.KeyboardEvent) => {};

  // key_hander:keydown
  const _onKeyDown = (event: React.KeyboardEvent) => {
    // Prevent default browser key events in order to ensure
    //  they don't interfere with our own scrolling events.
    event.preventDefault();
    // Don't do anything while loading.
    if (!loading) {
      // Custom key handlers.
      const { keyCode } = event;
      if (isArrowUp(keyCode) || isArrowDown(keyCode)) {
        // Here we handle our custom scrolls and cursor item selection.
        _onKeyDownThrottled(keyCode, event.currentTarget as HTMLDivElement);
      } else if (isEnter(keyCode)) {
        // [ENTER]: select the cursor item.
        onSelection(page.items[cursor], cursor);
      }
      onKeyDown(keyCode, page, selected);
    }
  };

  // throttled keydown handler.
  const _onKeyDownThrottled = (keyCode: number, target: HTMLDivElement) => {
    // This will ensure that users who hold down UP/DOWN arrow key don't overload
    //  react with constant stream of keydown events.
    // We'll process on event every 10ms and throw away the rest.
    throttler.throttle(() => {
      if (isArrowUp(keyCode)) {
        const nextIndex = cursor - 1 > -1 ? cursor - 1 : page.items.length - 1;
        setCursor(nextIndex);
        scrollSelection(target, nextIndex);
      } else if (isArrowDown(keyCode)) {
        const nextIndex = cursor + 1 < page.items.length ? cursor + 1 : 0;
        setCursor(nextIndex);
        scrollSelection(target, nextIndex);
      }
    });
  };

  // scroll_handler: this is where we deal with infinite_scroll paging.
  // const _onScroll = (event: React.MouseEvent<HTMLDivElement>) => {
  // console.log('scrolling...');
  // const { currentTarget: target } = event;
  // const cH = target.getBoundingClientRect().height;
  // const cTH = target.scrollHeight;
  // const sT = target.scrollTop;
  // const cP = cH + sT;
  // if (cP === cTH) {
  //   nextPage(target);
  // } else if (sT === 0 && page.index > 0) {
  //   previousPage(target);
  // }
  // };

  // // Handler when reaching bottom of scrollable height.
  // // [scrollTop = 1] to prevent top handler to trigger.
  // const nextPage = (target: HTMLDivElement) => {
  //   showProgress();
  //   updateCursor(0);
  //   onNextPage();
  //   target.scrollTo({ top: 1 });
  // };

  // // Handler when reaching top of scrollable height.
  // // [scrollTop = sH - 1] to prevent bottom handler to trigger.
  // const previousPage = (target: HTMLDivElement) => {
  //   // NOTE: cTH is not the srollable height, but rather the height of container
  //   //  plus the scollable area.
  //   // Therefore scrollable area is [cTH - cH].
  //   if (page.index > 0) {
  //     showProgress();
  //     const cH = target.getBoundingClientRect().height;
  //     const cTH = target.scrollHeight;
  //     const sH = cTH - cH;
  //     updateCursor(page.items.length - 1);
  //     onPreviousPage();
  //     target.scrollTo({ top: sH - 1 });
  //   }
  // };.

  // Ensure the list element at specified position is into view.
  const scrollSelection = (target: HTMLDivElement, position: number) => {
    target.querySelector(`[data-listposition="${position}"`).scrollIntoView({ block: 'nearest' });
  };

  const showProgress = () => {
    // if (listEl.current) {
    //   listEl.current.style.overflow = 'hidden';
    // }
    if (maskEl.current) {
      maskEl.current.style.display = 'block';
    }
  };

  const hideProgress = () => {
    // if (listEl.current) {
    //   listEl.current.style.overflow = 'auto';
    // }
    if (maskEl.current) {
      maskEl.current.style.display = 'none';
      // maskEl.current.style.zIndex = '-1';
    }
  };

  // Items selection handler.
  const onSelection = (item, i) => {
    setCursor(i);
    onItemSelected(item);
  };

  // If its loading show skeleton of list.
  if (loading && page.index === -1) {
    return <ListSkeleton />;
  }

  //
  if (!loading) {
    hideProgress();
  }

  // Render the List component.
  return (
    <Box position="relative" height="100%" display="flex" flexDirection="row" overflow="hidden">
      <div ref={maskEl} className={classes.progressCt}>
        <LinearProgress classes={{ root: classes.progress }} />
      </div>
      <div ref={listEl} role="button" tabIndex={-1} onKeyUp={_onKeyUp} onKeyDown={_onKeyDown} className={classes.list}>
        <div className={classes.listContent}>
          {page.items.map((item, i) => (
            <Box mr={0} key={`listpage[${page.index}].id[${item.id}]`} id={`listpage[${page.index}].id[${item.id}]`}>
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
