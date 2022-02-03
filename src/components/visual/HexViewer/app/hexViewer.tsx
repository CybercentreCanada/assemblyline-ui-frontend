export const test = null;

// import { Backdrop, Fade, Modal } from '@material-ui/core';
// import ClickAwayListener from '@material-ui/core/ClickAwayListener';
// import clsx from 'clsx';
// import useAppContext from 'commons/components/hooks/useAppContext';
// import { default as React, useEffect, useLayoutEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
// import {
//   CopyProvider,
//   CursorProvider,
//   HexProvider,
//   HexSettings,
//   HexToolBar,
//   HistoryProvider,
//   HoverProvider,
//   LayoutProvider,
//   LocationProvider,
//   ModeProvider,
//   ScrollProvider,
//   SearchProvider,
//   SelectProvider,
//   SettingProvider,
//   StoreProvider,
//   StyleProvider,
//   SuggestionProvider,
//   useCopy,
//   useCursor,
//   useHex,
//   useHistory,
//   useHover,
//   useLayout,
//   useScroll,
//   useSearch,
//   useSelect,
//   useSetting,
//   useStore,
//   useStyles,
//   useSuggestion
// } from '..';
// import { HexApp } from '../components/root';

// export type DataProps = {
//   data: string;
// };

// export default React.memo(({ data }: DataProps) =>
//   data != null && data.length > 0 ? (
//     <StoreProvider>
//       <ModeProvider>
//         <HexProvider>
//           <LayoutProvider>
//             <StyleProvider>
//               <HoverProvider>
//                 <ScrollProvider>
//                   <CursorProvider>
//                     <SelectProvider>
//                       <SearchProvider>
//                         <SuggestionProvider>
//                           <HistoryProvider>
//                             <CopyProvider>
//                               <LocationProvider>
//                                 <SettingProvider>
//                                   <HexApp data={data} />
//                                 </SettingProvider>
//                               </LocationProvider>
//                             </CopyProvider>
//                           </HistoryProvider>
//                         </SuggestionProvider>
//                       </SearchProvider>
//                     </SelectProvider>
//                   </CursorProvider>
//                 </ScrollProvider>
//               </HoverProvider>
//             </StyleProvider>
//           </LayoutProvider>
//         </HexProvider>
//       </ModeProvider>
//     </StoreProvider>
//   ) : null
// );

// export const WrappedHexMain = ({ data }: DataProps) => {
//   const { isLightTheme } = useAppContext();
//   const { i18n } = useTranslation(['hexViewer']);

//   const { onStoreInit } = useStore();
//   const { hexMap, getHexValue, getTextValue, onHexInit, onHexLanguageChange } = useHex();
//   const { layoutRef, hexesContainerRefs, textsContainerRefs, onContainerMouseDown, onLayoutResize, onLayoutInit } =
//     useLayout();
//   const { onScrollInit } = useScroll();
//   const { nextCursorIndex, onCursorKeyDown, onCursorMouseUp, onCursorClear } = useCursor();
//   const { nextSelectIndexes, onSelectMouseUp, onSelectClear } = useSelect();
//   const { nextSearchQuery, nextSearchIndexes, nextSearchIndex } = useSearch();
//   const { onHoverMouseUp } = useHover();
//   const { onCopyKeyDown, onCopyMouseEnter } = useCopy();
//   const { onSettingLoad, onSettingSave } = useSetting();
//   const { onHistoryLoad, onHistorySave } = useHistory();
//   const { onSuggestionLanguageChange } = useSuggestion();
//   const {
//     onScrollWheel,
//     onScrollTouchStart,
//     onScrollTouchEnd,
//     onScrollTouchMove,
//     onScrollResize,
//     onScrollSliderMouseUp
//   } = useScroll();
//   const {
//     hexClasses,
//     itemClasses,
//     getHexColorClass,
//     getCursorClass,
//     getSelectClass,
//     getSearchClass,
//     getSelectedSearchClass
//   } = useStyles();

//   const { states, setStates } = useStateStore();
//   const storeSetStates = useRef<StoreSetState>(setStates);

//   useLayoutEffect(() => {
//     onStoreInit(storeSetStates.current);
//     onHexInit(data);
//     onLayoutInit();
//     onScrollInit();

//     onLayoutResize();
//     onScrollResize();

//     onHistoryLoad();
//     onSettingLoad();
//     return () => {
//       onHistorySave();
//       onSettingSave();
//     };
//   }, [
//     data,
//     onHexInit,
//     onHistoryLoad,
//     onHistorySave,
//     onLayoutInit,
//     onLayoutResize,
//     onScrollInit,
//     onScrollResize,
//     onSettingLoad,
//     onSettingSave,
//     onStoreInit
//   ]);

//   useEffect(() => {
//     onHexLanguageChange(i18n.language);
//     onSuggestionLanguageChange(i18n.language);
//   }, [i18n.language, onHexLanguageChange, onSuggestionLanguageChange]);

