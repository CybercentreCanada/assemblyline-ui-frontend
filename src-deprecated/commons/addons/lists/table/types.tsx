export interface TableColumnField {
  id: number | string;
  position: number;
  label?: string;
  i18nKey?: string;
  path?: string;
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  getValue?: (item: any) => any;
}
