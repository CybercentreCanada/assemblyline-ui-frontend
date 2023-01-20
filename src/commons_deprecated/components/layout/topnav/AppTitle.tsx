import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppLayout from 'commons_deprecated/components/hooks/useAppLayout';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  topBarTitle: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    fontSize: '1.5rem',
    letterSpacing: '-1px'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    minWidth: theme.spacing(7)
  },
  title: {
    color: 'inherit',
    textDecoration: 'none'
  }
}));

export default function AppTitle({ disabled = false, noTitle = false }) {
  const theme = useTheme();
  const classes = useStyles();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const { layoutProps, getLogo, toggleDrawer } = useAppLayout();

  if (!disabled) {
    return isXs ? (
      <div className={classes.topBarTitle} style={{ paddingLeft: theme.spacing(2) }}>
        <div className={classes.icon}>
          <IconButton aria-label="open drawer" edge="start" color="inherit" onClick={toggleDrawer} size="large">
            <MenuIcon />
          </IconButton>
        </div>
        {!noTitle && (
          <Link to="/" className={classes.title} onClick={toggleDrawer}>
            {layoutProps.appName}
          </Link>
        )}
      </div>
    ) : (
      <Link to="/" className={classes.title} style={{ paddingLeft: theme.spacing(2) }}>
        <div className={classes.topBarTitle}>
          <div className={classes.icon}>{getLogo(theme)}</div>
          {!noTitle && <div>{layoutProps.appName}</div>}
        </div>
      </Link>
    );
  }
  return null;
}
