import type { HighlightContextProps } from 'layout/highlighter/highlighter.providers';
import { HighlightContext } from 'layout/highlighter/highlighter.providers';
import { useContext } from 'react';

export default function useHighlighter(): HighlightContextProps {
  return useContext(HighlightContext);
}
