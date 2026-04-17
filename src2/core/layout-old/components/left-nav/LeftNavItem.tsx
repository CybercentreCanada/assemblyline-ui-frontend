import { ChevronRight } from '@mui/icons-material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  ClickAwayListener,
  Collapse,
  Divider,
  Fade,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  useTheme
} from '@mui/material';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { useAppLeftMenuItems } from 'core/layout';
import { AppListItemLink } from 'core/router/navigate/navigate.components';
import React, { useCallback, useState } from 'react';
import {
  AppLayoutLeftNavComponent,
  AppLayoutLeftNavItem,
  AppLayoutLeftNavMenu,
  AppLayoutLeftNavRoute
} from '../../layout.models';
import { closeMenu, resolveConfigItem, toggleMenu } from '../../layout.utils';

const INDENT_STEP = 2;
const ITEM_MIN_HEIGHT = 48;

const textVariantForLevel = (level: number): 'body1' | 'body2' | 'caption' => {
  if (level <= 0) return 'body1';
  if (level === 1) return 'body2';
  return 'caption';
};

const sxForLevel = (level: number) => {
  if (level <= 0) return null;
  if (level === 1)
    return {
      paddingTop: 0.5,
      paddingBottom: 0.5,
      paddingLeft: 4
    };
  return null;
};

//*****************************************************************************************
// LeftNavMenu
//*****************************************************************************************

export type LeftNavMenuProps = {
  item: AppLayoutLeftNavMenu;
  indexPath: number[];
  level: number;
};

