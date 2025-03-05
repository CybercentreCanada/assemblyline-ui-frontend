import React, { useEffect, useId } from 'react';
import { useTableOfContent } from './TableOfContent';

export type AnchorProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  anchor?: string;
  label?: React.ReactNode;
  subheader?: boolean;
  disabled?: boolean;
};

export const Anchor: React.FC<AnchorProps> = React.memo(
  ({ anchor = null, label = '', subheader = false, children = null, disabled = false, ...props }: AnchorProps) => {
    const id = useId();

    const loadAnchors = useTableOfContent()?.loadAnchors;

    useEffect(() => {
      if (disabled) return;
      loadAnchors({ id: anchor || id, label: label.toString(), subheader });
      return () => loadAnchors({});
    }, [anchor, disabled, id, label, loadAnchors, subheader]);

    return disabled ? (
      children
    ) : (
      <div data-anchor={anchor || id} {...props}>
        {children}
      </div>
    );
  }
);
