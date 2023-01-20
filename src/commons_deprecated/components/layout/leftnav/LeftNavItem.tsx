import { ListItem, ListItemIcon, ListItemText, Tooltip, useMediaQuery } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import useAppLayout from 'commons_deprecated/components/hooks/useAppLayout';
import useAppUser from 'commons_deprecated/components/hooks/useAppUser';
import { LeftNavItemProps } from 'commons_deprecated/components/layout/leftnav/LeftNavDrawer';
import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(4)
    }
  })
);

const LeftNavItem: React.FC<LeftNavItemProps> = props => {
  const theme = useTheme();
  const classes = useStyles();
  const { drawerState, hideNestedIcons, toggleDrawer } = useAppLayout();
  const { text, icon, nested, route, userPropValidators } = props;
  const { validateProps } = useAppUser();
  const isSMDown = useMediaQuery(theme.breakpoints.down('sm'));

  const onCloseDrawerIfOpen = () => {
    if (isSMDown && drawerState) {
      setTimeout(toggleDrawer, 150);
    }
  };

  const item = (
    <ListItem
      button
      component={route ? Link : null}
      to={route}
      dense={!!nested}
      className={nested ? classes.nested : null}
      key={text}
      onClick={onCloseDrawerIfOpen}
    >
      {((icon && !nested) || (!hideNestedIcons && icon && nested)) && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText primary={text} />
    </ListItem>
  );

  return validateProps(userPropValidators) ? (
    drawerState || nested ? (
      item
    ) : (
      <Tooltip title={text} aria-label={text} placement="right">
        {item}
      </Tooltip>
    )
  ) : null;
};

export default memo(LeftNavItem);
