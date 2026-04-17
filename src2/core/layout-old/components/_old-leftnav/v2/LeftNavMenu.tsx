import { ChevronRight } from '@mui/icons-material';
import { ClickAwayListener, Collapse, Fade, Paper, Popper, Stack, useTheme } from '@mui/material';
import { useCallback, useState, type FC, type SyntheticEvent } from 'react';
import {
  type LeftNavActionProps,
  type LeftNavChildRenderProps,
  type LeftNavMenuProps,
  type LeftNavRouteProps,
  type LeftNavSlotProps
} from '.';
import { useAppLeftNav, useAppUser } from '../../app';
import type { AppUser, AppUserService } from '../../user';
import { LeftNavAction } from './LeftNavAction';
import { LeftNavRoute } from './LeftNavRoute';
import { LeftNavSlot } from './LeftNavSlot';
import { usePathMatcher } from './hooks/usePathMatcher';

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

  const pathMatch = usePathMatcher();
  const theme = useTheme();
  const users = useAppUser();

  const { open: navopen, closeMenu, toggleMenu } = useAppLeftNav();

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
  const { menus } = useAppLeftNav();

  return menus.map(menu => <LeftNavMenu key={menu.id} {...menu} context="accordion" level={0} />);
};
