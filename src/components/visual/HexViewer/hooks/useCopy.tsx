import useClipboard from 'commons/components/hooks/useClipboard';
import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useCursor, useHex, useSelect } from '..';

export type CopyContextProps = {
  onCopyKeyDown?: (event: KeyboardEvent) => void;
  onCopyMouseEnter?: (index: number) => void;
  onCopyMouseLeave?: () => void;
  onCopyText?: (text: string) => void;
};

export const CopyContext = React.createContext<CopyContextProps>(null);

export const WrappedCopyProvider = ({ children }: HexProps) => {
  const { copy } = useClipboard();
  const { hexMap, toHexChar } = useHex();
  const { nextCursorIndex } = useCursor();
  const { nextSelectIndexes } = useSelect();

  const selectedContainerIndex = useRef<number>(null);

  const handleCopyCursorValue = useCallback(() => {
    if (selectedContainerIndex.current === 0) copy(hexMap.current.get(nextCursorIndex.current));
    else if (selectedContainerIndex.current === 1) copy(toHexChar(hexMap.current.get(nextCursorIndex.current)));
  }, [copy, hexMap, nextCursorIndex, toHexChar]);

  const handleCopySelectValue = useCallback(() => {
    let text: string = '';
    if (selectedContainerIndex.current === 0)
      for (let i = nextSelectIndexes.current.start; i <= nextSelectIndexes.current.end; i++)
        text += hexMap.current.get(i) + ' ';
    else if (selectedContainerIndex.current === 1)
      for (let i = nextSelectIndexes.current.start; i <= nextSelectIndexes.current.end; i++)
        text += toHexChar(hexMap.current.get(i));
    copy(text);
  }, [copy, hexMap, nextSelectIndexes, toHexChar]);

  const onCopyKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { repeat, ctrlKey, code } = event;
      if (
        !(!repeat && ctrlKey && code === 'KeyC') ||
        selectedContainerIndex.current === null ||
        (nextCursorIndex.current === null &&
          (nextSelectIndexes.current.start === -1 || nextSelectIndexes.current.end === -1))
      )
        return;

      if (nextSelectIndexes.current.start === -1 || nextSelectIndexes.current.end === -1) handleCopyCursorValue();
      else handleCopySelectValue();
    },
    [handleCopyCursorValue, handleCopySelectValue, nextCursorIndex, nextSelectIndexes]
  );

  const onCopyMouseEnter = useCallback((index: number) => (selectedContainerIndex.current = index), []);

  const onCopyMouseLeave = useCallback(() => (selectedContainerIndex.current = null), []);

  const onCopyText = useCallback((text: string) => copy(text), [copy]);

  return (
    <CopyContext.Provider
      value={{
        onCopyKeyDown,
        onCopyMouseEnter,
        onCopyMouseLeave,
        onCopyText
      }}
    >
      {useMemo(() => children, [children])}
    </CopyContext.Provider>
  );
};

export const CopyProvider = React.memo(WrappedCopyProvider);
export const useCopy = (): CopyContextProps => useContext(CopyContext) as CopyContextProps;
