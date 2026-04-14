import * as react0 from "react";
import { FC, PropsWithChildren, ReactElement } from "react";
import { i18n } from "i18next";

//#region src/elements/AppDrawerContainer.d.ts
declare const AppDrawerContainer: FC<PropsWithChildren>;
//#endregion
//#region src/providers/AppDrawerProvider.d.ts
type AppDrawerToolbarProps = {
  onCloseClick?: () => void;
  slots?: {
    left?: ReactElement[];
    right?: ReactElement[];
  };
};
type AppDrawerOpenProps = {
  id: string;
  element: ReactElement;
  width?: number;
  expandable?: boolean;
  mode?: AppDrawerMode;
  floatThreshold?: number;
  enableClickAway?: boolean;
  toolbar?: AppDrawerToolbarProps;
  onClose?: () => void;
};
type AppDrawerMode = 'float' | 'pin';
type AppDrawerContextType = {
  id?: string;
  isOpen?: boolean;
  isFloatThreshold?: boolean;
  expandable?: boolean;
  width?: number;
  maximized?: boolean;
  mode: AppDrawerMode;
  enableClickAway?: boolean;
  toolbar?: AppDrawerToolbarProps;
  open: (props: AppDrawerOpenProps) => void;
  close: () => void;
  setWidth: (width: number) => void;
  setMaximized: (maximized: boolean) => void;
  setMode: (mode: AppDrawerMode) => void;
  setElement: (element: ReactElement | null) => void;
};
declare const AppDrawerContext: react0.Context<AppDrawerContextType>;
declare const AppDrawerElementContext: react0.Context<ReactElement<unknown, string | react0.JSXElementConstructor<any>>>;
declare const AppDrawerProvider: FC<PropsWithChildren>;
//#endregion
//#region src/hooks/useAppDrawer.d.ts
declare function useAppDrawer(): AppDrawerContextType | undefined;
//#endregion
//#region src/i18n/index.d.ts
declare function addTranslations(i18n: i18n): void;
//#endregion
export { AppDrawerContainer, AppDrawerContext, AppDrawerContextType, AppDrawerElementContext, AppDrawerMode, AppDrawerOpenProps, AppDrawerProvider, AppDrawerToolbarProps, addTranslations, useAppDrawer };
//# sourceMappingURL=index.d.ts.map