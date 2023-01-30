/* eslint-disable class-methods-use-this */
import OneLayout from './OneLayout';
import TwoLayout from './TwoLayout';

export interface LayoutState {
  leftOpen: boolean;
  rightOpen: boolean;
  leftWidth: number;
  rightWidth: number;
  width: number;
  layout: Layout;
}

export interface LayoutComputer {
  init: (width: number, rightEnabled: boolean) => LayoutState;
  onBreakpointChange: (width: number, rightEnabled: boolean, leftOpen: boolean, rightOpen: boolean) => void;
  onResize: (width: number) => LayoutState;
  onManualResize: (detla: number) => LayoutState;
  onOpenLeft: () => LayoutState;
  onCloseLeft: () => LayoutState;
  onOpenRight: () => LayoutState;
  onCloseRight: () => LayoutState;
  onToggleLeft: () => LayoutState;
  onToggleRight: () => LayoutState;
}

export enum Layout {
  ONE,
  TWO
}

export default class Layouts implements LayoutComputer {
  private width: number;

  private rightEnabled: boolean;

  private state: LayoutState;

  private twoLayout: LayoutComputer;

  private oneLayout: LayoutComputer;

  private layout: Layout;

  public constructor(public minLeftWidth: number, public minRightWidth: number, initLeftWidthPerc: number) {
    this.twoLayout = new TwoLayout(minLeftWidth, minRightWidth, initLeftWidthPerc);
    this.oneLayout = new OneLayout();
  }

  private next(state: LayoutState): LayoutState {
    this.state = state;
    return state;
  }

  private getLayout(): Layout {
    if (this.minLeftWidth + this.minRightWidth > this.width) {
      return Layout.TWO;
    }
    return Layout.ONE;
  }

  private computer(breakpoint: Layout): LayoutComputer {
    switch (breakpoint) {
      case Layout.ONE:
        return this.twoLayout;
      case Layout.TWO:
        return this.oneLayout;
      default:
        return this.twoLayout;
    }
  }

  private nextComputer(): LayoutComputer {
    const layout = this.getLayout();
    const nextComputer = this.computer(layout);
    if (this.layout !== undefined && layout !== this.layout) {
      nextComputer.onBreakpointChange(this.width, this.rightEnabled, this.state.leftOpen, this.state.rightOpen);
    }
    this.layout = layout;
    return nextComputer;
  }

  init(width: number, rightEnabled: boolean): LayoutState {
    this.width = width;
    this.rightEnabled = rightEnabled;
    return this.next(this.nextComputer().init(width, rightEnabled));
  }

  onResize(width: number): LayoutState {
    this.width = width;
    return this.next(this.nextComputer().onResize(width));
  }

  onManualResize(delta: number): LayoutState {
    return this.next(this.nextComputer().onManualResize(delta));
  }

  onOpenLeft(): LayoutState {
    return this.next(this.nextComputer().onOpenLeft());
  }

  onCloseLeft(): LayoutState {
    return this.next(this.nextComputer().onCloseLeft());
  }

  onOpenRight(): LayoutState {
    return this.next(this.nextComputer().onOpenRight());
  }

  onCloseRight(): LayoutState {
    return this.next(this.nextComputer().onCloseRight());
  }

  onToggleLeft(): LayoutState {
    return this.next(this.nextComputer().onToggleLeft());
  }

  onToggleRight(): LayoutState {
    return this.next(this.nextComputer().onToggleRight());
  }

  onBreakpointChange(width: number, rightEnabled: boolean, leftOpen: boolean, rightOpen: boolean) {
    // nothing to do here.
  }
}
