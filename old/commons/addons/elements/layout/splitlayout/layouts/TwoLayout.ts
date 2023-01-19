/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { Layout, LayoutComputer, LayoutState } from 'commons/addons/elements/layout/splitlayout/layouts/Layouts';

export default class TwoLayout implements LayoutComputer {
  private width: number;

  private leftOpen: boolean = true;

  private rightOpen: boolean;

  private previousState: LayoutState;

  private lastSplitLeftWidth: number;

  private lastSplitRightWidth: number;

  public constructor(public minLeftWidth: number, public minRightWidth: number, public initLeftWidthPerc: number) {}

  private next(nextState: LayoutState) {
    this.previousState = nextState;
    if (nextState.leftOpen && nextState.rightOpen) {
      this.lastSplitLeftWidth = nextState.leftWidth;
      this.lastSplitRightWidth = nextState.rightWidth;
    }
    this.leftOpen = nextState.leftOpen;
    this.rightOpen = nextState.rightOpen;
    this.width = nextState.width;
    nextState.layout = Layout.TWO;
    return nextState;
  }

  public init(width: number, rightEnabled: boolean): LayoutState {
    this.width = width;
    this.rightOpen = this.rightOpen === undefined && rightEnabled ? rightEnabled : this.rightOpen;
    const initWidths = this.getInitWidths();
    return this.next({
      leftOpen: this.leftOpen,
      rightOpen: this.rightOpen,
      leftWidth: initWidths.left,
      rightWidth: initWidths.right,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onBreakpointChange(width: number, rightEnabled: boolean, leftOpen: boolean, rightOpen: boolean) {
    this.width = width;
    if (!this.previousState) {
      this.rightOpen = rightOpen;
      const nextWidths = this.getInitWidths();
      this.next({
        leftOpen: this.leftOpen,
        leftWidth: nextWidths.left,
        rightOpen,
        rightWidth: nextWidths.right,
        width,
        layout: Layout.TWO
      });
    }
  }

  public onResize(width: number): LayoutState {
    this.width = width;
    // Both sides are openned.
    if (this.leftOpen && this.rightOpen) {
      // Next left based on percentage of previous state.
      const nextLeft = this.normalizeLeft(this.width * (this.previousState.leftWidth / this.previousState.width));

      // Next right base on on computed next left.
      const nextRight = this.normalizeRight(this.width - nextLeft);

      // Ensure it all fits in the new container width.
      const resized = this.resize(nextLeft, nextRight);

      return this.next({
        leftOpen: this.leftOpen,
        leftWidth: resized.leftWidth,
        rightOpen: this.rightOpen,
        rightWidth: resized.rightWidth,
        width: this.width,
        layout: Layout.TWO
      });
    }

    // One of the sides is collapsed.
    return this.next({
      leftOpen: this.leftOpen,
      leftWidth: this.leftOpen ? this.width : 0,
      rightOpen: this.rightOpen,
      rightWidth: this.rightOpen ? this.width : 0,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onManualResize(delta: number): LayoutState {
    const nextLeft = this.normalizeLeft(this.previousState.leftWidth + delta, true);
    const nextRight = this.normalizeRight(this.width - nextLeft, true);
    return this.next({
      leftOpen: nextLeft > 0,
      leftWidth: nextRight > 0 ? nextLeft : this.width,
      rightOpen: nextRight > 0,
      rightWidth: nextLeft > 0 ? nextRight : this.width,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onOpenLeft(): LayoutState {
    const nextLeftOpen = true;
    const nextLeft = this.normalizeLeft(this.getInitLeftWidth());
    const nextRight = this.normalizeRight(this.width - nextLeft);
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeft,
      rightOpen: this.rightOpen,
      rightWidth: nextRight,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onCloseLeft(): LayoutState {
    const nextLeftOpen = false;
    const nextLeft = 0;
    const nextRight = this.normalizeRight(this.width - nextLeft);
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeft,
      rightOpen: this.rightOpen,
      rightWidth: nextRight,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onOpenRight(): LayoutState {
    const nextRightOpen = true;
    const nextRight = this.normalizeRight(this.getInitRightWidth());
    const nextLeft = this.width - nextRight;
    return this.next({
      leftOpen: this.leftOpen,
      leftWidth: nextLeft,
      rightOpen: nextRightOpen,
      rightWidth: nextRight,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onCloseRight(): LayoutState {
    const nextRightOpen = false;
    const nextRight = 0;
    const nextLeft = this.width - nextRight;
    return this.next({
      leftOpen: this.leftOpen,
      leftWidth: nextLeft,
      rightOpen: nextRightOpen,
      rightWidth: nextRight,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onToggleLeft(): LayoutState {
    const nextLeftOpen = !this.leftOpen;
    const nextLeft = nextLeftOpen ? this.normalizeLeft(this.getInitLeftWidth()) : 0;
    const nextRight = this.normalizeRight(this.width - nextLeft);
    return this.next({
      leftOpen: nextLeftOpen,
      leftWidth: nextLeft,
      rightOpen: this.rightOpen,
      rightWidth: nextRight,
      width: this.width,
      layout: Layout.TWO
    });
  }

  public onToggleRight(): LayoutState {
    const nextRightOpen = !this.rightOpen;
    const nextRight = nextRightOpen ? this.normalizeRight(this.getInitRightWidth()) : 0;
    const nextLeft = this.width - nextRight;
    return this.next({
      leftOpen: this.leftOpen,
      leftWidth: nextLeft,
      rightOpen: nextRightOpen,
      rightWidth: nextRight,
      width: this.width,
      layout: Layout.TWO
    });
  }

  private getInitWidths() {
    if (this.leftOpen && this.rightOpen) {
      const left = this.normalizeLeft(this.getInitLeftWidth());
      return {
        left,
        right: this.width - left
      };
    }
    return {
      left: this.leftOpen ? this.width : 0,
      right: this.rightOpen ? this.width : 0
    };
  }

  private getInitLeftWidth() {
    if (!this.rightOpen) {
      return this.width;
    }
    return this.lastSplitLeftWidth || this.getLeftWidthPercent();
  }

  private getInitRightWidth() {
    if (!this.leftOpen) {
      return this.width;
    }
    return this.width - (this.lastSplitLeftWidth || this.getLeftWidthPercent());
  }

  private getLeftWidthPercent(): number {
    return this.width * (this.initLeftWidthPerc / 100);
  }

  private normalizeLeft(leftWidth: number, breakToZero: boolean = false): number {
    return leftWidth < this.minLeftWidth ? (breakToZero ? 0 : this.minLeftWidth) : leftWidth;
  }

  private normalizeRight(rightWidth: number, breakToZero: boolean = false): number {
    return rightWidth < this.minRightWidth ? (breakToZero ? 0 : this.minRightWidth) : rightWidth;
  }

  private resize(leftWidth: number, rightWidth: number): { leftWidth: number; rightWidth: number } {
    const nextLeft = this.width * (leftWidth / (leftWidth + rightWidth));
    const nextRight = this.width - nextLeft;
    return {
      leftWidth: nextLeft,
      rightWidth: nextRight
    };
  }
}
