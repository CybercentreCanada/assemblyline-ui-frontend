import React from "react";

export type SiteMapRoute = {
    path: string,
    title: string,
    isRoot?: boolean,
    isLeaf?: boolean,
    icon?: React.ReactNode
}

type SiteMapContextProps = {
    lastOnly?: boolean,
    exceptLast?: boolean,
    allLinks?: boolean,
    routes: SiteMapRoute[]
}


type SiteMapProviderProps = SiteMapContextProps & {
    children: React.ReactNode
}

export const SiteMapContext = React.createContext<SiteMapContextProps>(null);

function SiteMapProvider(props: SiteMapProviderProps) {
    const {children, ...contextProps} = props;
    return <SiteMapContext.Provider value={contextProps}>
        {children}
    </SiteMapContext.Provider>
}

export default SiteMapProvider;