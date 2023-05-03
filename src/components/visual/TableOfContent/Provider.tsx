import React from 'react';
import createStore from './createStore';
import Main from './Main';

type TableOfContentProps = {
  children: React.ReactNode;
};

type TableOfContentStore = {
  anchors: AnchorDef[];
  nodes: NodeDef[];
  activeIndex: number;
  activePath: number[];
  expandAll?: boolean;
};

export type AnchorDef = {
  hash: string;
  label: string;
  level: number;
  path?: number[];
  element: HTMLElement;
  link?: HTMLElement;
};

export type NodeDef = AnchorDef & {
  subNodes: NodeDef[];
};

// type LinkItem = {
//   subNodes: LinkItem[];
// };

// type TocItem = {
//   anchor?: HTMLElement;
//   collapse?: boolean;
//   hash?: string; // to replace id
//   id?: string;
//   index?: number;
//   isAdmin?: boolean;
//   level?: number;
//   link?: HTMLElement;
//   path?: number[];
//   title?: string;
// };

// export type TocNode = TocItem & {
//   subNodes?: TocNode[];
// };

const initialStore: TableOfContentStore = {
  anchors: [],
  nodes: [],
  activeIndex: null,
  activePath: [],
  expandAll: false
};

export const { Provider, useStore } = createStore<TableOfContentStore>(initialStore);

export const TableOfContent = ({ children }: TableOfContentProps) => (
  <Provider children={<Main children={children} />} />
);
