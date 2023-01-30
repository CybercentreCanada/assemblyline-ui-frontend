import { TableColumnField } from './types';

export interface TableListLayout {
  cw: number;
  hw: number;
  bw: number;
  columnWidths: string[];
}

export default class TableListLayoutComputer {
  private containerEL: HTMLDivElement;

  private headerEL: HTMLDivElement;

  private bodyEL: HTMLDivElement;

  private columns: TableColumnField[];

  constructor(
    containerEL: HTMLDivElement,
    headerEL: HTMLDivElement,
    bodyEL: HTMLDivElement,
    columns: TableColumnField[]
  ) {
    this.containerEL = containerEL;
    this.headerEL = headerEL;
    this.bodyEL = bodyEL;
    this.columns = columns;
  }

  public compute(): TableListLayout {
    const cw = this.containerEL.getBoundingClientRect().width;
    const hw = this.headerEL ? this.headerEL.getBoundingClientRect().width : 0;
    const bw = this.bodyEL.getBoundingClientRect().width;

    const layout = {
      cw,
      hw,
      bw,
      columnWidths: this.getColumnWidths(bw)
    };

    return layout;
  }

  private getColumnWidths(bodyWidth: number) {
    // First compute widths for columns that have it specified.
    const widths = this.columns.map(c => {
      if (c.width) {
        const cPerc = c.width / 12;
        const cPx = bodyWidth * cPerc;
        return cPx;
      }
      return null;
    });

    // Then spread the remaning width equally across remaining columns.
    const widthMeta = widths.reduce(
      (previous, c) => (c ? { count: previous.count + 1, totalSpace: previous.totalSpace + c } : previous),
      { count: 0, totalSpace: 0 }
    );
    const otherCpx = (bodyWidth - widthMeta.totalSpace) / (this.columns.length - widthMeta.count);

    // All together now...
    return widths.map(cw => `${cw || otherCpx}px`);
  }
}
