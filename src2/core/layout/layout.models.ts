import React, { ReactElement } from 'react';

//*****************************************************************************************
// App Config Left Nav
//*****************************************************************************************

export type AppConfigLeftNavItem = {
  expanded?: boolean; // when leftnav is open - opens collapsible menu.
  popped?: boolean; // when leftnav is closed - opens popper menu.
  keepMounted?: boolean; // set to true to keep elements in dom tree when expanded is false.
  items: AppConfigLeftNavItem[];
};

//*****************************************************************************************
// App Layout Left Nav
//*****************************************************************************************

export type AppLayoutLeftNavBase = {
  primary: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
};

export type AppLayoutLeftNavRoute = AppLayoutLeftNavBase & {
  // TODO: change this to use the route string
  route: string;
};

export type AppLayoutLeftNavComponent = AppLayoutLeftNavBase & {
  render: (navopen: boolean, props?: AppLayoutLeftNavBase) => ReactElement;
};

export type AppLayoutLeftNavMenu = AppLayoutLeftNavBase & {
  items: AppLayoutLeftNavItem[];
};

export type AppLayoutLeftNavItem = AppLayoutLeftNavMenu | AppLayoutLeftNavComponent | AppLayoutLeftNavRoute;
