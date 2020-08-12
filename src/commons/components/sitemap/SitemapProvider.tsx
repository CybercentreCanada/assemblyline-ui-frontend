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

export const SiteMapContext = React.createContext<SiteMapContextProps>(null);

function SiteMapProvider({children, config}) {
    return <SiteMapContext.Provider value={config}>
        {children}
    </SiteMapContext.Provider>
}

export default SiteMapProvider;