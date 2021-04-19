/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CircularProgress } from '@material-ui/core';
import useListKeyboard from 'commons/addons/elements/lists/hooks/useListKeyboard';
import useListNavigator from 'commons/addons/elements/lists/hooks/useListNavigator';
import useListStyles from 'commons/addons/elements/lists/hooks/useListStyles';
import { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import MetaListItem from 'commons/addons/elements/lists/item/MetaListItem';
import ListScroller from 'commons/addons/elements/lists/scrollers/ListScroller';
import MetaListScroller from 'commons/addons/elements/lists/scrollers/MetaListScroller';
import Throttler from 'commons/addons/elements/utils/throttler';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MetaListBuffer from './MetaListBuffer';

const THROTTLER = new Throttler(50);

// Compute the visual frame.
const computeFrame = (
  buffer: MetaListBuffer,
  rowHeight: number,
  outerEL: HTMLDivElement,
  innerEL: HTMLDivElement
): MetaListFrame => {
  const fH = outerEL.getBoundingClientRect().height;
  const tH = innerEL.getBoundingClientRect().height;
  const sT = outerEL.scrollTop;
  const cP = sT + fH;

  // how much we have to go until scroll is at bottom.
  const rH = tH - cP;

  // how many items to display.
  const itemCount = Math.ceil(fH / rowHeight) + 1;

  // compute index of first element in frame.
  let startIndex = Math.floor(sT / rowHeight);
  startIndex = startIndex > 10 ? startIndex - 10 : 0;

  // last element index in frame.
  const endIndex = startIndex + itemCount + 10;

  // Here's your frame of reference.
  const _frame = {
    sT,
    rH,
    cP,
    fH,
    startIndex,
    endIndex,
    items: buffer.get(startIndex, endIndex)
  };

  // console.log(_frame);
  // console.log(buffer.items);
  // console.log(`${_frame.items.length}: ${_frame.startIndex}: ${_frame.endIndex}`);
  // console.log(_frame.items);
  // console.log(_frame.rH);
  return _frame;
};

export interface MetaListItem extends LineItem {
  index: number;
}

interface MetaListFrame {
  sT: number;
  rH: number;
  cP: number;
  fH: number;
  startIndex: number;
  endIndex: number;
  items: { loaded: boolean; item: MetaListItem }[];
}

interface MetaListProps {
  id: string;
  loading: boolean;
  buffer: MetaListBuffer;
  rowHeight: number;
  scrollReset?: boolean;
  scrollTargetId?: string;
  recompute?: boolean;
  threshold?: number;
  children: (item: MetaListItem) => React.ReactNode;
  onCursorChange?: (item: MetaListItem, cursor: number) => void;
  onItemSelected?: (item: MetaListItem) => void;
  onNext?: () => void;
  onLoad?: (from: number, to: number) => void;
}

const MetaList: React.FC<MetaListProps> = React.memo(
  ({
    id,
    loading,
    buffer,
    rowHeight,
    scrollReset,
    scrollTargetId,
    recompute = false,
    threshold = 10,
    children,
    onCursorChange,
    onItemSelected,
    onNext,
    onLoad
  }) => {
    // Styles.
    const { metaListClasses: classes } = useListStyles();

    // References.
    const outerEL = useRef<HTMLDivElement>();
    const innerEL = useRef<HTMLDivElement>();
    const frameEL = useRef<HTMLDivElement>();
    const scrollEL = useRef<HTMLElement>();
    const scroller = useRef<ListScroller>();

    // Custom hooks
    const { register } = useListNavigator(id);
    const { cursor, setCursor, next, previous, onKeyDown } = useListKeyboard({
      id,
      scroller: scroller.current,
      count: buffer.total(),
      infinite: true,
      onEscape: () => onItemSelected(null),
      onEnter: (_cursor: number) => onItemSelected(buffer.one(_cursor).item),
      onCursorChange: (_cursor: number) => {
        const item = buffer.one(_cursor);
        if (onCursorChange) {
          onCursorChange(item.item, _cursor);
        }
      }
    });

    const _onRowClick = useCallback(
      (item: MetaListItem) => {
        setCursor(item.index);
        if (onItemSelected) {
          onItemSelected(item);
        }
      },
      [setCursor, onItemSelected]
    );

    // States.
    const [frame, setFrame] = useState<MetaListFrame>({
      sT: 0,
      rH: 0,
      cP: 0,
      fH: 0,
      startIndex: 0,
      endIndex: 0,
      items: []
    });

    // Adjust things each time we receive an updated list of items.
    useLayoutEffect(() => {
      // Adjust the inner container height each time we receive an updated list of items.
      innerEL.current.style.height = `${buffer.total() * rowHeight}px`;

      // reset scroll?
      // TODO: ideally there would be a way to infer this withhow in this component
      if (scrollReset) {
        outerEL.current.scrollTo({ top: 0 });
      }

      // compute which items are within visual frame.
      const updateFrame = () => setFrame(computeFrame(buffer, rowHeight, outerEL.current, innerEL.current));
      // Recompute the frame each time this component mounts or receives update to properties.
      updateFrame();

      // Register a windows resize event to ensure frame measurement remain in line with window size.
      window.addEventListener('resize', updateFrame);
      return () => {
        // Deregister window event listener.
        window.removeEventListener('resize', updateFrame);
      };
    }, [buffer, rowHeight, scrollReset, recompute]);

    useEffect(() =>
      register({
        onSelect: () => null,
        onSelectNext: () => next(),
        onSelectPrevious: () => previous()
      })
    );

    useEffect(() => {
      // Scroll handler to track scroll position in order check if it has hit the scrollThreshold.
      const onScroll = () => {
        // compute frame.
        const _frame = computeFrame(buffer, rowHeight, outerEL.current, innerEL.current);

        // update frame state.
        setFrame(_frame);

        //
        const unloaded = _frame.items.filter(item => !item.loaded);
        if (buffer.size && unloaded.length) {
          // TODO: throttle this to ensure we dont' fetch things we're just scrolling by.
          // fetch the missing items.
          THROTTLER.delay(() => {
            const start = unloaded[0].item.index;
            const end = unloaded[unloaded.length - 1].item.index;
            onLoad(start, end);
          });
        }

        // load more if at bottom.
        if (_frame.rH <= threshold && !loading && onNext) {
          onNext();
        }
      };

      // Determine the scroll target element.
      if (scrollTargetId) {
        scrollEL.current = document.getElementById(scrollTargetId);
      } else {
        scrollEL.current = outerEL.current;
      }

      // Register scroll hanlder on scrolltarget.
      if (scrollEL.current) {
        scrollEL.current.addEventListener('scroll', onScroll);
      }

      // Create the scroller computer.
      scroller.current = new MetaListScroller(scrollEL.current, outerEL.current, rowHeight);

      // Unregister scroll handler.
      return () => {
        scrollEL.current.removeEventListener('scroll', onScroll);
      };
    }, [scrollTargetId, outerEL, buffer, loading, onNext, onLoad, rowHeight, threshold]);

    return (
      <div id={id} ref={outerEL} tabIndex={0} className={classes.outer} onKeyDown={onKeyDown}>
        {loading ? (
          <div className={classes.progressCt} style={{ top: frame.sT, height: frame.fH }}>
            <CircularProgress className={classes.progressSpinner} />
          </div>
        ) : null}

        <div ref={innerEL} className={classes.inner}>
          <div ref={frameEL} className={classes.frame} style={{ top: frame.startIndex * rowHeight }}>
            {frame.items.map(item => (
              <MetaListItem
                key={`list.rowitem[${item.item.index}]`}
                index={item.item.index}
                loaded={item.loaded}
                item={item.item}
                selected={item.item.index === cursor}
                height={rowHeight}
                onClick={_onRowClick}
              >
                {children}
              </MetaListItem>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default MetaList;
