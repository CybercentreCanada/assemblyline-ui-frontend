import React from 'react';
import { createSignalStore } from './createSignalStore';
import Main from './Main';

export type Props = {
  translation: string;
  titleI18nKey?: string;
  topI18nKey?: string;
  children: React.ReactNode;
};

type TableOfContentStore = {
  translation: string;
  titleI18nKey: string;
  topI18nKey: string;
  anchors: AnchorDef[];
  nodes: NodeDef[];
  activeIndex: number;
  expandAll?: boolean;
};

export type AnchorDef = {
  hash: string;
  i18nKey: string;
  level: number;
  path: number[];
  element: HTMLElement;
  link?: HTMLElement;
};

export type NodeDef = {
  anchorHash: string;
  subNodes: NodeDef[];
};

export const { Provider, useSignal, useStore } = createSignalStore<TableOfContentStore>({
  translation: '',
  titleI18nKey: '',
  topI18nKey: '',
  anchors: [],
  nodes: [],
  activeIndex: null,
  expandAll: false
});

export const ContentWithTOC = ({ translation, children, titleI18nKey = 'toc', topI18nKey = 'top' }: Props) => (
  <Provider
    children={
      <Main translation={translation} titleI18nKey={titleI18nKey} topI18nKey={topI18nKey} children={children} />
    }
  />
);
