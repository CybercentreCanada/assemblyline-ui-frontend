import { SearchType, TypesConfig } from '..';

export type HistoryType = {
  type: SearchType;
  value: string | number;
};

export type HistoryTypes = never;

export type HistoryState = {
  history: {
    values: Array<HistoryType>;
    index: number;
    maxSize: number;
    storageKey: string;
  };
};

export const HISTORY_STATE: HistoryState = {
  history: {
    values: [],
    index: 0,
    maxSize: 10,
    storageKey: 'hexViewer.history'
  }
};

export const HISTORY_TYPES: TypesConfig<HistoryState, HistoryTypes> = null;
