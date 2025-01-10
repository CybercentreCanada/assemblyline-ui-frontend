import React, { useEffect } from 'react';
import { useTableOfContent } from './TableOfContent';

export type AnchorProps = {
  anchor?: string;
  level?: number;
  children?: React.ReactNode;
};

export const Anchor: React.FC<AnchorProps> = React.memo(
  ({ anchor = null, level = 1, children = null, ...props }: AnchorProps) => {
    const { loadAnchors } = useTableOfContent();

    useEffect(() => {
      loadAnchors();
    }, [loadAnchors]);

    return (
      <div data-anchor={anchor || children.toString()} data-anchor-level={level} {...props}>
        {children}
      </div>
    );
  }
);
