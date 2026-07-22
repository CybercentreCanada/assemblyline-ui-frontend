import React, { useCallback, useContext, useRef } from 'react';

export type SelectionContextProps = {
  getSelection: () => string;
  setSelection: (text: string) => void;
};

export const SelectionContext = React.createContext<SelectionContextProps>(null);

export const useSelection = (): SelectionContextProps => {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    return {
      getSelection: () => null,
      setSelection: () => null
    };
  }
  return ctx;
};

export type SelectionProps = {
  behavior?: ScrollOptions['behavior'];
  children?: React.ReactNode;
};

export const Selection: React.FC<SelectionProps> = React.memo(({ children }) => {
  const selectedTextRef = useRef<string>(null);

  const getSelection = useCallback(() => selectedTextRef.current, []);

  const setSelection = useCallback((text: string) => {
    selectedTextRef.current = text;
  }, []);

  return <SelectionContext.Provider value={{ getSelection, setSelection }}>{children}</SelectionContext.Provider>;
});

export const SelectionProvider = React.memo((props: SelectionProps) => <Selection {...props} />);

export default SelectionProvider;
