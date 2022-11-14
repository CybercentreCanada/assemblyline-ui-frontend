import { TypesConfig } from '..';

export type CursorTypes = never;

export type CursorState = { cursor: { index: number } };

export const CURSOR_STATE: CursorState = { cursor: { index: null } };

export const CURSOR_TYPES: TypesConfig<CursorState, CursorTypes> = null;
