import { ChevronRight } from '@mui/icons-material';
import { Button, ClickAwayListener, Collapse, Fade, Paper, Popper, Stack, Tooltip, Typography } from '@mui/material';
import { APP_LEFT_MENU_ITEMS } from 'app/app.layout';
import {
  FC,
  HTMLAttributeAnchorTarget,
  PropsWithChildren,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useMemo,
  useState
} from 'react';
import { useTranslation } from 'react-i18next';

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

export const LeftNavAction: FC<
  LeftNavActionProps & LeftNavChildRenderProps & { disableCollapse?: boolean }
> = props => {
  const { open: navopen, collapseMenus } = useAppLeftNav();

  const onClick = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      props.action(event, props);
      if (!navopen && !props.disableCollapse) {
        collapseMenus();
      }
    },
    [collapseMenus, navopen, props]
  );

  return (
    <Button
      fullWidth
      onClick={onClick}
      variant="outlined"
      color="inherit"
      sx={{
        border: 'none',
        p: 0,
        textTransform: 'none',
        borderRadius: 0,
        '&:hover': {
          bgcolor: 'inherit'
        }
      }}
    >
      <LeftNavItem {...props} />
    </Button>
  );
};

export const LeftNavItem: FC<LeftNavItemProps & LeftNavChildRenderProps> = ({
  icon,
  label,
  i18nKey,
  tooltipI18nKey,
  level,
  active,
  activeParent,
  context,
  children
}) => {
  const { t: clientT } = useTranslation();
  const { open: navopen } = useAppLeftNav();

  const tooltip = useMemo(() => {
    if (tooltipI18nKey) {
      return clientT(tooltipI18nKey);
    }
    return !navopen && level === 0 ? (i18nKey ? clientT(i18nKey) : label) : '';
  }, [navopen, clientT, level, i18nKey, label, tooltipI18nKey]);

  return (
    <Tooltip title={tooltip} placement="right">
      <Stack direction="row" alignItems="center" position="relative" width="100%">
        <Stack
          direction="row"
          alignItems="center"
          pt={1.5}
          pb={1.5}
          pl={context === 'accordion' ? 2 * (level + 1) : 3}
          pr={context === 'accordion' ? 2 : 3}
          width="100%"
          className={`${active ? 'active' : ''} ${activeParent ? 'active_parent' : ''}`}
          position="relative"
          zIndex={0}
          sx={theme => ({
            '& > *': {
              zIndex: 1
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 12,
              left: 6,
              bottom: 12,
              width: '4px',
              borderRadius: 1,
              bgcolor: 'transparent',
              zIndex: 0
            },
            '&.active_parent::before': {
              bgcolor: 'primary.main',
              top: 22,
              bottom: 22,
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 0,
              opacity: 0,
              zIndex: 0
            },
            '&.active::after': {
              opacity: 0.1,
              top: 8,
              right: context === 'popper' || navopen ? 12 : 10,
              bottom: 8,
              left: 11,
              borderRadius: 1,
              bgcolor: theme.palette.primary.main
            },
            '&:hover::after': {
              opacity: 1,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 0,
              background: theme.palette.action.hover
            }
          })}
        >
          <div style={{ display: icon ? 'inline-flex' : 'none', flexShrink: 0, minWidth: 56 }}>{icon}</div>
          <Typography mr={i18nKey || label ? 1 : 0}>{i18nKey ? clientT(i18nKey) : label}</Typography>
          {children}
        </Stack>
      </Stack>
    </Tooltip>
  );
};

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

export const LeftNavSlot: FC<LeftNavSlotProps & LeftNavChildRenderProps> = props => {
  const { open: navopen } = useAppLeftNav();

  if (props.render) {
    return props.render(navopen, props);
  }

  if (!props.component) {
    throw new Error('LeftNavSlot: either "render" or "component" prop must be provided.');
  }

  return props.withProps ? <props.component {...props} /> : <props.component />;
};

