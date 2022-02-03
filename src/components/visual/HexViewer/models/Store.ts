import { Dispatch, SetStateAction } from 'react';
import { HexContext, HexDispatch, HexState } from './Hex';
import { LayoutContext, LayoutDispatch, LayoutState } from './Layout';
import { ModeContext, ModeDispatch, ModeState } from './Mode';

type StoreState = {
  // App
  initialized?: boolean;

  // Hex
  hexBase?: number;
  hexOffsetBase?: number;
  hexBaseValues?: Array<{
    label: string;
    value: number;
  }>;

  // Layout
  layoutRows?: number;
  layoutAutoRows?: boolean;
  layoutColumns?: number;
  layoutAutoColumns?: boolean;

  // Scroll
  scrollIndex?: number;
  scrollSpeed?: number;
  isSliding?: boolean;

  // Cursor
  cursorIndex?: number;

  // Select
  selectIndexes?: { start: number; end: number };

  // Suggestion
  suggestionOpen?: boolean;
  suggestionLabels?: Array<string>;

  // Search
  searchValue?: string;
  searchQuery?: { key?: string; value?: string; length?: number };
  searchIndexes?: Array<number>;
  searchIndex?: number;
  searchHexIndex?: number;

  // History
  historyValues?: Array<string>;
  historyIndex?: number;

  // Settings
  settingsOpen?: boolean;
};

type StoreDispatch = {
  // App
  setInitialized?: Dispatch<SetStateAction<boolean>>;

  // Hex
  setHexBase?: Dispatch<SetStateAction<number>>;
  setHexOffsetSize?: Dispatch<SetStateAction<number>>;
  setHexBaseValues?: Dispatch<
    SetStateAction<
      Array<{
        label: string;
        value: number;
      }>
    >
  >;

  // Layout
  setLayoutRows?: Dispatch<SetStateAction<number>>;
  setLayoutAutoRows?: Dispatch<SetStateAction<boolean>>;
  setLayoutColumns?: Dispatch<SetStateAction<number>>;
  setLayoutAutoColumns?: Dispatch<SetStateAction<boolean>>;

  // Scroll
  setScrollIndex?: Dispatch<SetStateAction<number>>;
  setScrollSpeed?: Dispatch<SetStateAction<number>>;
  setIsSliding?: Dispatch<SetStateAction<boolean>>;

  // Cursor
  setCursorIndex?: Dispatch<SetStateAction<number>>;

  // Select
  setSelectIndexes?: Dispatch<SetStateAction<{ start: number; end: number }>>;

  // Suggestion
  setSuggestionOpen?: Dispatch<SetStateAction<boolean>>;
  setSuggestionLabels?: Dispatch<SetStateAction<Array<string>>>;

  // Search
  setSearchValue?: Dispatch<SetStateAction<string>>;
  setSearchQuery?: Dispatch<SetStateAction<{ key?: string; value?: string; length?: number }>>;
  setSearchIndexes?: Dispatch<SetStateAction<Array<number>>>;
  setSearchIndex?: Dispatch<SetStateAction<number>>;
  setSearchHexIndex?: Dispatch<SetStateAction<number>>;

  // History
  setHistoryValues?: Dispatch<SetStateAction<Array<string>>>;
  setHistoryIndex?: Dispatch<SetStateAction<number>>;

  // Settings
  setSettingsOpen?: Dispatch<SetStateAction<boolean>>;
};

type StoreContextProps = {
  // App
  setInitialized?: React.Dispatch<React.SetStateAction<boolean>>;
  onStoreInit?: (dispatch: HexStoreDispatch) => void;

  // Hex
  setHexBase?: (value: number) => void;
  setHexOffsetSize?: (value: number) => void;
  setHexBaseValues?: (
    values: Array<{
      label: string;
      value: number;
    }>
  ) => void;

  // Layout
  setLayoutRows?: (value: number) => void;
  setLayoutColumns?: (value: number) => void;
  setLayoutAutoRows?: (value: boolean) => void;
  setLayoutAutoColumns?: (value: boolean) => void;

  // Scroll
  setScrollIndex?: (value: number) => void;
  setScrollSpeed?: (value: number) => void;
  setIsSliding?: (value: boolean) => void;

  // Cursor
  setCursorIndex?: (value: number) => void;

  // Select
  setSelectIndexes?: (value: { start: number; end: number }) => void;

  // Suggestion
  setSuggestionOpen?: (value: boolean) => void;
  setSuggestionLabels?: (values: Array<string>) => void;

  // Search
  setSearchValue?: (value: string) => void;
  setSearchQuery?: (value: { key?: string; value?: string; length?: number }) => void;
  setSearchIndexes?: (value: Array<number>) => void;
  setSearchIndex?: (value: number) => void;
  setSearchHexIndex?: (value: number) => void;

  // History
  setHistoryValues?: (value: Array<string>) => void;
  setHistoryIndex?: (value: number) => void;

  // Settings
  setSettingsOpen?: (value: boolean) => void;
};

export type HexStore = StoreState & ModeState & HexState & LayoutState;

export type HexStoreDispatch = StoreDispatch & ModeDispatch & HexDispatch & LayoutDispatch;

export type HexStoreContextProps = StoreContextProps & ModeContext & HexContext & LayoutContext;

export type HexStoreProps = {
  store: HexStore;
};

export type HexProps = {
  children?: React.ReactNode;
};
