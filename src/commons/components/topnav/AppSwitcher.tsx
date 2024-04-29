import AppsIcon from '@mui/icons-material/Apps';
import {
  Avatar,
  Button,
  ClickAwayListener,
  Fade,
  IconButton,
  Link,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useAppSwitcher from 'commons/components/app/hooks/useAppSwitcher';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppSwitcherItem } from '../app/AppConfigs';

type AppsSwitcherProps = {
  apps: AppSwitcherItem[];
};

const AppSwitcher: React.FC<AppsSwitcherProps | any> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const anchorRef = useRef();
  const appSwitcher = useAppSwitcher();
  const [open, setOpen] = useState<boolean>(false);
  const isDarkTheme = theme.palette.mode === 'dark';
  const sp1 = theme.spacing(1);
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  const onTogglePopper = useCallback(() => setOpen(_open => !_open), []);

  const onClickAway = useCallback(() => setOpen(false), []);

  if (appSwitcher.empty) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div>
        <Tooltip title={t('apps')}>
          <IconButton ref={anchorRef} color="inherit" onClick={onTogglePopper} size="large">
            <AppsIcon />
          </IconButton>
        </Tooltip>
        <Popper
          sx={{ zIndex: theme.zIndex.drawer + 2 }}
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <Paper style={{ textAlign: 'center', padding: theme.spacing(1) }} elevation={4}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    maxWidth: appSwitcher.items.length <= 4 || isSm ? '240px' : '360px'
                  }}
                >
                  {appSwitcher.items.map((a, i) => (
                    <div key={`box-${i}`} style={{ width: '120px', padding: sp1, overflow: 'hidden' }}>
                      <Button
                        component={Link}
                        target={a.newWindow ? '_blank' : null}
                        href={a.route}
                        key={`button-${i}`}
                        style={{
                          display: 'inherit',
                          textDecoration: 'none',
                          fontWeight: 400,
                          color: theme.palette.text.primary
                        }}
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
                            sx={{
                              '& img': {
                                objectFit: 'contain'
                              }
                            }}
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
      </div>
    </ClickAwayListener>
  );
};

export default memo(AppSwitcher);
