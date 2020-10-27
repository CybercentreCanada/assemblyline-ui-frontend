import { useState } from 'react';

type NavHighlightProps = {
  type: string;
  value: string;
};

type HighlighMapProps = {
  [key: string]: string[];
};

export type NavHighlighterProps = {
  getKey: (type: string, value: string) => string;
  triggerHighlight: (key: string) => void;
  isHighlighted: (key: string) => boolean;
  setHighlightMap: (map: HighlighMapProps) => void;
};

export default function useNavHighlighter(): NavHighlighterProps {
  const [highlighted, setHighlighted] = useState<Set<any>>(new Set());
  const [relatedHighlighted, setRelatedHighlighted] = useState<Set<any>>(new Set());
  const [highlightMap, setHighlightMap] = useState<HighlighMapProps>({});

  function getKey(type: string, value: string) {
    return `${type}__${value}`;
  }

  function isHighlighted(key) {
    if (highlightMap) {
      return highlighted.has(key) || relatedHighlighted.has(key);
    }
    return highlighted.has(key);
  }

  function triggerHighlight(key) {
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

  return {
    getKey,
    triggerHighlight,
    isHighlighted,
    setHighlightMap
  };
}
