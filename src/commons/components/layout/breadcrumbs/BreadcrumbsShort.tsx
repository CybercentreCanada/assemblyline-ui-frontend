import React from "react";
import MuiBreadcrumbs from "@material-ui/core/Breadcrumbs"
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { BreadcrumbItem } from "commons/components/hooks/useSitemap";
import BreadcrumbLastItem from "commons/components/layout/breadcrumbs/BreadcrumbLastItem";
import {useStyles as useBreadcrumbStyles} from "commons/components/layout/breadcrumbs/Breadcrumbs"
import useAppLayout from "commons/components/hooks/useAppLayout";
import BreadcrumbEllipsisItem from "commons/components/layout/breadcrumbs/BreadcrumbEllipsisItem";
import BreadcrumbLinkItem from "commons/components/layout/breadcrumbs/BreadcrumbLinkItem";

type BreadcrumbsShortProps = {
    disableEllipsis?: boolean,
    disableStyle?: boolean,
    items: BreadcrumbItem[]
}

const BreadcrumbsShort: React.FC<BreadcrumbsShortProps> = ({items, disableEllipsis, disableStyle}) => {
    const {currentLayout, drawerState, showQuickSearch} = useAppLayout();    
    const classes = useBreadcrumbStyles(currentLayout, drawerState, showQuickSearch);
    const style = disableStyle ? null : classes.breadcrumbs;

    if(items.length === 0) {
        return <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}  aria-label="breadcrumb" className={style}>   
        </MuiBreadcrumbs>
    }

    else if(disableEllipsis) {
        return <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}  aria-label="breadcrumb" className={style}>   
            <BreadcrumbLastItem item={items[items.length - 1]} />
        </MuiBreadcrumbs>
    }

    else if(items.length === 1) {
        return <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}  aria-label="breadcrumb" className={style}>   
            <BreadcrumbLastItem item={items[0]} />
        </MuiBreadcrumbs>
    }        

    else if(items.length === 2) {
        return <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}  aria-label="breadcrumb" className={style}>   
            <BreadcrumbLinkItem item={items[0]} />
            <BreadcrumbLastItem item={items[1]} />
        </MuiBreadcrumbs>
    }

    return <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}  aria-label="breadcrumb" className={style}>
        <BreadcrumbEllipsisItem items={items.slice(0, items.length - 1)}/>
        <BreadcrumbLastItem item={items[items.length - 1]} />
    </MuiBreadcrumbs>
}


export default BreadcrumbsShort;