export const LeftNavMenu = React.memo(({ item, indexPath, level }: LeftNavMenuProps) => {
  const { primary, icon, items } = item;

  const theme = useTheme();

  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);
  const expanded = useAppConfig(s => resolveConfigItem(s.layout.leftNav.menu, indexPath).expanded);
  const popped = useAppConfig(s => resolveConfigItem(s.layout.leftNav.menu, indexPath).popped);
  const childrens = useAppConfig(s => resolveConfigItem(s.layout.leftNav.menu, indexPath).items);
  const setConfig = useAppSetConfig();

  const [anchorEl, setAnchorTarget] = useState<(EventTarget & Element) | undefined>();

  const handleMenuToggle = useCallback(() => {
    setConfig(s => toggleMenu(s, indexPath));
  }, []);

  const handleClosePopover = useCallback(() => setConfig(s => closeMenu(s, indexPath)), []);

  return (
    <ClickAwayListener onClickAway={handleClosePopover}>
      <>
        <Tooltip
          title={leftNavOpen ? null : item.primary}
          placement="right"
          slotProps={{ popper: { disablePortal: false } }}
        >
          <ListItem disablePadding>
            <ListItemButton onClick={handleMenuToggle} sx={sxForLevel(level)}>
              <ListItemIcon>
                {icon}
                {!leftNavOpen && (
                  <ChevronRight
                    sx={theme => ({
                      position: 'absolute',
                      top: 16,
                      right: 0,
                      width: 16,
                      height: 16,
                      transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.shortest
                      }),
                      transform: popped ? 'rotate(180deg)' : 'rotate(0deg)'
                    })}
                    fontSize="inherit"
                  />
                )}
              </ListItemIcon>
              <ListItemText primary={primary} slotProps={{ primary: { variant: textVariantForLevel(level) } }} />
              <ExpandMore
                sx={{
                  ml: 'auto',
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shortest
                  }),
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Collapse in={expanded} timeout="auto">
          <List component="div" disablePadding>
            {items.map((child, childIndex) => (
              <LeftNavItem key={child.primary} item={child} indexPath={[...indexPath, childIndex]} level={level + 1} />
            ))}
          </List>
        </Collapse>

        {leftNavOpen ? null : (
          <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="right-start"
            transition
            sx={muiTheme => ({ zIndex: muiTheme.zIndex.appBar + 1 })}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={250}>
                <Paper elevation={4} sx={{ minWidth: 240 }}>
                  <List disablePadding>
                    {childrens.map((child, childIndex) => (
                      <LeftNavItem
                        key={child.primary}
                        item={child}
                        indexPath={[...indexPath, childIndex]}
                        level={level + 1}
                      />
                    ))}
                  </List>
                </Paper>
              </Fade>
            )}
          </Popper>
        )}
      </>
    </ClickAwayListener>
  );

  // const context = 'accordion';

  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // const childrens = useMemo(() => (items ?? []).filter(child => !child?.disabled), [item]);

  // const hasChildren = childrens.length > 0;
  // const expanded = Boolean(configItem?.expanded);
  // const popped = Boolean(configItem?.popped);
  // const isDisabled = Boolean(item.disabled);
  // const popperOpen = !leftNavOpen && hasChildren && popped && Boolean(anchorEl);

  // const setExpanded = useCallback(
  //   (value: boolean) => {
  //     setConfig(s => {
  //       const target = mutateConfigItem(s.layout.leftNav.menu, indexPath);
  //       if (target) target.expanded = value;
  //       return s;
  //     });
  //   },
  //   [indexPath, setConfig]
  // );

  // const setPopped = useCallback(
  //   (value: boolean) => {
  //     setConfig(s => {
  //       const target = mutateConfigItem(s.layout.leftNav.menu, indexPath);
  //       if (target) target.popped = value;
  //       return s;
  //     });
  //   },
  //   [indexPath, setConfig]
  // );

  // const handleMenuToggle = useCallback(
  //   (event: React.MouseEvent<HTMLElement>) => {
  //     if (isDisabled) return;

  //     if (hasChildren) {
  //       if (leftNavOpen) {
  //         setExpanded(!expanded);
  //       } else {
  //         setAnchorEl(event.currentTarget);
  //         setPopped(!popped);
  //       }
  //       return;
  //     }

  //     if (item.onClick) {
  //       item.onClick(event, item);
  //     }

  //     if (!leftNavOpen) {
  //       setPopped(false);
  //     }
  //   },
  //   [expanded, hasChildren, isDisabled, item, leftNavOpen, popped, setExpanded, setPopped]
  // );

  // const handleLeafClick = useCallback(
  //   (event: React.MouseEvent<HTMLElement>) => {
  //     if (isDisabled) return;
  //     if (item.onClick) {
  //       item.onClick(event, item);
  //     }
  //     if (!leftNavOpen) {
  //       setPopped(false);
  //     }
  //   },
  //   [isDisabled, item, leftNavOpen, setPopped]
  // );

  // const closePopper = useCallback(() => {
  //   setAnchorEl(null);
  //   setPopped(false);
  // }, [setPopped]);

  // const renderContext = useMemo<AppLayoutLeftNavRenderContext>(
  //   () => ({
  //     level,
  //     context,
  //     hasChildren,
  //     expanded,
  //     popped,
  //     disabled: isDisabled,
  //     leftNavOpen,
  //     closeMenu: closePopper,
  //     toggleMenu: (event?: React.MouseEvent<HTMLElement>) => {
  //       if (event?.currentTarget) setAnchorEl(event.currentTarget);

  //       if (leftNavOpen) {
  //         setExpanded(!expanded);
  //       } else {
  //         setPopped(!popped);
  //       }
  //     }
  //   }),
  //   [closePopper, context, expanded, hasChildren, isDisabled, leftNavOpen, level, popped, setExpanded, setPopped]
  // );

  // const baseSx = {
  //   minHeight: ITEM_MIN_HEIGHT,
  //   pl: context === 'accordion' ? 2 + level * INDENT_STEP : 2,
  //   pr: 2
  // };

  return (
    <ClickAwayListener onClickAway={handleClosePopover}>
      <>
        <Tooltip
          title={leftNavOpen ? null : item.primary}
          placement="right"
          slotProps={{ popper: { disablePortal: false } }}
        >
          <ListItem disablePadding>
            <ListItemButton onClick={handleMenuToggle} sx={baseSx}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={primary} slotProps={{ primary: { variant: textVariantForLevel(level) } }} />
              <ExpandMore
                sx={{
                  ml: 'auto',
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shortest
                  }),
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {childrens.map((child, childIndex) => (
              <LeftNavItem key={child.primary} item={child} indexPath={[...indexPath, childIndex]} level={level + 1} />
            ))}
          </List>
        </Collapse>

        {leftNavOpen ? null : (
          <Popper
            open={popperOpen}
            anchorEl={anchorEl}
            placement="right-start"
            transition
            sx={muiTheme => ({ zIndex: muiTheme.zIndex.appBar + 1 })}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={250}>
                <Paper elevation={4} sx={{ minWidth: 240 }}>
                  <List disablePadding>
                    {childrens.map((child, childIndex) => (
                      <LeftNavItem
                        key={child.primary}
                        item={child}
                        indexPath={[...indexPath, childIndex]}
                        level={level + 1}
                      />
                    ))}
                  </List>
                </Paper>
              </Fade>
            )}
          </Popper>
        )}
      </>
    </ClickAwayListener>
  );
});

