export type Snippet = {
  prefix: string;
  description: string;
  insert: string | string[];
  detail: string;
  kind: CompletionItemKind;
};

export interface CompletionList {
  suggestions: CompletionItem[];
  incomplete?: boolean;
  dispose?(): void;
}

export interface CompletionItem {
  label: string | CompletionItemLabel;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string | IMarkdownString;
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
  insertText: string;
  insertTextRules?: CompletionItemInsertTextRule;
  range: IRange;
  commitCharacters?: string[];
}

export interface CompletionItemLabel {
  label: string;
  detail?: string;
  description?: string;
}

export interface IMarkdownString {
  readonly value: string;
  readonly supportThemeIcons?: boolean;
  readonly supportHtml?: boolean;
}

export interface IWordAtPosition {
  readonly word: string;
  readonly startColumn: number;
  readonly endColumn: number;
}

export interface IRange {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
}

export enum CompletionItemKind {
  Method = 0,
  Function = 1,
  Constructor = 2,
  Field = 3,
  Variable = 4,
  Class = 5,
  Struct = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Event = 10,
  Operator = 11,
  Unit = 12,
  Value = 13,
  Constant = 14,
  Enum = 15,
  EnumMember = 16,
  Keyword = 17,
  Text = 18,
  Color = 19,
  File = 20,
  Reference = 21,
  Customcolor = 22,
  Folder = 23,
  TypeParameter = 24,
  User = 25,
  Issue = 26,
  Snippet = 27
}

export enum CompletionItemInsertTextRule {
  None = 0,
  KeepWhitespace = 1,
  InsertAsSnippet = 4
}
