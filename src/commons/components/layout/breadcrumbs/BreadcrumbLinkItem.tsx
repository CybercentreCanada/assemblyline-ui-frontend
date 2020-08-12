import React from "react";
import { Link as RouterLink } from 'react-router-dom';
import useSitemap, { BreadcrumbItem } from "commons/components/hooks/useSitemap";
import { Link, makeStyles, Tooltip } from "@material-ui/core";
import BreadcrumbIcon from "commons/components/layout/breadcrumbs/BreadcrumbIcon";

export const useStyles = makeStyles(({
    link: {
        display: 'flex',
    },
    text: {
        maxWidth: "200px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    }
}))

type BreadcrumbLinkItemProps = {
    textOnly?: boolean,
    item: BreadcrumbItem
}

const LinkRouter = (props) => <Link {...props} component={RouterLink} />;

const BreadcrumbLinkItem: React.FC<BreadcrumbLinkItemProps> = ({item, textOnly = false}) => {
    const classes = useStyles();
    const {route, matcher: {url}} = item;
    const {resolveTitle} = useSitemap();   
    return <LinkRouter style={route.icon ? {paddingTop: "3px"} : null} key={`bcrumb-${url}`} color="inherit" to={url} className={classes.link}>
        {!textOnly ? <BreadcrumbIcon item={item}/> : null} 
        <Tooltip title={url} >
            <span className={classes.text}>{resolveTitle(item)}</span>
        </Tooltip>
    </LinkRouter>
}


export default BreadcrumbLinkItem;