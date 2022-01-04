import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useStyles } from '..';

export type HoverContextProps = {
  onHoverMouseEnter?: (index: number) => void;
  onHoverMouseLeave?: (index: number) => void;
  onHoverMouseDown?: () => void;
  onHoverMouseUp?: () => void;
};

export const HoverContext = React.createContext<HoverContextProps>(null);

export const WrappedHoverProvider = ({ children }: HexProps) => {
  const { itemClasses, addContainerClass, removeContainerClass } = useStyles();

  const isMouseDown = useRef<boolean>(false);

  const onHoverMouseEnter = useCallback(
    (index: number) => (!isMouseDown.current ? addContainerClass(index, itemClasses.hover) : null),
    [addContainerClass, itemClasses.hover]
  );

  const onHoverMouseLeave = useCallback(
    (index: number) => removeContainerClass(index, itemClasses.hover),
    [itemClasses.hover, removeContainerClass]
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