LeftNavMenu.displayName = 'LeftNavMenu';

//*****************************************************************************************
// LeftNavItem
//*****************************************************************************************

export type LeftNavComponentProps = {
  item: AppLayoutLeftNavComponent;
  indexPath: number[];
  level: number;
};

export const LeftNavComponent = React.memo(({ item, indexPath, level }: LeftNavComponentProps) => {
  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);

  return item.render(leftNavOpen, item);
});

LeftNavComponent.displayName = 'LeftNavComponent';

//*****************************************************************************************
// LeftNavLink
//*****************************************************************************************

export type LeftNavRouteProps = {
  item: AppLayoutLeftNavRoute;
  indexPath: number[];
  level: number;
};

export const LeftNavRoute = React.memo(({ item, indexPath, level }: LeftNavRouteProps) => {
  const { primary, route, icon } = item;

  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);

  return (
    <Tooltip title={leftNavOpen ? null : primary} placement="right" slotProps={{ popper: { disablePortal: false } }}>
      <ListItem disablePadding>
        <AppListItemLink path={route} variant="to" panel={0} params={null} sx={sxForLevel(level)}>
          {icon && level === 0 && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText primary={primary} slotProps={{ primary: { variant: textVariantForLevel(level) } }} />
        </AppListItemLink>
      </ListItem>
    </Tooltip>
  );
});

LeftNavRoute.displayName = 'LeftNavRoute';

//*****************************************************************************************
// LeftNavItem
//*****************************************************************************************

export type LeftNavItemProps = {
  item: AppLayoutLeftNavItem;
  indexPath: number[];
  level: number;
};

export const LeftNavItem = React.memo(({ item, indexPath, level = 0 }: LeftNavItemProps) => {
  if (item?.disabled || false) return null;

  return (
    <>
      {item?.divider && <Divider />}
      {(() => {
        if ('items' in item) return <LeftNavMenu item={item} indexPath={indexPath} level={level} />;
        else if ('route' in item) return <LeftNavRoute item={item} indexPath={indexPath} level={level} />;
        else if ('render' in item) return <LeftNavComponent item={item} indexPath={indexPath} level={level} />;
        else return null;
      })()}
    </>
  );
});

LeftNavItem.displayName = 'LeftNavItem';

//*****************************************************************************************
// LeftNavMenuRoot
//*****************************************************************************************

export const LeftNavMenuRoot = React.memo(() => {
  const menuItems = useAppLeftMenuItems();
  const menuState = useAppConfig(s => s.layout.leftNav.menu);

  return !menuState ? null : (
    <List disablePadding sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
      {menuItems.map((item, index) => (
        <LeftNavItem key={item.primary} item={item} indexPath={[index]} level={0} />
      ))}
    </List>
  );
});

LeftNavMenuRoot.displayName = 'LeftNavMenuRoot';
