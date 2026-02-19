import { useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import React, { useEffect, useId, useMemo } from 'react';

export type AnchorProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  anchor?: string;
  label?: React.ReactNode;
  subheader?: boolean;
  disabled?: boolean;
};

export const Anchor: React.FC<AnchorProps> = React.memo(
  ({ anchor = null, label = '', subheader = false, disabled = false, children = null, ...props }: AnchorProps) => {
    const autoID = useId();
    const actualID = useMemo(() => anchor || autoID, [anchor, autoID]);

    const toc = useTableOfContent();
    const loadAnchors = toc?.loadAnchors;

    useEffect(() => {
      if (!loadAnchors || disabled) return;

      const labelText = typeof label === 'string' || typeof label === 'number' ? String(label) : '';

      loadAnchors({
        id: actualID,
        label: labelText,
        subheader
      });

      return () => {
        loadAnchors({});
      };
    }, [actualID, disabled, label, subheader, loadAnchors]);

    if (disabled) return <>{children}</>;

    return (
      <div data-anchor={actualID} {...props}>
        {children}
      </div>
    );
  }
);
