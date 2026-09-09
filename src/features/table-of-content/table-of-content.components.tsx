import { useTableOfContent } from 'features/table-of-content';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { memo, useEffect, useId, useMemo } from 'react';

//*****************************************************************************************
// Anchor
//*****************************************************************************************

/** Props for an anchor registered with the table of contents. */
export type AnchorProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  /** Optional explicit anchor identifier. */
  anchor?: string;
  /** Label shown in the table of contents. */
  label?: ReactNode;
  /** Whether the anchor is a subsection. */
  subheader?: boolean;
  /** Whether the anchor should be rendered without registration. */
  disabled?: boolean;
};

export const Anchor = memo(
  ({ anchor = null, label = '', subheader = false, disabled = false, children = null, ...props }: AnchorProps) => {
    const autoID = useId();
    const actualID = useMemo(() => anchor || autoID, [anchor, autoID]);
    const tableOfContent = useTableOfContent();
    const { loadAnchors } = tableOfContent;

    useEffect(() => {
      if (disabled) return;

      const labelText = typeof label === 'string' || typeof label === 'number' ? String(label) : '';
      loadAnchors({ id: actualID, label: labelText, subheader });

      return () => loadAnchors({});
    }, [actualID, disabled, label, subheader, loadAnchors]);

    return disabled ? (
      <>{children}</>
    ) : (
      <div data-anchor={actualID} {...props}>
        {children}
      </div>
    );
  }
);

Anchor.displayName = 'Anchor';
