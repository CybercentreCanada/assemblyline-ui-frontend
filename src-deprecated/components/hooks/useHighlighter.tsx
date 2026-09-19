import type { HighlightContextProps } from 'components/providers/HighlightProvider';
import { HighlightContext } from 'components/providers/HighlightProvider';
import { useContext } from 'react';

export default function useHighlighter(): HighlightContextProps {
  return useContext(HighlightContext);
}
