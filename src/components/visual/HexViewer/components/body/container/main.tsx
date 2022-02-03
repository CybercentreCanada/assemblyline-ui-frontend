import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import useAppContext from 'commons/components/hooks/useAppContext';
import {
  HexStore,
  useCopy,
  useCursor,
  useHex,
  useLayout,
  useScroll,
  useSearch,
  useSelect,
  useStyles
} from 'components/visual/HexViewer';
import React from 'react';
import { HexContainer, HexOffsets } from '.';
import { HexScrollBar } from '../scrollbar';

const useHexStyles = makeStyles(theme => ({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'stretch',
    userSelection: 'none',

    lineHeight: 1.15
  },
  table: {
    padding: 0,
    margin: 0,
    borderSpacing: 0
  },
  tableBody: {
    padding: 0,
    margin: 0
  },
  spacer: {
    flex: 1
  }
}));

export type HexContainerMainProps = {
  store?: HexStore;
};

export const WrappedHexContainerMain = ({ store }: HexContainerMainProps) => {
  const classes = useHexStyles();
  const { isLightTheme } = useAppContext();

  const { hexMap, getHexValue, getTextValue } = useHex();
  const { layoutRef, hexesContainerRefs, textsContainerRefs } = useLayout();
  const { nextCursorIndex } = useCursor();
  const { nextSelectIndexes } = useSelect();
  const { nextSearchQuery, nextSearchIndexes, nextSearchIndex } = useSearch();
  const { onCopyMouseEnter } = useCopy();
  const { onScrollWheel, onScrollTouchStart, onScrollTouchEnd, onScrollTouchMove } = useScroll();
  const {
    hexClasses,
    itemClasses,
    getHexColorClass,
    getCursorClass,
    getSelectClass,
    getSearchClass,
    getSelectedSearchClass
  } = useStyles();

  return (
    <div
      className={clsx(hexClasses.app)}
      ref={layoutRef}
      onWheel={event => onScrollWheel(event)}
      onTouchStart={event => onScrollTouchStart(event)}
      onTouchMove={event => onScrollTouchMove(event)}
      onTouchEnd={event => onScrollTouchEnd(event)}
    >
      <div className={hexClasses.spacers} />
      <HexOffsets {...store} />
      <HexContainer
        isLightTheme={isLightTheme}
        isSliding={store.isSliding}
        initialized={store.initialized}
        containerRef={hexesContainerRefs}
        containerClass={clsx(hexClasses.container, hexClasses.rows, hexClasses.item, itemClasses.hexBorder)}
        store={store}
        onMouseEnter={event => onCopyMouseEnter(0)}
        getValue={(index: number) => getHexValue(index)}
        getColorClass={(index: number) => getHexColorClass(hexMap.current, index)}
        getCursorClass={(index: number) => getCursorClass(nextCursorIndex.current, index)}
        getSelectClass={(index: number) => getSelectClass(nextSelectIndexes.current, index)}
        getSearchClass={(index: number) =>
          getSearchClass(nextSearchQuery.current, nextSearchIndexes.current, nextSearchIndex.current, index)
        }
        getSelectedSearchClass={(index: number) =>
          getSelectedSearchClass(nextSearchQuery.current, nextSearchIndexes.current, nextSearchIndex.current, index)
        }
      />
      <HexContainer
        isLightTheme={isLightTheme}
        isSliding={store.isSliding}
        initialized={store.initialized}
        containerRef={textsContainerRefs}
        containerClass={clsx(hexClasses.container, hexClasses.rows, hexClasses.item)}
        store={store}
        onMouseEnter={event => onCopyMouseEnter(1)}
        getValue={(index: number) => getTextValue(index)}
        getCursorClass={(index: number) => getCursorClass(nextCursorIndex.current, index)}
        getSelectClass={(index: number) => getSelectClass(nextSelectIndexes.current, index)}
        getSearchClass={(index: number) =>
          getSearchClass(nextSearchQuery.current, nextSearchIndexes.current, nextSearchIndex.current, index)
        }
        getSelectedSearchClass={(index: number) =>
          getSelectedSearchClass(nextSearchQuery.current, nextSearchIndexes.current, nextSearchIndex.current, index)
        }
      />
      <div className={hexClasses.spacers} />
      <HexScrollBar store={store} />
    </div>
  );
};

export const HexContainerMain = React.memo(WrappedHexContainerMain);