const LeftNavMenuChildren: FC<LeftNavMenuProps & LeftNavChildRenderProps & { users: AppUserService<AppUser> }> = ({
  users,
  items,
  level,
  context
}) => {
  return items.map(
    child =>
      ({
        menu: users.validateProps(child.validators) ? (
          <LeftNavMenu {...(child as LeftNavMenuProps)} key={child.id} context={context} level={level + 1} />
        ) : null,
        route: users.validateProps(child.validators) ? (
          <LeftNavRoute {...(child as LeftNavRouteProps)} key={child.id} context={context} level={level} />
        ) : null,
        action: users.validateProps(child.validators) ? (
          <LeftNavAction {...(child as unknown as LeftNavActionProps)} key={child.id} context={context} level={level} />
        ) : null,
        slot: users.validateProps(child.validators) ? (
          <LeftNavSlot {...(child as LeftNavSlotProps)} key={child.id} context={context} level={level} />
        ) : null
      })[child.type]
  );
};

export const LeftNavMenu: FC<LeftNavMenuProps & Omit<LeftNavChildRenderProps, 'children'>> = props => {
  const { id, label, i18nKey, tooltipI18nKey, icon, level, expanded, popped } = props;

  // const pathMatch = usePathMatcher();
  // const theme = useTheme();
  // const users = useAppUser();

  // const { open: navopen, closeMenu, toggleMenu } = useAppLeftNav();

  console.log(props);

  const [popoverTarget, setPopoverTarget] = useState<(EventTarget & Element) | undefined>();

  const _level = level ?? 0;
  const _menuOpen = _level === 0 || (navopen && expanded);
  const _popoverOpen = !navopen && popped && !!popoverTarget;

  const onClick = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      setPopoverTarget(!navopen ? event.currentTarget : null);
      toggleMenu(id);
    },
    [id, navopen, toggleMenu]
  );

  const onPopoverClose = useCallback(() => {
    if (_popoverOpen) {
      setPopoverTarget(null);
      closeMenu(id);
    }
  }, [id, _popoverOpen, closeMenu]);

  return (
    <ClickAwayListener onClickAway={onPopoverClose}>
      <Stack
        position="relative"
        className={open ? 'open' : null}
        sx={
          level > 0 &&
          navopen && {
            '&::before': {
              content: '""',
              position: 'absolute',
              zIndex: 1,
              left: 12 * _level + 6,
              top: 40,
              bottom: 4,
              width: '1px',
              boxShadow: `inset 0 0 0 0.5px ${theme.palette.text.disabled}`,
              transform: 'scaleY(0)',
              transformOrigin: 'center',
              transition: 'transform 200ms ease-out',
              opacity: 0.4
            },
            '&:hover::before': {
              transform: _menuOpen && 'scaleY(1)'
            }
          }
        }
      >
        {(i18nKey || label) && (
          <Stack direction="row">
            <LeftNavAction
              disableCollapse
              type="action"
              context={props.context}
              id={id}
              tooltipI18nKey={tooltipI18nKey}
              i18nKey={i18nKey}
              label={label}
              icon={icon}
              level={_level - 1}
              activeParent={props.route && pathMatch(props.route, { matchEnd: false })}
              action={onClick}
            >
              <ChevronRight
                sx={theme => ({
                  position: 'absolute',
                  top: 16,
                  right: 8,
                  width: 16,
                  height: 16,
                  transform: (expanded && navopen && 'rotate(90deg)') || (popped && !navopen && 'rotate(180deg)'),
                  transition: theme.transitions.create('transform', {
                    easing: theme.transitions.easing.sharp,
                    duration:
                      expanded || open
                        ? theme.transitions.duration.leavingScreen
                        : theme.transitions.duration.enteringScreen
                  })
                })}
                fontSize="inherit"
              />
            </LeftNavAction>
          </Stack>
        )}
        <Collapse in={_menuOpen} timeout={150} unmountOnExit={!props.keepMounted}>
          <LeftNavMenuChildren {...props} level={_level} users={users} />
        </Collapse>
        {!navopen && (
          <Popper
            open={_popoverOpen}
            anchorEl={popoverTarget}
            placement="right-start"
            transition
            sx={theme => ({ zIndex: theme.zIndex.appBar + 1 })}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper elevation={props.level + 2}>
                  <LeftNavMenuChildren {...props} context="popper" level={_level} users={users} />
                </Paper>
              </Fade>
            )}
          </Popper>
        )}
      </Stack>
    </ClickAwayListener>
  );
};

export const LeftNavMenuRoot = () => {
  return APP_LEFT_MENU_ITEMS.map(menu => <LeftNavMenu key={menu.id} {...menu} context="accordion" level={0} />);
};
