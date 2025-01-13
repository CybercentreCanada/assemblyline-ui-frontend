import React, { useEffect } from 'react';
import { useTableOfContent } from './TableOfContent';

export type AnchorProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  anchor?: string;
  label?: string;
  subheader?: boolean;
};

export const Anchor: React.FC<AnchorProps> = React.memo(
  ({ anchor = null, label = null, subheader = false, children = null, ...props }: AnchorProps) => {
    const { loadAnchors } = useTableOfContent();

    useEffect(() => {
      loadAnchors();
      return () => loadAnchors();
    }, [loadAnchors]);

    return (
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      <div
        data-anchor={anchor || children.toString()}
        data-anchor-label={label || children.toString()}
        data-anchor-subheader={subheader}
        {...props}
      >
        {children}
      </div>
    );
  }
);
