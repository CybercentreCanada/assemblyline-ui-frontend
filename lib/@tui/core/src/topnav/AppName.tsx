import { Menu } from '@mui/icons-material';
import { Box, IconButton, styled, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useAppLeftNav, useAppPreferences } from '../app/hooks';
import { useAppRouter } from '../app/hooks/useAppRouter';
import { AppBrand } from '../display/AppBrand';

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
  justifyContent: 'center',
  padding: '0',
  minWidth: `max(${theme.spacing(7)}, 42px)`
}));

export const AppName = ({ noName }: { noName?: boolean }) => {
  const theme = useTheme();
  const leftnav = useAppLeftNav();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const { brand, appLink } = useAppPreferences();
  const { Link } = useAppRouter();

  const appName = brand?.appName;

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
        {!noName && <AppBrand variant="name" />}
      </StyledTitle>
    );
  }

  return (
    <Link to={appLink} style={{ color: 'inherit', textDecoration: 'none' }}>
      <StyledTitle>
        <Tooltip title={!leftnav.open && appName ? appName : ''} placement="right">
          <StyledIcon>
            <AppBrand variant="logo" />
          </StyledIcon>
        </Tooltip>
        {!noName && (
          <Box ml={2}>
            <AppBrand variant="name" />
          </Box>
        )}
      </StyledTitle>
    </Link>
  );
};
