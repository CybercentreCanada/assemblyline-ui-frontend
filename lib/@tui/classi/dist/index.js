import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
import { Security } from "@mui/icons-material";
import { Chip, Skeleton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useAppColor, useAppLanguage } from "@tui/core";

//#region src/name.ts
const MODULE_NAME = "tui.classi";

//#endregion
//#region src/providers/AppClassificationProvider.tsx
/**
* Supported classification values.
*/
const AppClassificationValues = [
	"u",
	"pa",
	"pb",
	"pc",
	"c",
	"s",
	"ts"
];
/**
* Supported classification states.
*/
const AppClassificationStates = [
	...AppClassificationValues,
	"loading",
	"error"
];
/**
* React {@link Context} for {@link AppClassificationProvider}
*/
const AppClassificationContext = createContext({
	initialized: false,
	value: "u",
	setValue: () => {}
});
/**
* Implementation of the AppClassification provider.
*/
const AppClassificationProvider = ({ children, value, url }) => {
	const [state, setState] = useState(value);
	useEffect(() => {
		if (!url) return;
		setState("loading");
		fetch(url).then((response) => response.json()).then((data) => {
			setState(data.value);
		}).catch(() => {
			setState("error");
		});
	}, [url]);
	const _state = useMemo(() => {
		if (state) return state;
		return value;
	}, [state, value]);
	const _value = useMemo(() => ({
		initialized: !!_state,
		value: _state,
		setValue: setState
	}), [_state]);
	return /* @__PURE__ */ jsx(AppClassificationContext.Provider, {
		value: _value,
		children
	});
};

//#endregion
//#region src/elements/AppClassificationBase.tsx
const AppClassificationBase = ({ variant, state, breakpoint = "xl", short_text_en, short_text_fr, long_text_en, long_text_fr, color, mx }) => {
	const theme = useTheme();
	const errorColor = useAppColor("red", 700, 300);
	const classiColor = useAppColor(color, 700, 300);
	const isLoading = state === "loading";
	const _isBreakpoint = useMediaQuery((theme$1) => theme$1.breakpoints.down(breakpoint ?? "xl"));
	const isBreakpoint = breakpoint !== null && _isBreakpoint;
	const { isEN } = useAppLanguage();
	const { t } = useTranslation(MODULE_NAME);
	const renderer = useMemo(() => {
		if (!state || AppClassificationValues.includes(state)) return "classi";
		return state;
	}, [state]);
	const sxProps = useMemo(() => {
		const _color = renderer === "unsupported" ? errorColor : classiColor;
		if (variant === "filled") return {
			chip: {
				color: theme.palette.getContrastText(_color),
				bgcolor: !isLoading ? _color : null,
				borderColor: "transparent",
				fontWeight: 600,
				borderRadius: 0
			},
			icon: {
				color: isLoading ? _color : theme.palette.getContrastText(_color),
				opacity: isLoading ? .5 : 1
			}
		};
		if (variant === "outlined") return {
			chip: {
				color: _color,
				borderColor: _color,
				fontWeight: 600,
				borderRadius: 0
			},
			icon: {
				color: _color,
				opacity: isLoading ? .5 : 1
			}
		};
		return {
			chip: {
				color: _color,
				borderColor: "transparent",
				fontWeight: 600,
				borderRadius: 0
			},
			icon: {
				color: _color,
				opacity: isLoading ? .5 : 1
			}
		};
	}, [
		renderer,
		errorColor,
		classiColor,
		variant,
		isLoading,
		theme.palette
	]);
	const text = useMemo(() => isBreakpoint ? isEN() ? short_text_en : short_text_fr : isEN() ? long_text_en : long_text_fr, [
		isBreakpoint,
		isEN,
		short_text_en,
		short_text_fr,
		long_text_en,
		long_text_fr
	]);
	return /* @__PURE__ */ jsx(Chip, {
		size: "small",
		sx: {
			...sxProps.chip,
			...mx ?? {},
			borderRadius: 0,
			fontWeight: 600
		},
		icon: /* @__PURE__ */ jsx(Security, {
			color: "inherit",
			sx: sxProps.icon
		}),
		variant: "outlined",
		label: {
			classi: text,
			unsupported: isBreakpoint ? t("classification.state.unsupported.short").toUpperCase() : t("classification.state.unsupported.long").toUpperCase(),
			error: isBreakpoint ? t("classification.state.error.short").toUpperCase() : t("classification.state.error.long").toUpperCase(),
			loading: /* @__PURE__ */ jsx(Skeleton, {
				variant: "text",
				animation: "wave",
				sx: { minWidth: isBreakpoint ? 48 : 100 },
				children: /* @__PURE__ */ jsx(Typography, { children: isBreakpoint ? t("classification.state.loading.short").toUpperCase() : t("classification.state.loading.long").toUpperCase() })
			})
		}[renderer]
	});
};

