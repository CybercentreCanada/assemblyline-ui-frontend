import { TypesConfig } from '..';

export type SelectTypes = never;

export type SelectState = { select: { startIndex: number; endIndex: number; isHighlighting: boolean } };

export const SELECT_STATE: SelectState = { select: { startIndex: -1, endIndex: -1, isHighlighting: false } };

export const SELECT_TYPES: TypesConfig<SelectState, SelectTypes> = null;
