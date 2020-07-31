import React from "react";
import { makeStyles, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  page: {
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "auto",
    marginTop: theme.spacing(6),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "95%",
    },
  },
}));

export default function PageFullWidth({ children }) {
  const classes = useStyles();
  return <Box className={classes.page}>{children}</Box>;
}
