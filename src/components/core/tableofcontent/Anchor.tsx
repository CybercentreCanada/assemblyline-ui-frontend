import React, { useEffect } from 'react';
import { useTableOfContent } from './TableOfContent';

export type AnchorProps = {
  anchor?: string;
  children?: React.ReactNode;
};

export const Anchor: React.FC<AnchorProps> = React.memo(({ anchor = null, children = null, ...props }: AnchorProps) => {
  const { loadAnchors } = useTableOfContent();

  useEffect(() => {
    loadAnchors();
  }, [loadAnchors]);

  return (
    <div data-anchor={anchor || children.toString()} {...props}>
      {children}
    </div>
  );
});