//#endregion
//#region src/elements/AppClassification.tsx
const AppClassificationColors = {
	u: "green",
	pa: "lightBlue",
	pb: "lightBlue",
	pc: "lightBlue",
	c: "blue",
	s: "red",
	ts: "orange",
	loading: "grey",
	error: "red"
};
const I18nKeys = {
	longI18nKey: "classification.long",
	shortI18nKey: "classification.short"
};
const AppClassification = ({ variant, breakpoint, overwrite, mx }) => {
	const context = useContext(AppClassificationContext);
	const { i18n } = useTranslation(MODULE_NAME);
	const _value = overwrite?.toLowerCase() || context?.value?.toLowerCase() || "error";
	const enClassiT = i18n.getFixedT("en", `${MODULE_NAME}.${_value}`);
	const frClassiT = i18n.getFixedT("fr", `${MODULE_NAME}.${_value}`);
	return /* @__PURE__ */ jsx(AppClassificationBase, {
		...useMemo(() => ({
			short_text_en: enClassiT(I18nKeys.shortI18nKey),
			short_text_fr: frClassiT(I18nKeys.shortI18nKey),
			long_text_en: enClassiT(I18nKeys.longI18nKey),
			long_text_fr: frClassiT(I18nKeys.longI18nKey),
			color: AppClassificationColors[_value]
		}), [
			enClassiT,
			frClassiT,
			_value
		]),
		variant,
		breakpoint,
		state: _value,
		mx
	});
};

//#endregion
//#region src/elements/AppTLP.tsx
const AMBER_SX = {
	color: "#FFC000",
	backgroundColor: "#000"
};
const TLP_SCHEMA = {
	red: {
		sx: {
			color: "#FF2B2B",
			backgroundColor: "#000"
		},
		text: "TLP:RED"
	},
	amber: {
		sx: AMBER_SX,
		text: "TLP:AMBER"
	},
	"amber+strict": {
		sx: AMBER_SX,
		text: "TLP:AMBER+STRICT"
	},
	green: {
		sx: {
			color: "#33FF00",
			backgroundColor: "#000"
		},
		text: "TLP:GREEN"
	},
	clear: {
		sx: {
			color: "#FFFFFF",
			backgroundColor: "#000"
		},
		text: "TLP:CLEAR"
	}
};
const AppTLP = ({ value, mx }) => {
	const configs = TLP_SCHEMA[value];
	return /* @__PURE__ */ jsx(Chip, {
		size: "small",
		variant: "filled",
		label: configs.text,
		sx: {
			...configs.sx,
			...mx ?? {},
			borderRadius: 0,
			fontWeight: 600
		}
	});
};

//#endregion
//#region src/hooks/useAppClassification.tsx
const useAppClassification = () => {
	return useContext(AppClassificationContext);
};

//#endregion
//#region src/i18n/c/en.json
var en_default = {
	"classification.short": "C",
	"classification.long": "CONFIDENTIAL"
};

//#endregion
//#region src/i18n/c/fr.json
var fr_default = {
	"classification.short": "PB",
	"classification.long": "PROTÉGÉ B"
};

