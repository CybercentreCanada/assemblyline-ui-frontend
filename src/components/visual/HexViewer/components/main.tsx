import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import clsx from 'clsx';
import useAppContext from 'commons/components/hooks/useAppContext';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  HexContainer,
  HexOffsets,
  HexScrollBar,
  HexSettings,
  HexToolBar,
  StoreSetState,
  useCopy,
  useCursor,
  useHex,
  useHistory,
  useHover,
  useLayout,
  useScroll,
  useSearch,
  useSelect,
  useSetting,
  useStateStore,
  useStore,
  useStyles
} from '..';

export type DataProps = {
  data: string;
};

export const WrappedHexMain = ({ data }: DataProps) => {
  const { isLightTheme } = useAppContext();

  const { onStoreInit } = useStore();
  const { hexMap, getHexValue, getTextValue, onHexInit } = useHex();
  const { layoutRef, hexesContainerRefs, textsContainerRefs, onContainerMouseDown, onLayoutResize, onLayoutInit } =
    useLayout();
  const { onScrollInit } = useScroll();
  const { nextCursorIndex, onCursorKeyDown, onCursorMouseUp, onCursorClear } = useCursor();
  const { nextSelectIndexes, onSelectMouseUp, onSelectClear } = useSelect();
  const { nextSearchQuery, nextSearchIndexes, nextSearchIndex } = useSearch();
  const { onHoverMouseUp } = useHover();
  const { onCopyKeyDown, onCopyMouseEnter } = useCopy();
  const { onSettingLoad, onSettingSave } = useSetting();
  const { onHistoryLoad, onHistorySave } = useHistory();
  const {
    onScrollWheel,
    onScrollTouchStart,
    onScrollTouchEnd,
    onScrollTouchMove,
    onScrollResize,
    onScrollSliderMouseUp
  } = useScroll();
  const {
    hexClasses,
    itemClasses,
    getHexColorClass,
    getCursorClass,
    getSelectClass,
    getSearchClass,
    getSelectedSearchClass
  } = useStyles();

  const { states, setStates } = useStateStore();
  const storeSetStates = useRef<StoreSetState>(setStates);

  useLayoutEffect(() => {
    onStoreInit(storeSetStates.current);
    onHexInit(data);
    onLayoutInit();
    onScrollInit();

    onLayoutResize();
    onScrollResize();

    onHistoryLoad();
    onSettingLoad();
    return () => {
      onHistorySave();
      onSettingSave();
    };
  }, [
    data,
    onHexInit,
    onHistoryLoad,
    onHistorySave,
    onLayoutInit,
    onLayoutResize,
    onScrollInit,
    onScrollResize,
    onSettingLoad,
    onSettingSave,
    onStoreInit
  ]);

  useEffect(() => {
    const handleResize = (event: UIEvent) => {
      onLayoutResize();
      onScrollResize();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      onCursorKeyDown(event);
      onCopyKeyDown(event);
    };
    const handleMouseUp = (event: MouseEvent) => {
      onScrollSliderMouseUp();
      onHoverMouseUp();
      onCursorMouseUp(event);
      onSelectMouseUp(event);
    };
    const handleMouseDown = (event: MouseEvent) => {
      onContainerMouseDown(event);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [
    onContainerMouseDown,
    onCopyKeyDown,
    onCursorKeyDown,
    onCursorMouseUp,
    onHoverMouseUp,
    onLayoutResize,
    onScrollResize,
    onScrollSliderMouseUp,
    onSelectMouseUp
  ]);

  return (
    <ClickAwayListener
      onClickAway={event => {
        onCursorClear();
        onSelectClear();
      }}
    >
      <div className={clsx(hexClasses.root)}>
        <HexSettings {...states} />
        <HexToolBar {...states} />
        <div
          className={clsx(hexClasses.app)}
          ref={layoutRef}
          onWheel={event => onScrollWheel(event)}
          onTouchStart={event => onScrollTouchStart(event)}
          onTouchMove={event => onScrollTouchMove(event)}
          onTouchEnd={event => onScrollTouchEnd(event)}
        >
          <div className={hexClasses.spacers} />
          <HexOffsets {...states} />
          <HexContainer
            isLightTheme={isLightTheme}
            isSliding={states.isSliding}
            isLoaded={states.isLoaded}
            containerRef={hexesContainerRefs}
            containerClass={clsx(hexClasses.container, hexClasses.rows, hexClasses.item, itemClasses.hexBorder)}
            store={states}
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
            isSliding={states.isSliding}
            isLoaded={states.isLoaded}
            containerRef={textsContainerRefs}
            containerClass={clsx(hexClasses.container, hexClasses.rows, hexClasses.item)}
            store={states}
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
          <HexScrollBar {...states} />
        </div>
      </div>
    </ClickAwayListener>
  );
};

export const HexMain = React.memo(
  WrappedHexMain
  // (prevProps: Readonly<HexProps>, nextProps: Readonly<HexProps>) => prevProps === nextProps
  // prevProps.hexChars.size === nextProps.hexChars.size && prevProps.setSelectIndexes === nextProps.setSelectIndexes
);
export default HexMain;
