import { LayoutActions, LayoutActionTypes } from '../actions/useLayoutAction';
import { HexPayload, HexRef, HexState } from './Hex';
import { HoverActionType, HoverPayload, HoverRef, HoverState } from './Hover';
import { LayoutPayload, LayoutRef, LayoutState } from './Layout';

export type Store = HexState & LayoutState & HoverState;
export type Ref = HexRef & LayoutRef & HoverRef;
export type ActionTypes = LayoutActionTypes | HoverActionType;
export type Payload = HexPayload | LayoutPayload | HoverPayload;
export type ActionProps = {
  type: ActionTypes;
  refs?: React.MutableRefObject<Ref>;
  payload: Payload;
};

export type HexReducerContextProps = {
  initialState?: Store;
  refs?: React.MutableRefObject<Ref>;
  reducer?: (store: Store, action: ActionProps) => Store;
};

export type HexDispatchContextProps = LayoutActions & {
  dispatchRef?: React.MutableRefObject<React.Dispatch<ActionProps>>;
};

export type HexStoreContextProps = {
  store?: Store;
};

export type HexStoreProviderProps = {
  children?: React.ReactNode;
};

export type ActionHookProps = React.MutableRefObject<React.Dispatch<ActionProps>>;
