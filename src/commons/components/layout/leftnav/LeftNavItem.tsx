import React from "react";
import { Link } from "react-router-dom";

import { ListItem, ListItemIcon, ListItemText, Tooltip } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';

import useAppLayout from "../../hooks/useAppLayout";
import { LeftNavItemProps } from "./LeftNavDrawer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

const LeftNavItem: React.FC<LeftNavItemProps> = (props) => {
    const classes = useStyles();
    const { drawerState, toggleDrawer} = useAppLayout();
    const {text, icon, nested, route} = props;

    const onCloseDrawerIfOpen = () => {
      if (isWidthDown('sm', props.width) && drawerState){
        setTimeout(toggleDrawer, 150);
      }
    };
    
    const item = (
      <ListItem button component={Link} to={route} dense={nested ? true : false} className={nested ? classes.nested : null} key={text} onClick={onCloseDrawerIfOpen}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null }
        <ListItemText primary={text} />
      </ListItem>
    )

    return drawerState || nested ? item : <Tooltip title={text} aria-label={text} placement="right">{item}</Tooltip>
}

export default withWidth()(LeftNavItem);