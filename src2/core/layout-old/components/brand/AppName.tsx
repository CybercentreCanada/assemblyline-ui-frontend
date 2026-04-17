import { Menu } from '@mui/icons-material';
import { Box, IconButton, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { toggleLeftNavOpen } from 'core/layout/layout.utils';
import { AppLink } from 'core/router';
import React, { useCallback } from 'react';
import { Tooltip } from 'ui/Tooltip';

const StyledTitle = styled('div')({
  display: 'flex',
  alignItems: 'center',
  flex: '0 0 auto',
  fontSize: '1.5rem',
  letterSpacing: '-1px'
});

const StyledIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0',
  minWidth: theme.spacing(7)
}));

export type AppNameProps = {
  noName?: boolean;
};

export const AppName = React.memo(({ noName }: AppNameProps) => {
  const theme = useTheme();
  // const appBrandLogo = useAppBrand({ variant: 'logo' });
  // const appBrandName = useAppBrand({ variant: 'name' });
  // const leftnav = useAppLeftNav();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  // const { appName, appIconDark, appIconLight, appLink } = useAppPreferences();

  // const appIcon = useMemo(
  //   () => (theme.palette.mode === 'dark' ? appIconDark : appIconLight),
  //   [theme, appIconDark, appIconLight]
  // );

  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);
  const appName = useAppConfig(s => s.app.name);
  const appLink = useAppConfig(s => s.app.link);
  const setConfig = useAppSetConfig();

  const handleToggle = useCallback(() => setConfig(s => toggleLeftNavOpen(s)), []);

  if (isXs) {
    return (
      <StyledTitle style={{ paddingLeft: theme.spacing(2) }}>
        <Tooltip title={!open && appName ? appName : null} placement="right">
          <StyledIcon>
            <IconButton aria-label="open drawer" edge="start" onClick={handleToggle} size="large" color="inherit">
              <Menu />
            </IconButton>
          </StyledIcon>
        </Tooltip>
        {noName ? null : appBrandName ? (
          appBrandName
        ) : appName ? (
          <Typography style={{ fontSize: '1.5rem', letterSpacing: -1 }}>{appName}</Typography>
        ) : null}
      </StyledTitle>
    );
  } else
    return (
      <AppLink to={appLink} style={{ color: 'inherit', textDecoration: 'none', paddingLeft: theme.spacing(1) }}>
        <StyledTitle>
          <Tooltip title={!leftnav.open && appName ? appName : ''} placement="right">
            <StyledIcon>{appBrandLogo || appIcon}</StyledIcon>
          </Tooltip>
          {!noName && appBrandName && <Box ml={1}>{appBrandName}</Box>}
          {!noName && !appBrandName && appName && (
            <Typography style={{ fontSize: '1.5rem', letterSpacing: -1 }} ml={1}>
              {appName}
            </Typography>
          )}
        </StyledTitle>
      </AppLink>
    );
});
