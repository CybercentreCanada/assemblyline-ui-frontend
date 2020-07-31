import React, { useState } from "react";
import { IconButton, useTheme, ClickAwayListener, Popper, Fade, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import TuneIcon from '@material-ui/icons/Tune';
import ThemeSelection from "./ThemeSelection";

const useStyles = () => {
    return makeStyles((theme) => ({
        popper: {
          zIndex: theme.zIndex.drawer + 2,
          minWidth: "280px",
        },
    }))();   
};

const ThemeSelectionIcon = () => {
    const theme = useTheme();
    const classes = useStyles();
    const [popperAnchorEl, setPopperAnchorEl] = useState(null);

    const onThemeSelectionClick = (event: React.MouseEvent) => {
        setPopperAnchorEl(popperAnchorEl ? null : event.currentTarget);
    };

    const onClickAway = () => setPopperAnchorEl(null)
    const isPopperOpen = !!popperAnchorEl;

    return <ClickAwayListener onClickAway={onClickAway}>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onThemeSelectionClick}
                edge="start">
                <TuneIcon />
                <Popper
                    open={isPopperOpen}
                    anchorEl={popperAnchorEl}
                    className={classes.popper}
                    placement="bottom-end"
                    transition>
                    {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={250}>
                        <Paper style={{ padding: theme.spacing(1) }} elevation={4}>
                            <ThemeSelection />
                        </Paper>
                    </Fade>
                    )}
                </Popper>
            </IconButton>
        </ClickAwayListener>
}

export default ThemeSelectionIcon;