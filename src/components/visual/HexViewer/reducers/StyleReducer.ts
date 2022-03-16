// import React from 'react';
// import { addClass } from '../actions/StyleActions';

//   export type State = {};

//   export type Ref = {
//     isMouseDown: number;
//   };

//   export type Action = {
//     type: typeof MOUSE_ENTER | typeof MOUSE_LEAVE | typeof MOUSE_DOWN | typeof MOUSE_UP;
//     refs: React.MutableRefObject<Ref>;
//     payload: any;
//   };

//   export const MOUSE_ENTER = 'HOVER_MOUSE_ENTER';
//   export const MOUSE_LEAVE = 'HOVER_MOUSE_LEAVE';
//   export const MOUSE_DOWN = 'HOVER_MOUSE_DOWN';
//   export const MOUSE_UP = 'HOVER_MOUSE_UP';

//   export const initialState: State = {};
//   export const initialRef: State = {
//     isMouseDown: false
//   };

//   export const useAction = (dispatch: React.MutableRefObject<any>) => {
//     const onHoverMouseEnter = React.useCallback(
//       (index: number) => dispatch.current({ type: MOUSE_ENTER, refs: null, payload: { index } }),
//       [dispatch]
//     );

//     return {
//       onHoverMouseEnter
//     };
//   };

//   const isMouseEnter = (action: any) => action?.type === MOUSE_ENTER;

//   export const mouseEnter = (state: State, { type, refs, payload }: Action) => {
//     !refs.current.isMouseDown ?? addClass(refs.current.body, payload.index, refs.current.classes.cell.hover);
//   };

//   export const reducer = (state, action) => {
//     if (isMouseEnter(action)) return mouseEnter(state, action);
//   };

// // export const useGuard = (callback: () => any, guards: Array<boolean | (() => boolean)>) => {
// //   const callbackRef = React.useRef(callback);
// //   guards.forEach(guard => {
// //     if (typeof guard === 'boolean' && !guard) return;
// //     else if (typeof guard === 'function' && guard()) return;
// //   });

// //   return callbackRef.current;
// // };

export const test = 0;
