/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CircularProgress } from '@material-ui/core';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import Throttler from '../../utils/throttler';
import useListKeyboard from '../hooks/useListKeyboard';
import useListStyles from '../hooks/useListStyles';
import ListRow, { LineItem } from '../list-item';
import MetaListBuffer from './metalist-buffer';

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
  const startIndex = Math.floor(sT / rowHeight);
  const endIndex = startIndex + itemCount;

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
  loading: boolean;
  buffer: MetaListBuffer;
  rowHeight: number;
  scrollReset?: boolean;
  threshold?: number;
  onSelection: (item: MetaListItem) => void;
  onRenderItem: (item: MetaListItem) => React.ReactNode;
  onNext: () => void;
  onLoad?: (from: number, to: number) => void;
}

const MetaList: React.FC<MetaListProps> = React.memo(
  ({ loading, buffer, rowHeight, scrollReset, threshold = 0, onSelection, onRenderItem, onNext, onLoad }) => {
    // Styles.
    const { metaListClasses: classes } = useListStyles();

    // Custom hooks
    const { cursor, setCursor, onKeyDown } = useListKeyboard({
      count: buffer.total(),
      rowHeight,
      infinite: true,
      onEscape: () => onSelection(null),
      onEnter: (_cursor: number) => onSelection(buffer.one(_cursor).item)
    });

    // References.
    const outerEL = useRef<HTMLDivElement>();
    const innerEL = useRef<HTMLDivElement>();
    const frameEL = useRef<HTMLDivElement>();

    const _onRowClick = useCallback(
      (item: MetaListItem) => {
        setCursor(item.index);
        onSelection(item);
      },
      [setCursor, onSelection]
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
      if (_frame.rH <= threshold && !loading) {
        onNext();
      }
    };

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
    }, [buffer, rowHeight, scrollReset]);

    return (
      <div ref={outerEL} tabIndex={0} className={classes.outer} onScroll={onScroll} onKeyDown={onKeyDown}>
        {loading ? (
          <div className={classes.progressCt} style={{ top: frame.sT, height: frame.fH }}>
            <CircularProgress className={classes.progressSpinner} />
          </div>
        ) : null}

        <div ref={innerEL} className={classes.inner}>
          <div ref={frameEL} className={classes.frame} style={{ top: frame.startIndex * rowHeight }}>
            {frame.items.map(item => (
              <ListRow
                key={`list.rowitem[${item.item.index}]`}
                index={item.item.index}
                loaded={item.loaded}
                item={item.item}
                selected={item.item.index === cursor}
                rowHeight={rowHeight}
                onClick={_onRowClick}
                onRenderRow={onRenderItem}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default MetaList;
