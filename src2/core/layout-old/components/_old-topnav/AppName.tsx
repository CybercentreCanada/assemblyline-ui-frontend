import { Menu } from '@mui/icons-material';
import { Box, IconButton, styled, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useAppLeftNav, useAppPreferences } from '../app/hooks';
import { useAppBrand } from '../app/hooks/useAppBrand';
import { useAppRouter } from '../app/hooks/useAppRouter';

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

export const AppName = ({ noName }: { noName?: boolean }) => {
  const theme = useTheme();
  const appBrandLogo = useAppBrand({ variant: 'logo' });
  const appBrandName = useAppBrand({ variant: 'name' });
  const leftnav = useAppLeftNav();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const { appName, appIconDark, appIconLight, appLink } = useAppPreferences();
  const { Link } = useAppRouter();

  const appIcon = useMemo(
    () => (theme.palette.mode === 'dark' ? appIconDark : appIconLight),
    [theme, appIconDark, appIconLight]
  );

  if (isXs) {
    return (
      <StyledTitle style={{ paddingLeft: theme.spacing(2) }}>
        <Tooltip title={!leftnav.open && appName ? appName : ''} placement="right">
          <StyledIcon>
            <IconButton aria-label="open drawer" edge="start" onClick={leftnav.toggle} size="large" color="inherit">
              <Menu />
            </IconButton>
          </StyledIcon>
        </Tooltip>
        {!noName && appBrandName}
        {!noName && !appBrandName && appName && (
          <Typography style={{ fontSize: '1.5rem', letterSpacing: -1 }}>{appName}</Typography>
        )}
      </StyledTitle>
    );
  }

  return (
    <Link to={appLink} style={{ color: 'inherit', textDecoration: 'none', paddingLeft: theme.spacing(1) }}>
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
    </Link>
  );
};
