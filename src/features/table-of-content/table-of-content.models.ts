/** Describes one registered table-of-content anchor. */
export type TableOfContentAnchor = {
  /** Anchor identifier. */
  id: string;
  /** Display label for the anchor. */
  label: string;
  /** Whether the anchor represents a subsection. */
  subheader: boolean;
};

/** Stores registered anchors and the currently active anchor. */
export type TableOfContentStore = {
  /** Currently active anchor identifier. */
  activeID: string | null;
  /** Registered anchors in document order. */
  anchors: TableOfContentAnchor[];
};