//#endregion
//#region src/i18n/en.json
var en_default$1 = {
	"classification.state.loading.long": "Loading",
	"classification.state.loading.short": "...",
	"classification.state.error.long": "Error",
	"classification.state.error.short": "X",
	"classification.state.unsupported.long": "Unsupported",
	"classification.state.unsupported.short": "?"
};

//#endregion
//#region src/i18n/fr.json
var fr_default$1 = {
	"classification.state.loading.long": "Chargement",
	"classification.state.loading.short": "...",
	"classification.state.error.long": "Erreur",
	"classification.state.error.short": "?",
	"classification.state.unsupported.long": "Non supporté",
	"classification.state.unsupported.short": "?"
};

//#endregion
//#region src/i18n/pa/en.json
var en_default$2 = {
	"classification.short": "PA",
	"classification.long": "PROTECTED A"
};

//#endregion
//#region src/i18n/pa/fr.json
var fr_default$2 = {
	"classification.short": "PB",
	"classification.long": "PROTÉGÉ B"
};

//#endregion
//#region src/i18n/pb/en.json
var en_default$3 = {
	"classification.short": "PB",
	"classification.long": "PROTECTED B"
};

//#endregion
//#region src/i18n/pb/fr.json
var fr_default$3 = {
	"classification.short": "PB",
	"classification.long": "PROTÉGÉ B"
};

//#endregion
//#region src/i18n/pc/en.json
var en_default$4 = {
	"classification.short": "PC",
	"classification.long": "PROTECTED C"
};

//#endregion
//#region src/i18n/pc/fr.json
var fr_default$4 = {
	"classification.short": "PB",
	"classification.long": "PROTÉGÉ B"
};

//#endregion
//#region src/i18n/s/en.json
var en_default$5 = {
	"classification.short": "S",
	"classification.long": "SECRET"
};

//#endregion
//#region src/i18n/s/fr.json
var fr_default$5 = {
	"classification.short": "PB",
	"classification.long": "PROTÉGÉ B"
};

//#endregion
//#region src/i18n/ts/en.json
var en_default$6 = {
	"classification.short": "TS",
	"classification.long": "TOP SECRET"
};

//#endregion
//#region src/i18n/ts/fr.json
var fr_default$6 = {
	"classification.short": "PB",
	"classification.long": "PROTÉGÉ B"
};

//#endregion
//#region src/i18n/u/en.json
var en_default$7 = {
	"classification.short": "U//OUO",
	"classification.long": "UNCLASSIFIED//OFFICIAL USE ONLY"
};

//#endregion
//#region src/i18n/u/fr.json
var fr_default$7 = {
	"classification.short": "NC//RADFO",
	"classification.long": "NON CLASSIFIÉ//RÉSERVÉ À DES FINS OFFICIELLES"
};

//#endregion
//#region src/i18n/index.ts
function addTranslations(i18n) {
	i18n.addResourceBundle("en", MODULE_NAME, en_default$1);
	i18n.addResourceBundle("fr", MODULE_NAME, fr_default$1);
	i18n.addResourceBundle("en", `${MODULE_NAME}.u`, en_default$7);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.u`, fr_default$7);
	i18n.addResourceBundle("en", `${MODULE_NAME}.pa`, en_default$2);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.pa`, fr_default$2);
	i18n.addResourceBundle("en", `${MODULE_NAME}.pb`, en_default$3);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.pb`, fr_default$3);
	i18n.addResourceBundle("en", `${MODULE_NAME}.pc`, en_default$4);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.pc`, fr_default$4);
	i18n.addResourceBundle("en", `${MODULE_NAME}.c`, en_default);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.c`, fr_default);
	i18n.addResourceBundle("en", `${MODULE_NAME}.s`, en_default$5);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.s`, fr_default$5);
	i18n.addResourceBundle("en", `${MODULE_NAME}.ts`, en_default$6);
	i18n.addResourceBundle("fr", `${MODULE_NAME}.ts`, fr_default$6);
}

//#endregion
export { AppClassification, AppClassificationBase, AppClassificationProvider, AppClassificationStates, AppClassificationValues, AppTLP, TLP_SCHEMA, addTranslations, useAppClassification };
//# sourceMappingURL=index.js.map