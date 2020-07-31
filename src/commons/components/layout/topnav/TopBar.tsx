import React from "react";
import { Link } from "react-router-dom";

import { AppBar, Toolbar, Box, IconButton, useTheme, useScrollTrigger, Slide, makeStyles } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

import useAppLayout from "../../hooks/useAppLayout";
import AppSwitcher from "./AppSwitcher";
import QuickSearch from "./QuickSearch";
import ThemeSelectionIcon from "./ThemeSelectionIcon";
import UserProfile from "./UserProfile";


function HideOnScroll(props) {
    const { children, window, enabled } = props;
    const trigger = useScrollTrigger({
      disableHysteresis: true,
      threshold: 0,
      target: window ? window() : undefined,
    });
  
    return (
      <Slide appear={false} direction="down" in={!trigger||!enabled}>
        {children}
      </Slide>
    );
  }
  
const useStyles = (layout) => {
    return makeStyles((theme) => ({
        appBar: {
            zIndex: layout === "top" ? theme.zIndex.drawer + 1 : theme.zIndex.drawer - 1,
            backgroundColor: theme.palette.background.default,
            color: theme.palette.action.active,
            [theme.breakpoints.up('sm')]: {
                color: theme.palette.action.active,
                marginLeft: theme.spacing(7) + 1
            },
        },
        toolbar: {
            paddingRight: theme.spacing(2),
            [theme.breakpoints.only('xs')]:{
                paddingLeft: theme.spacing(2)
            }
        },
        title: {
            alignItems: "center",
            display: "inline-flex",
            flex: "0 0 auto",
            fontSize: "1.5rem",
            letterSpacing: "-1px",
            textDecoration: "none",
            color: theme.palette.text.primary
        },
        menuButton: {
          display: 'none',
          [theme.breakpoints.down('xs')]: {
            display: "inline-block",
          }
        },
        icon: {
          display: "flex", 
          padding: "0 10px",
          [theme.breakpoints.down('xs')]: {
            display: "none",
          }
        }
    }))();   
};

type AppBarProps = {
    width: "xs" | "sm" | "md" | "lg" | "xl";
}

const TopBar: React.FC<AppBarProps> = (props) => {
    const theme = useTheme();
    const {currentLayout, layoutProps, showQuickSearch, autoHideAppbar, getLogo, toggleDrawer} = useAppLayout();
    const classes = useStyles(currentLayout);
    const isTopLayout = currentLayout === "top"
    
    const renderTitle = () => {
        if(currentLayout === "top") {
            return <Link className={classes.title} to="/">
                <Box component="div" className={classes.icon}>{getLogo(theme)}</Box>
                <Box component="div" display="flex">{layoutProps.appName}</Box> 
            </Link>
        }
        return null;
    }
    
    return <HideOnScroll enabled={!isTopLayout && autoHideAppbar}>
        <AppBar elevation={isTopLayout ? 2 : 0} position="fixed" className={classes.appBar} >
            <Toolbar disableGutters={isTopLayout} className={classes.toolbar}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer}
                    edge="start"
                    className={classes.menuButton}>
                    <MenuIcon />
                </IconButton>
                {renderTitle()}
                {layoutProps.allowQuickSearch && showQuickSearch && isWidthUp('sm', props.width) ? <QuickSearch /> : <Box flexGrow={1} /> }
                {layoutProps.topnav.themeSelectionUnder === "icon" ? <ThemeSelectionIcon /> : null}
                <AppSwitcher />
                <UserProfile />
            </Toolbar>
        </AppBar>
    </HideOnScroll>
}

export default withWidth()(TopBar);