//   useEffect(() => {
//     const handleResize = (event: UIEvent) => {
//       onLayoutResize();
//       onScrollResize();
//     };
//     const handleKeyDown = (event: KeyboardEvent) => {
//       onCursorKeyDown(event);
//       onCopyKeyDown(event);
//     };
//     const handleMouseUp = (event: MouseEvent) => {
//       onScrollSliderMouseUp();
//       onHoverMouseUp();
//       onCursorMouseUp(event);
//       onSelectMouseUp(event);
//     };
//     const handleMouseDown = (event: MouseEvent) => {
//       onContainerMouseDown(event);
//     };

//     window.addEventListener('resize', handleResize);
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('mouseup', handleMouseUp);
//     window.addEventListener('mousedown', handleMouseDown);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('mouseup', handleMouseUp);
//       window.removeEventListener('mousedown', handleMouseDown);
//     };
//   }, [
//     onContainerMouseDown,
//     onCopyKeyDown,
//     onCursorKeyDown,
//     onCursorMouseUp,
//     onHoverMouseUp,
//     onLayoutResize,
//     onScrollResize,
//     onScrollSliderMouseUp,
//     onSelectMouseUp
//   ]);

//   return (
//     <>
//       <ClickAwayListener
//         onClickAway={event => {
//           onCursorClear();
//           onSelectClear();
//         }}
//       >
//         <div className={clsx(hexClasses.root)}>
//           <HexSettings {...states} />
//           <HexToolBar {...states} />
//           <div
//             className={clsx(hexClasses.app)}
//             ref={layoutRef}
//             onWheel={event => onScrollWheel(event)}
//             onTouchStart={event => onScrollTouchStart(event)}
//             onTouchMove={event => onScrollTouchMove(event)}
//             onTouchEnd={event => onScrollTouchEnd(event)}
//           >
//             {/* <HexTable store={states} /> */}
//             {/* <HexWindowLayout store={states} /> */}
//             {/* <div className={hexClasses.spacers} />
//             <HexOffsets {...states} />
//             <HexContainer
//               isLightTheme={isLightTheme}
//               isSliding={states.isSliding}
//               initialized={states.initialized}
//               containerRef={hexesContainerRefs}
//               containerClass={clsx(hexClasses.container, hexClasses.rows, hexClasses.item, itemClasses.hexBorder)}
//               store={states}
//               onMouseEnter={event => onCopyMouseEnter(0)}
//               getValue={(index: number) => getHexValue(index)}
//               getColorClass={(index: number) => getHexColorClass(hexMap.current, index)}
//               getCursorClass={(index: number) => getCursorClass(nextCursorIndex.current, index)}
//               getSelectClass={(index: number) => getSelectClass(nextSelectIndexes.current, index)}
//               getSearchClass={(index: number) =>
//                 getSearchClass(nextSearchQuery.current, nextSearchIndexes.current, nextSearchIndex.current, index)
//               }
//               getSelectedSearchClass={(index: number) =>
//                 getSelectedSearchClass(
//                   nextSearchQuery.current,
//                   nextSearchIndexes.current,
//                   nextSearchIndex.current,
//                   index
//                 )
//               }
//             />
//             <HexContainer
//               isLightTheme={isLightTheme}
//               isSliding={states.isSliding}
//               initialized={states.initialized}
//               containerRef={textsContainerRefs}
//               containerClass={clsx(hexClasses.container, hexClasses.rows, hexClasses.item)}
//               store={states}
//               onMouseEnter={event => onCopyMouseEnter(1)}
//               getValue={(index: number) => getTextValue(index)}
//               getCursorClass={(index: number) => getCursorClass(nextCursorIndex.current, index)}
//               getSelectClass={(index: number) => getSelectClass(nextSelectIndexes.current, index)}
//               getSearchClass={(index: number) =>
//                 getSearchClass(nextSearchQuery.current, nextSearchIndexes.current, nextSearchIndex.current, index)
//               }
//               getSelectedSearchClass={(index: number) =>
//                 getSelectedSearchClass(
//                   nextSearchQuery.current,
//                   nextSearchIndexes.current,
//                   nextSearchIndex.current,
//                   index
//                 )
//               }
//             />
//             <div className={hexClasses.spacers} />
//             <HexScrollBar {...states} /> */}
//           </div>
//         </div>
//       </ClickAwayListener>
//       <Modal
//         aria-labelledby="transition-modal-title"
//         aria-describedby="transition-modal-description"
//         // className={classes.modal}
//         open={false}
//         // onClose={handleClose}
//         closeAfterTransition
//         BackdropComponent={Backdrop}
//         BackdropProps={{
//           timeout: 500
//         }}
//       >
//         <Fade in={false}>
//           <div>
//             <h2 id="transition-modal-title">Transition modal</h2>
//             <p id="transition-modal-description">react-transition-group animates me.</p>
//           </div>
//         </Fade>
//       </Modal>
//       {/* <AutoSizer >
//         {({ height, width }) => (
//           <List className="List" height={height} itemCount={1000} itemSize={35} width={width}>
//             {Row}
//           </List>
//         )}
//       </AutoSizer> */}

//       {/* <AutoSizer>
//         {({ height, width }) => (
//           <Grid columnCount={50} columnWidth={22.5} height={height} rowCount={1000} rowHeight={22.5} width={width - 30}>
//             {Cell}
//           </Grid>
//         )}
//       </AutoSizer> */}
//     </>
//   );
// };

// // export const HexApp = React.memo(WrappedHexMain);
// // export default HexApp;
