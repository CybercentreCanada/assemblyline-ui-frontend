import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useLayout, useStyles } from '..';
import { addClass, removeClass } from '../actions/StyleActions';

export type HoverContextProps = {
  onHoverMouseEnter?: (index: number) => void;
  onHoverMouseLeave?: (index: number) => void;
  onHoverMouseDown?: () => void;
  onHoverMouseUp?: () => void;
};

export const HoverContext = React.createContext<HoverContextProps>(null);

export const WrappedHoverProvider = ({ children }: HexProps) => {
  const { bodyRef } = useLayout();
  const { itemClasses } = useStyles();

  const isMouseDown = useRef<boolean>(false);

  const onHoverMouseEnter = useCallback(
    (index: number) => (!isMouseDown.current ? addClass(bodyRef, index, itemClasses.hover) : null),
    [bodyRef, itemClasses.hover]
  );

  const onHoverMouseLeave = useCallback(
    (index: number) => removeClass(bodyRef, index, itemClasses.hover),
    [bodyRef, itemClasses.hover]
  );

  const onHoverMouseDown = useCallback(() => (isMouseDown.current = true), []);

  const onHoverMouseUp = useCallback(() => (isMouseDown.current = false), []);

  return (
    <HoverContext.Provider
      value={{
        onHoverMouseEnter,
        onHoverMouseLeave,
        onHoverMouseDown,
        onHoverMouseUp
      }}
    >
      {useMemo(() => children, [children])}
    </HoverContext.Provider>
  );
};

export const HoverProvider = React.memo(WrappedHoverProvider);
export const useHover = (): HoverContextProps => useContext(HoverContext) as HoverContextProps;
