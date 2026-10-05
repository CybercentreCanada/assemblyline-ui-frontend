import { FC, ReactElement, ReactNode } from "react";
import * as react_jsx_runtime0 from "react/jsx-runtime";

//#region src/elements/AppSwitcher.d.ts
declare const AppSwitcher: () => react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/providers/AppSwitcherProvider.d.ts
type AppSwitcherContextType = {
  initialized: boolean;
  empty: boolean;
  items: AppSwitcherItem[];
  setItems: (items: AppSwitcherItem[]) => void;
};
type AppSwitcherProviderProps = {
  apps?: AppSwitcherItem[];
  children: ReactNode;
};
declare const AppSwitcherProvider: FC<AppSwitcherProviderProps>;
//#endregion
//#region src/hooks/useAppSwitcher.d.ts
declare function useAppSwitcher(): AppSwitcherContextType;
//#endregion
//#region src/name.d.ts
declare const MODULE_NAME = "tui.apps";
//#endregion
//#region src/index.d.ts
type AppSwitcherItem = {
  alt: string;
  name: string;
  img_d: ReactElement<any> | string;
  img_l: ReactElement<any> | string;
  route: string;
  newWindow?: boolean;
};
//#endregion
export { AppSwitcher, AppSwitcherItem, AppSwitcherProvider, MODULE_NAME, useAppSwitcher };
//# sourceMappingURL=index.d.ts.map