import React from "react";
import {makeStyles} from "@material-ui/core";

export default function TextDivider(){
    const useStyles = makeStyles((theme) => ({
      divider: {
        display: "inline-block",
        textAlign: "center",
        width: "100%",
        margin: "30px 0",
        position: "relative",
        borderTop: "1px solid "+ theme.palette.divider
      },
      inner: {
        backgroundColor: theme.palette.background.paper,
        left: "50%",
        marginLeft: "-30px",
        position: "absolute",
        top: "-10px",
        width: "60px"
      }
    }));
    const classes = useStyles();
    return (
        <div>
            <div className={classes.divider}>
                <div className={classes.inner}>OR</div>
            </div>
        </div>
    );
}