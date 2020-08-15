import React from 'react';

export type SiteMapRoute = {
  path: string;
  title: string;
  isRoot?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode;
};

type SiteMapContextProps = {
  // eslint-disable-next-line react/require-default-props
  lastOnly?: boolean;
  // eslint-disable-next-line react/require-default-props
  exceptLast?: boolean;
  // eslint-disable-next-line react/require-default-props
  allLinks?: boolean;
  routes: SiteMapRoute[];
};

type SiteMapProviderProps = SiteMapContextProps & {
  children: React.ReactNode;
};

export const SiteMapContext = React.createContext<SiteMapContextProps>(null);

function SiteMapProvider(props: SiteMapProviderProps) {
  const { children, ...contextProps } = props;
  return <SiteMapContext.Provider value={contextProps}>{children}</SiteMapContext.Provider>;
}

export default SiteMapProvider;
