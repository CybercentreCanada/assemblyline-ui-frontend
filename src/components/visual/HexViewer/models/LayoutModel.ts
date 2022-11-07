import { TypesConfig } from '..';

export type LayoutDisplayMode = 'dual' | 'hex' | 'text';
export type LayoutFocusMode = 'none' | 'toolbar' | 'body';
export enum FoldingType {
  SHOW,
  HIDE
}

export type LayoutTypes = LayoutDisplayMode | LayoutFocusMode;

export type LayoutState = {
  layout: {
    display: { mode: LayoutDisplayMode; width: number; height: number };
    column: { size: number; auto: boolean; max: number };
    row: { size: number; auto: boolean; max: number };
    folding: { active: boolean; rows: Map<number, { index: number; type: FoldingType }> };
    isFocusing: LayoutFocusMode;
  };
};

export const LAYOUT_STATE: LayoutState = {
  layout: {
    display: { mode: 'dual', width: 0, height: 0 },
    column: { size: 1, auto: true, max: 24 },
    row: { size: 0, auto: true, max: 2000 },
    folding: { active: false, rows: new Map() },
    isFocusing: 'none'
  }
};

export const LAYOUT_TYPES: TypesConfig<LayoutState, LayoutTypes> = {
  layout: {
    display: {
      mode: [
        {
          value: 0,
          type: 'dual',
          label: { en: 'dual', fr: 'dual' },
          description: { en: 'dual', fr: 'dual' }
        },
        {
          value: 1,
          type: 'hex',
          label: { en: 'hex', fr: 'hex' },
          description: { en: 'hex', fr: 'hex' }
        },
        {
          value: 2,
          type: 'text',
          label: { en: 'text', fr: 'text' },
          description: { en: 'text', fr: 'text' }
        }
      ]
    },
    isFocusing: [
      {
        value: 0,
        type: 'none',
        label: { en: 'none', fr: 'none' },
        description: { en: 'none', fr: 'none' }
      },
      {
        value: 1,
        type: 'toolbar',
        label: { en: 'toolbar', fr: 'toolbar' },
        description: { en: 'toolbar', fr: 'toolbar' }
      },
      {
        value: 2,
        type: 'body',
        label: { en: 'body', fr: 'body' },
        description: { en: 'body', fr: 'body' }
      }
    ]
  }
};
