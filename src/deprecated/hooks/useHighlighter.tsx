import { useAppHighlighter } from 'layout/highlighter';

export type HighlighMapProps = Record<string, string[]>;

export type HighlightContextProps = {
  getKey: (type: string, value: string) => string;
  triggerHighlight: (key: string) => void;
  isHighlighted: (key: string) => boolean;
  hasHighlightedKeys: (keyList: string[]) => boolean;
  setHighlightMap: (map: HighlighMapProps) => void;
};

export const useHighlighter = (): HighlightContextProps => {
  const highlighter = useAppHighlighter();

  return {
    getKey: highlighter.getKey,
    triggerHighlight: highlighter.trigger,
    isHighlighted: highlighter.isHighlighted,
    hasHighlightedKeys: highlighter.hasKeys,
    setHighlightMap: highlighter.setMap
  };
};

export default useHighlighter;
