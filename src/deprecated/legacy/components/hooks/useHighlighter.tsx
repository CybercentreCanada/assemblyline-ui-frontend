import type { HighlightContextProps } from 'deprecated/hooks/useHighlighter';
import { HighlightContext } from 'deprecated/hooks/useHighlighter';
import { useContext } from 'react';

export default function useHighlighter(): HighlightContextProps {
  return useContext(HighlightContext);
}
