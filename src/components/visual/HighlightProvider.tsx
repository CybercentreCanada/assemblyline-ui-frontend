import React, { useCallback, useEffect, useState } from 'react';

type HighlighMapProps = {
  [key: string]: string[];
};

export type HighlightContextProps = {
  getKey: (type: string, value: string) => string;
  triggerHighlight: (key: string) => void;
  isHighlighted: (key: string) => boolean;
  hasHighlightedKeys: (keyList: string[]) => boolean;
  setHighlightMap: (map: HighlighMapProps) => void;
};

export interface HighlightProviderProps {
  children: React.ReactNode;
}

export const HighlightContext = React.createContext<HighlightContextProps>(null);

function HighlightProvider(props: HighlightProviderProps) {
  const { children } = props;
  const [highlighted, setHighlighted] = useState<Set<any>>(new Set());
  const [relatedHighlighted, setRelatedHighlighted] = useState<Set<any>>(new Set());
  const [highlightMap, setHighlightMap] = useState<HighlighMapProps>({});

  const getKey = useCallback((type: string, value: string) => `${type}__${value}`, []);

  const isHighlighted = useCallback(
    key => {
      if (highlightMap) {
        return highlighted.has(key) || relatedHighlighted.has(key);
      }
      return highlighted.has(key);
    },
    [highlighted, relatedHighlighted, highlightMap]
  );

  const hasHighlightedKeys = useCallback((keyList: string[]) => keyList.some(item => isHighlighted(item)), [
    isHighlighted
  ]);

  const triggerHighlight = useCallback((data: string) => {
    window.dispatchEvent(new CustomEvent('tiggerHighlight', { detail: data }));
  }, []);

  useEffect(() => {
    function handleTrigger(event: CustomEvent) {
      const { detail: key } = event;
      const newHighlighted = new Set(highlighted);
      if (!newHighlighted.has(key)) {
        newHighlighted.add(key);
      } else {
        newHighlighted.delete(key);
      }

      if (highlightMap) {
        const newRelatedHighlighted = new Set();
        newHighlighted.forEach(item => {
          const items = highlightMap[item];
          if (items) {
            for (const val of items) {
              newRelatedHighlighted.add(val);
            }
          }
        });
        setRelatedHighlighted(newRelatedHighlighted);
      }
      setHighlighted(newHighlighted);
    }

    window.addEventListener('tiggerHighlight', handleTrigger);

    return () => {
      window.removeEventListener('tiggerHighlight', handleTrigger);
    };
  }, [highlightMap, highlighted]);

  return (
    <HighlightContext.Provider
      value={{
        getKey,
        triggerHighlight,
        isHighlighted,
        hasHighlightedKeys,
        setHighlightMap
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
}

export default HighlightProvider;
