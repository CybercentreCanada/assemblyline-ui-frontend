import {
  Avatar,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  Paper,
  Popper,
  Typography,
  useTheme
} from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useUser from 'commons/components/hooks/useAppUser';
import useGravatar from 'commons/components/hooks/useGravatar';
import ThemeSelection from 'commons/components/layout/topnav/ThemeSelection';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const useStyles = makeStyles(theme => ({
  popper: {
    zIndex: theme.zIndex.drawer + 2,
    minWidth: '280px'
  },
  avatarButton: {
    padding: 0,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  iconButton: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      width: theme.spacing(4),
      height: theme.spacing(4)
    }
  }
}));

export type UserMenuElement = {
  name: string;
  route: string;
  icon?: React.ReactElement<any>;
};

const UserProfile = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user: currentUser } = useUser();
  const { layoutProps } = useAppLayout();
  const gravatarUrl = useGravatar(layoutProps.allowGravatar ? currentUser.email : null);
  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const sp2 = theme.spacing(2);
  const sp3 = theme.spacing(3);

  const onProfileClick = (event: React.MouseEvent) => {
    setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget);
  };

  const onClickAway = () => setPopperAnchorEl(null);
  const isPopperOpen = !!popperAnchorEl;

  const renderThemeSelection = enabled => {
    if (enabled) {
      return (
        <div>
          <Divider />
          <ThemeSelection />
        </div>
      );
    }
    return null;
  };

  const renderMenu = (type, menuItems, title) => {
    if (menuItems !== undefined && menuItems !== null && menuItems.length !== 0) {
      return (
        <div>
          <Divider />
          <List dense subheader={<ListSubheader disableSticky>{title}</ListSubheader>}>
            {menuItems.map((a, i) => (
              <ListItem button component={Link} to={a.route} key={`${type}-${i}`}>
                {a.icon && <ListItemIcon>{a.icon}</ListItemIcon>}
                <ListItemText>{a.name}</ListItemText>
              </ListItem>
            ))}
          </List>
        </div>
      );
    }
    return null;
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <IconButton edge="end" className={classes.avatarButton} onClick={onProfileClick}>
        <Avatar
          className={classes.iconButton}
          alt={currentUser.name}
          src={currentUser.avatar ? currentUser.avatar : gravatarUrl}
        >
          {currentUser.name
            .split(' ', 2)
            .map(n => n[0].toUpperCase())
            .join('')}
        </Avatar>
        <Popper
          open={isPopperOpen}
          anchorEl={popperAnchorEl}
          className={classes.popper}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <Paper style={{ padding: theme.spacing(1) }} elevation={4}>
                <List disablePadding>
                  <ListItem disableGutters dense>
                    <div
                      style={{
                        display: 'flex',
                        paddingTop: sp2,
                        paddingBottom: sp2,
                        paddingLeft: sp3,
                        paddingRight: sp3,
                        alignItems: 'center'
                      }}
                    >
                      <Avatar
                        style={{
                          width: theme.spacing(8),
                          height: theme.spacing(8)
                        }}
                        alt={currentUser.name}
                        src={currentUser.avatar ? currentUser.avatar : gravatarUrl}
                      >
                        {currentUser.name
                          .split(' ', 2)
                          .map(n => n[0].toUpperCase())
                          .join('')}
                      </Avatar>
                      <div style={{ paddingLeft: sp2 }}>
                        <Typography variant="body1" noWrap>
                          <b>{currentUser.name}</b>
                        </Typography>
                        <Typography variant="caption" noWrap>
                          {currentUser.email}
                        </Typography>
                      </div>
                    </div>
                  </ListItem>
                </List>
                {renderMenu('usermenu', layoutProps.topnav.userMenu, layoutProps.topnav.userMenuTitle)}
                {currentUser.is_admin &&
                  renderMenu('adminmenu', layoutProps.topnav.adminMenu, layoutProps.topnav.adminMenuTitle)}
                {renderThemeSelection(layoutProps.topnav.themeSelectionUnder === 'profile')}
              </Paper>
            </Fade>
          )}
        </Popper>
      </IconButton>
    </ClickAwayListener>
  );
};

export default UserProfile;
