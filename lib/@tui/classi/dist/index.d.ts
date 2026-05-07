import * as react0 from "react";
import { FC, PropsWithChildren } from "react";
import { BoxProps, Breakpoint } from "@mui/material";
import { MuiColorType } from "@tui/core";
import { i18n } from "i18next";

//#region src/elements/index.d.ts
type MxProps = Pick<BoxProps, 'm' | 'mt' | 'mr' | 'mb' | 'ml' | 'mx' | 'my'>;
//#endregion
//#region src/providers/AppClassificationProvider.d.ts
/**
 * Provider props specification.
 */
type AppClassificationProviderProps = PropsWithChildren & {
  /**
   * The classification value.
   *
   * This takes precedence over the `url` prop.
   */
  value?: Exclude<AppClassificationState, 'loading' | 'error'>;
  /**
   * This endpoint should return an object that satisfies the specification defined by {@link AppClassificationResponse}
   */
  url?: string;
};
/**
 * Supported classification values.
 */
declare const AppClassificationValues: readonly ["u", "pa", "pb", "pc", "c", "s", "ts"];
/**
 * Type definition of supported classification values.
 */
type AppClassificationValue = (typeof AppClassificationValues)[number];
/**
 * Supported classification states.
 */
declare const AppClassificationStates: readonly ["u", "pa", "pb", "pc", "c", "s", "ts", "loading", "error"];
/**
 * Type definition of supported classification states.
 */
type AppClassificationState = (typeof AppClassificationStates)[number];
/**
 * The expected shape of the response payload of the `url` defined in {@link AppClassificationProviderProps}
 */
type AppClassificationResponse = {
  value: AppClassificationValue;
};
/**
 * Implementation of the AppClassification provider.
 */
declare const AppClassificationProvider: FC<AppClassificationProviderProps>;
//#endregion
//#region src/elements/AppClassification.d.ts
type AppClassificationProps = {
  variant?: 'filled' | 'text' | 'outlined';
  breakpoint?: Breakpoint;
  overwrite?: AppClassificationValue;
  mx?: MxProps;
};
declare const AppClassification: FC<AppClassificationProps>;
//#endregion
//#region src/elements/AppClassificationBase.d.ts
type AppClassificationBaseProps = {
  variant?: 'filled' | 'text' | 'outlined';
  state?: AppClassificationState | 'unsupported';
  breakpoint?: Breakpoint;
  short_text_en: string;
  short_text_fr: string;
  long_text_en: string;
  long_text_fr: string;
  color: MuiColorType;
  mx?: MxProps;
};
declare const AppClassificationBase: FC<AppClassificationBaseProps>;
//#endregion
//#region src/elements/AppTLP.d.ts
declare const TLP_SCHEMA: {
  red: {
    sx: {
      color: string;
      backgroundColor: string;
    };
    text: string;
  };
  amber: {
    sx: {
      color: string;
      backgroundColor: string;
    };
    text: string;
  };
  'amber+strict': {
    sx: {
      color: string;
      backgroundColor: string;
    };
    text: string;
  };
  green: {
    sx: {
      color: string;
      backgroundColor: string;
    };
    text: string;
  };
  clear: {
    sx: {
      color: string;
      backgroundColor: string;
    };
    text: string;
  };
};
type AppTLPValue = keyof typeof TLP_SCHEMA;
type AppTLPProps = {
  value: AppTLPValue;
  mx?: MxProps;
};
declare const AppTLP: FC<AppTLPProps>;
//#endregion
//#region src/hooks/useAppClassification.d.ts
declare const useAppClassification: () => {
  initialized: boolean;
  value: AppClassificationState;
  setValue: react0.Dispatch<react0.SetStateAction<AppClassificationState>>;
};
//#endregion
//#region src/i18n/index.d.ts
declare function addTranslations(i18n: i18n): void;
//#endregion
export { AppClassification, AppClassificationBase, AppClassificationProvider, type AppClassificationResponse, type AppClassificationState, AppClassificationStates, type AppClassificationValue, AppClassificationValues, AppTLP, type AppTLPValue, TLP_SCHEMA, addTranslations, useAppClassification };
//# sourceMappingURL=index.d.ts.map