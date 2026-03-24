import { useCallback, type FC } from 'react';
import type { LeftNavChildRenderProps, LeftNavRouteProps } from '.';
import { useAppLeftNav, useAppRouter } from '../../app';
import { usePathMatcher } from './hooks/usePathMatcher';
import { LeftNavItem } from './LeftNavItem';
export const LeftNavRoute: FC<LeftNavRouteProps & LeftNavChildRenderProps> = props => {
  const matcher = usePathMatcher();

  const { Link } = useAppRouter();

  const { open: navopen, collapseMenus } = useAppLeftNav();

  const onClick = useCallback(() => {
    if (!navopen) {
      collapseMenus();
    }
  }, [navopen, collapseMenus]);

  return (
    <Link
      to={props.route}
      style={{ display: 'flex', textDecoration: 'none', color: 'inherit', width: '100%' }}
      className="tui-navitem"
      onClick={onClick}
    >
      <LeftNavItem {...props} active={matcher(props.route, { matcher: props.matcher })} />
    </Link>
  );
};
