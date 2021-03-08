import { HighlightContext, HighlightContextProps } from 'components/visual/HighlightProvider';
import { useContext } from 'react';

export default function useHighlighter(): HighlightContextProps {
  return useContext(HighlightContext) as HighlightContextProps;
}
