import MenuIcon from '@mui/icons-material/Menu';
import { ButtonBase, IconButton, styled, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import useAppLeftNav from 'commons/components/app/hooks/useAppLeftNav';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import useAppLayout from '../app/hooks/useAppLayout';

import useAppLogo from '../app/hooks/useAppLogo';

export const useStyles = makeStyles(theme => ({
  alignedButton: {
    justifyContent: 'unset',
    WebkitJustifyContent: 'unset',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  nonSelectLink: {
    color: 'inherit',
    textDecoration: 'none',
    outlineOffset: 'unset',
    outline: 'unset'
  }
}));

const StyledTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: '0 0 auto',
  fontSize: '1.5rem',
  letterSpacing: '-1px',
  height: theme.spacing(8),
  padding: theme.spacing(0, 2),
  [theme.breakpoints.only('xs')]: {
    height: theme.spacing(7)
  }
}));

const StyledIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0',
  minWidth: theme.spacing(6)
}));

const AppName = ({ noName, onCloseDrawerIfOpen }: { noName?: boolean; onCloseDrawerIfOpen?: () => void }) => {
  const theme = useTheme();
  const classes = useStyles();
  const logo = useAppLogo();
  const configs = useAppConfigs();
  const leftnav = useAppLeftNav();
  const { current: currentLayout } = useAppLayout();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  return isXs ? (
    <StyledTitle>
      <StyledIcon>
        <IconButton aria-label="open drawer" edge="start" onClick={leftnav.toggle} size="large" color="inherit">
          <MenuIcon />
        </IconButton>
      </StyledIcon>
      {!noName && (
        <ButtonBase className={classes.alignedButton}>
          <Link to={configs.preferences.appLink} className={classes.nonSelectLink} onClick={onCloseDrawerIfOpen}>
            <StyledTitle style={{ padding: theme.spacing(0, 1) }}>{configs.preferences.appName}</StyledTitle>
          </Link>
        </ButtonBase>
      )}
    </StyledTitle>
  ) : (
    <Tooltip title={leftnav.open || currentLayout === 'top' ? '' : configs.preferences.appName} placement="right">
      <ButtonBase tabIndex={-1} className={classes.alignedButton}>
        <Link to={configs.preferences.appLink} className={classes.nonSelectLink} onClick={onCloseDrawerIfOpen}>
          <StyledTitle>
            <StyledIcon>
              <StyledIcon>{logo}</StyledIcon>
            </StyledIcon>
            {!noName && <div style={{ paddingLeft: theme.spacing(1) }}>{configs.preferences.appName}</div>}
          </StyledTitle>
        </Link>
      </ButtonBase>
    </Tooltip>
  );
};

export default memo(AppName);
