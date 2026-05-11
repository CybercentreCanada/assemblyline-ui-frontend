import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { memo, useEffect, useId, useMemo } from 'react';
import { useTableOfContent } from './TableOfContent';

export type AnchorProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  anchor?: string;
  label?: ReactNode;
  subheader?: boolean;
  disabled?: boolean;
};

export const Anchor = memo(
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

Anchor.displayName = 'Anchor';
