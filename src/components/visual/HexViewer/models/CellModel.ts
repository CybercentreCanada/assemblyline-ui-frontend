import { TypesConfig } from '..';

export type CellType = 'hex' | 'text';
export type CellTypes = CellType;

export type CellState = {
  cell: {
    mouseEnterIndex: number;
    mouseLeaveIndex: number;
    mouseDownIndex: number;
    mouseUpIndex: number;
    isMouseDown: boolean;
    mouseOverType: CellType;
  };
};

export const CELL_STATE: CellState = {
  cell: {
    mouseEnterIndex: null,
    mouseLeaveIndex: null,
    mouseDownIndex: null,
    mouseUpIndex: null,
    isMouseDown: false,
    mouseOverType: 'hex'
  }
};

export const CELL_TYPES: TypesConfig<CellState, CellTypes> = {
  cell: {
    mouseOverType: [
      {
        value: 0,
        type: 'hex',
        label: { en: 'hex', fr: 'hex' },
        description: { en: 'hex', fr: 'hex' }
      },
      {
        value: 1,
        type: 'text',
        label: { en: 'text', fr: 'text' },
        description: { en: 'text', fr: 'text' }
      }
    ]
  }
};
