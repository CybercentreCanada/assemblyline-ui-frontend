import type { FC, HTMLAttributeAnchorTarget, PropsWithChildren, ReactElement, SyntheticEvent } from 'react';
import type { AppUserValidatedProp } from '../../user';
import { LeftNavAction } from './LeftNavAction';
import { LeftNavItem } from './LeftNavItem';
import { LeftNavRoute } from './LeftNavRoute';
import { usePathMatcher } from './hooks/usePathMatcher';

export { LeftNavAction, LeftNavItem, LeftNavRoute, usePathMatcher };

export type LeftNavMenuItem = LeftNavMenuProps | LeftNavRouteProps | LeftNavActionProps | LeftNavSlotProps;

export type LeftNavChildRenderProps = PropsWithChildren & {
  level: number;
  context: 'accordion' | 'popper';
  active?: boolean;
  activeParent?: boolean;
};

export type LeftNavChildProps = {
  id: string | number;
  validators?: AppUserValidatedProp[];
};

export type LeftNavItemProps = LeftNavChildProps & {
  label?: string;
  i18nKey?: string;
  icon?: ReactElement<any>;
  tooltipI18nKey?: string;
};

export type LeftNavMenuProps = LeftNavItemProps & {
  type: 'menu';
  route?: string;
  expanded?: boolean; // when leftnav is open - opens collapsible menu.
  popped?: boolean; // when leftnav is closed - opens popper menu.
  keepMounted?: boolean; // set to true to keep elements in dom tree when expanded is false.
  items: LeftNavMenuItem[];
};

export type LeftNavSlotProps = LeftNavChildProps & {
  type: 'slot';
  withProps?: boolean;
  component?: FC<any>;
  render?: (navopen: boolean, props?: LeftNavChildRenderProps) => ReactElement;
};

export type LeftNavRouteProps = LeftNavItemProps & {
  type: 'route';
  route: string;
  matcher?: RegExp;
  target?: HTMLAttributeAnchorTarget;
};

export type LeftNavActionProps = LeftNavItemProps & {
  type: 'action';
  action: (event: SyntheticEvent<HTMLElement>, props?: Omit<LeftNavActionProps, 'type'>) => void;
};

export const traverse = (menu: LeftNavMenuProps, action: (props: LeftNavMenuItem, agg: any) => void, agg: any): any => {
  action(menu, agg);
  for (const child of menu.items) {
    if (child.type === 'menu') {
      traverse(child, action, agg);
    } else {
      action(child, agg);
    }
  }
  return agg;
};

export const visit = (
  items: LeftNavMenuItem[],
  accept: (props: LeftNavMenuItem) => boolean,
  action: (props: LeftNavMenuItem) => LeftNavMenuItem
): LeftNavMenuItem[] => {
  return items
    .filter(child => !!child) // remove nulls before.
    .map(child => {
      if (accept(child)) {
        child = action(child);
      }

      if (child?.type === 'menu') {
        const menu = child as unknown as LeftNavMenuProps;
        return { ...menu, items: visit(menu.items, accept, action) };
      }

      return child;
    })
    .filter(child => !!child); // remove nulls after.
};
