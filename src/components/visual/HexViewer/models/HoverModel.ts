import { TypesConfig } from '..';

export type HoverTypes = never;

export type HoverState = {
  hover: { index: number };
};

export const HOVER_STATE: HoverState = { hover: { index: null } };

export const HOVER_TYPES: TypesConfig<HoverState, HoverTypes> = null;
