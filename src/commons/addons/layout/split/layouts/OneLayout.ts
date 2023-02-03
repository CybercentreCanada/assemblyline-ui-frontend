/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { Layout, LayoutComputer, LayoutState } from 'commons/addons/layout/split/layouts/Layouts';

export default class OneLayout implements LayoutComputer {
  private width: number;

  private leftOpen: boolean = true;

  private rightOpen: boolean;

  private previousState: LayoutState;

  private next(nextState: LayoutState): LayoutState {
    this.previousState = nextState;
    this.leftOpen = nextState.leftOpen;
    this.rightOpen = nextState.rightOpen;
    this.width = nextState.width;
    nextState.layout = Layout.ONE;
    return nextState;
  }

  public init(width: number, rightEnabled: boolean): LayoutState {
    this.width = width;
    this.rightOpen = this.rightOpen === undefined && rightEnabled ? rightEnabled : this.rightOpen;
    this.leftOpen = !this.rightOpen;
    return this.next({
      leftOpen: this.leftOpen,
      rightOpen: this.rightOpen,
      leftWidth: this.leftOpen ? this.width : 0,
      rightWidth: this.rightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onBreakpointChange(width: number, rightEnabled: boolean, leftOpen: boolean, rightOpen: boolean) {
    this.width = width;
    this.next({
      leftOpen: !rightOpen,
      leftWidth: !rightOpen ? this.width : 0,
      rightOpen,
      rightWidth: rightOpen ? this.width : 0,
      width,
      layout: Layout.ONE
    });
  }

  public onResize(width: number): LayoutState {
    const nextLeftOpen = this.leftOpen;
    const nextRightOpen = this.rightOpen;
    this.width = width;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onManualResize(delta: number): LayoutState {
    // no manual resize within this breakpoint.
    return this.next(this.previousState);
  }

  public onOpenLeft(): LayoutState {
    const nextLeftOpen = true;
    const nextRightOpen = !nextLeftOpen;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? this.width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onOpenRight(): LayoutState {
    const nextRightOpen = true;
    const nextLeftOpen = !nextRightOpen;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? this.width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onCloseLeft(): LayoutState {
    const nextLeftOpen = false;
    const nextRightOpen = !nextLeftOpen;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? this.width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onCloseRight(): LayoutState {
    const nextRightOpen = false;
    const nextLeftOpen = !nextRightOpen;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? this.width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onToggleLeft(): LayoutState {
    const nextLeftOpen = !this.previousState.leftOpen;
    const nextRightOpen = !nextLeftOpen;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? this.width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }

  public onToggleRight(): LayoutState {
    const nextRightOpen = !this.previousState.rightOpen;
    const nextLeftOpen = !nextRightOpen;
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeftOpen ? this.width : 0,
      rightOpen: nextRightOpen,
      rightWidth: nextRightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.ONE
    });
  }
}
