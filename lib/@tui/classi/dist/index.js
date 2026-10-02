import { Chip, Skeleton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
import { Security } from "@mui/icons-material";
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
* Supported classification qualifiers.
*/
const AppClassificationQualifiers = ["ouo", "cic"];
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
const AppClassificationProvider = ({ children, value, qualifier, tlp, url }) => {
	const [state, setState] = useState(value);
	const [stateQualifier, setStateQualifier] = useState(qualifier);
	const [stateTLP, setStateTLP] = useState(tlp);
	useEffect(() => {
		if (!url) return;
		setState("loading");
		fetch(url).then((response) => response.json()).then((data) => {
			setState(data.value);
			setStateQualifier(data.qualifier);
			setStateTLP(data.tlp);
		}).catch(() => {
			setState("error");
		});
	}, [url]);
	const _state = useMemo(() => {
		if (state) return state;
		return value;
	}, [state, value]);
	const _qualifier = useMemo(() => qualifier ?? stateQualifier, [qualifier, stateQualifier]);
	const _tlp = useMemo(() => tlp ?? stateTLP, [tlp, stateTLP]);
	const _value = useMemo(() => ({
		initialized: !!_state,
		value: _state,
		qualifier: _qualifier,
		tlp: _tlp,
		setValue: setState
	}), [
		_state,
		_qualifier,
		_tlp
	]);
	return /* @__PURE__ */ jsx(AppClassificationContext.Provider, {
		value: _value,
		children
	});
};

//#endregion
//#region src/elements/AppClassificationBase.tsx
const AppClassificationBase = ({ variant, state, breakpoint = "xl", short_text_en, short_text_fr, long_text_en, long_text_fr, short_qualifier_en, short_qualifier_fr, long_qualifier_en, long_qualifier_fr, color, mx }) => {
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
	const text = useMemo(() => {
		const classificationText = isBreakpoint ? isEN() ? short_text_en : short_text_fr : isEN() ? long_text_en : long_text_fr;
		const qualifierText = isBreakpoint ? isEN() ? short_qualifier_en : short_qualifier_fr : isEN() ? long_qualifier_en : long_qualifier_fr;
		if (!qualifierText) return classificationText;
		return `${classificationText}${qualifierText}`;
	}, [
		isBreakpoint,
		isEN,
		short_text_en,
		short_text_fr,
		long_text_en,
		long_text_fr,
		short_qualifier_en,
		short_qualifier_fr,
		long_qualifier_en,
		long_qualifier_fr
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
const isAppTLPValue = (value) => {
	return !!value && Object.prototype.hasOwnProperty.call(TLP_SCHEMA, value);
};
const AppTLP = ({ value, mx }) => {
	if (!isAppTLPValue(value)) {
		console.error(`Unsupported TLP value: ${value ?? "undefined"}`);
		return null;
	}
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
const AppClassification = ({ variant, breakpoint, overwrite, mx }) => {
	const context = useContext(AppClassificationContext);
	const { i18n } = useTranslation(MODULE_NAME);
	const _value = overwrite?.value?.toLowerCase() || context?.value?.toLowerCase() || "error";
	const _qualifier = overwrite?.qualifier?.toLowerCase() || context?.qualifier?.toLowerCase();
	const tlpValue = overwrite?.tlp?.toLowerCase() || context?.tlp?.toLowerCase();
	const _tlp = isAppTLPValue(tlpValue) ? tlpValue : void 0;
	const enClassiT = i18n.getFixedT("en", MODULE_NAME);
	const frClassiT = i18n.getFixedT("fr", MODULE_NAME);
	const qualifierText = useMemo(() => {
		if (!_qualifier) return;
		return {
			short_qualifier_en: enClassiT(`classification.qualifiers.${_qualifier}.short`),
			short_qualifier_fr: frClassiT(`classification.qualifiers.${_qualifier}.short`),
			long_qualifier_en: enClassiT(`classification.qualifiers.${_qualifier}.long`),
			long_qualifier_fr: frClassiT(`classification.qualifiers.${_qualifier}.long`)
		};
	}, [
		_qualifier,
		enClassiT,
		frClassiT
	]);
	const configs = useMemo(() => ({
		short_text_en: enClassiT(`classification.${_value}.short`),
		short_text_fr: frClassiT(`classification.${_value}.short`),
		long_text_en: enClassiT(`classification.${_value}.long`),
		long_text_fr: frClassiT(`classification.${_value}.long`),
		...qualifierText,
		color: AppClassificationColors[_value]
	}), [
		enClassiT,
		frClassiT,
		_value,
		qualifierText
	]);
	return _tlp ? /* @__PURE__ */ jsxs(Stack, {
		direction: "row",
		alignItems: "center",
		children: [/* @__PURE__ */ jsx(AppClassificationBase, {
			...configs,
			variant,
			breakpoint,
			state: _value,
			mx
		}), /* @__PURE__ */ jsx(AppTLP, {
			value: _tlp,
			mx
		})]
	}) : /* @__PURE__ */ jsx(AppClassificationBase, {
		...configs,
		variant,
		breakpoint,
		state: _value,
		mx
	});
};

//#endregion
//#region src/hooks/useAppClassification.tsx
const useAppClassification = () => {
	return useContext(AppClassificationContext);
};

//#endregion
//#region src/i18n/en.json
var en_default = {
	"classification.state.loading.long": "Loading",
	"classification.state.loading.short": "...",
	"classification.state.error.long": "Error",
	"classification.state.error.short": "X",
	"classification.state.unsupported.long": "Unsupported",
	"classification.state.unsupported.short": "?",
	"classification.u.short": "U",
	"classification.u.long": "UNCLASSIFIED",
	"classification.pa.short": "PA",
	"classification.pa.long": "PROTECTED A",
	"classification.pb.short": "PB",
	"classification.pb.long": "PROTECTED B",
	"classification.pc.short": "PC",
	"classification.pc.long": "PROTECTED C",
	"classification.c.short": "C",
	"classification.c.long": "CONFIDENTIAL",
	"classification.s.short": "S",
	"classification.s.long": "SECRET",
	"classification.ts.short": "TS",
	"classification.ts.long": "TOP SECRET",
	"classification.qualifiers.ouo.long": "//OFFICIAL USE ONLY",
	"classification.qualifiers.ouo.short": "//OUO",
	"classification.qualifiers.cic.long": "//COMMERCIAL IN CONFIDENCE",
	"classification.qualifiers.cic.short": "//CIC"
};

//#endregion
//#region src/i18n/fr.json
var fr_default = {
	"classification.state.loading.long": "Chargement",
	"classification.state.loading.short": "...",
	"classification.state.error.long": "Erreur",
	"classification.state.error.short": "?",
	"classification.state.unsupported.long": "Non supporté",
	"classification.state.unsupported.short": "?",
	"classification.u.short": "U",
	"classification.u.long": "NON CLASSIFIÉ",
	"classification.pa.short": "PA",
	"classification.pa.long": "PROTÉGÉ A",
	"classification.pb.short": "PB",
	"classification.pb.long": "PROTÉGÉ B",
	"classification.pc.short": "PC",
	"classification.pc.long": "PROTÉGÉ C",
	"classification.c.short": "C",
	"classification.c.long": "CONFIDENTIEL",
	"classification.s.short": "S",
	"classification.s.long": "SECRET",
	"classification.ts.short": "TS",
	"classification.ts.long": "TOP SECRET",
	"classification.qualifiers.ouo.long": "//RÉSERVÉ À DES FINS OFFICIELLES",
	"classification.qualifiers.ouo.short": "//RADFO",
	"classification.qualifiers.cic.long": "//RENSEIGNEMENTS COMMERCIAUX CONFIDENTIELS",
	"classification.qualifiers.cic.short": "//RCC"
};

//#endregion
//#region src/i18n/index.ts
function addTranslations(i18n) {
	i18n.addResourceBundle("en", MODULE_NAME, en_default);
	i18n.addResourceBundle("fr", MODULE_NAME, fr_default);
}

//#endregion
export { AppClassification, AppClassificationBase, AppClassificationProvider, AppClassificationQualifiers, AppClassificationStates, AppClassificationValues, AppTLP, TLP_SCHEMA, addTranslations, useAppClassification };
//# sourceMappingURL=index.js.map