import React from "react";
import { BreadcrumbItem } from "commons/components/hooks/useSitemap";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    icon: {
        "& svg": {
            marginRight: theme.spacing(0.5),
            width: 20,
            height: 20,
            // verticalAlign: "top"
        }
      }
}))


type BreadcrumbIconProps = {
    item: BreadcrumbItem
}

const BreadcrumbIcon: React.FC<BreadcrumbIconProps> = ({item}) => {
    const {route: {icon}} = item;
    const classes = useStyles();
    return icon ? <span className={classes.icon}>{icon}</span> : null
}    


export default BreadcrumbIcon;