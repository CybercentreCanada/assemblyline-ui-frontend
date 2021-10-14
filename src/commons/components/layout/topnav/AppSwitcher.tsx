import {
  Avatar,
  Button,
  ClickAwayListener,
  Fade,
  IconButton,
  Link,
  makeStyles,
  Paper,
  Popper,
  Typography,
  useTheme
} from '@material-ui/core';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import AppsIcon from '@material-ui/icons/Apps';
import React, { useState } from 'react';

export type AppElement = {
  alt: string;
  name: string;
  img_d: React.ReactElement<any> | string;
  img_l: React.ReactElement<any> | string;
  route: string;
  newWindow?: boolean;
};

const useStyles = makeStyles(theme => ({
  popper: {
    zIndex: theme.zIndex.drawer + 2
  },
  avatarIcon: {
    '& img': {
      objectFit: 'contain'
    }
  }
}));

type AppsSwitcherProps = {
  apps: AppElement[];
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const AppSwitcher: React.FC<AppsSwitcherProps> = ({ apps, width }) => {
  const theme = useTheme();
  const classes = useStyles();
  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const isDarkTheme = theme.palette.type === 'dark';
  const isPopperOpen = !!popperAnchorEl;
  const onTogglePopper = event => {
    setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget);
  };
  const onClickAway = () => setPopperAnchorEl(null);
  const sp1 = theme.spacing(1);

  if (apps.length === 0) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <IconButton color="inherit" onClick={onTogglePopper}>
        <AppsIcon />
        <Popper
          open={isPopperOpen}
          anchorEl={popperAnchorEl}
          placement="bottom-end"
          className={classes.popper}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <Paper style={{ textAlign: 'center', padding: theme.spacing(1) }} elevation={4}>
                <div
                  style={{
                    maxWidth: apps.length <= 4 || isWidthDown('xs', width) ? '240px' : '360px',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                  }}
                >
                  {apps.map((a, i) => (
                    <div key={`box-${i}`} style={{ width: '120px', padding: sp1, overflow: 'hidden' }}>
                      <Button
                        component={Link}
                        target={a.newWindow ? '_blank' : null}
                        href={a.route}
                        key={`button-${i}`}
                        style={{ display: 'inherit', textDecoration: 'none', fontWeight: 400 }}
                      >
                        <div style={{ display: 'inline-flex' }}>
                          <Avatar
                            key={`avatar-${i}`}
                            variant="rounded"
                            alt={a.name}
                            src={
                              isDarkTheme
                                ? typeof a.img_d === 'string'
                                  ? a.img_d
                                  : null
                                : typeof a.img_l === 'string'
                                ? a.img_l
                                : null
                            }
                            style={
                              a.img_d === null || typeof a.img_d === 'string'
                                ? { width: theme.spacing(8), height: theme.spacing(8) }
                                : { backgroundColor: 'transparent', width: theme.spacing(8), height: theme.spacing(8) }
                            }
                            className={classes.avatarIcon}
                          >
                            {isDarkTheme
                              ? a.img_d !== null && typeof a.img_d !== 'string'
                                ? a.img_d
                                : a.alt
                              : a.img_l !== null && typeof a.img_l !== 'string'
                              ? a.img_l
                              : a.alt}
                          </Avatar>
                        </div>
                        <Typography key={`text-${i}`} variant="caption">
                          {a.name}
                        </Typography>
                      </Button>
                    </div>
                  ))}
                </div>
              </Paper>
            </Fade>
          )}
        </Popper>
      </IconButton>
    </ClickAwayListener>
  );
};

export default withWidth()(AppSwitcher);
