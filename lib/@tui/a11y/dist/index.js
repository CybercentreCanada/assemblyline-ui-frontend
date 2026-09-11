import { AccessibilityNew, CachedOutlined, FormatAlignCenterOutlined, FormatAlignJustifyOutlined, FormatAlignLeftOutlined, FormatAlignRightOutlined, HourglassBottomOutlined, HourglassDisabledOutlined, HourglassEmptyOutlined, HourglassFullOutlined } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { PageContent, useAppTheme } from "@tui/core";
import { useAppDrawer } from "@tui/drawer";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

//#region src/configs/AccessibilityContext.tsx
const AppAccessibilityContext = createContext({
	initialized: false,
	preferences: {},
	features: [],
	states: {
		textSize: "default",
		textSpacing: "default",
		lineHeight: "default",
		cursor: "default",
		textAlign: "default",
		animation: "play",
		tooltipLeaveDelay: "default"
	}
});

//#endregion
//#region src/configs/AppAccessibilityDefaults.ts
const AppDefaultsAccessibilityPreferences = {
	enableAccessibility: true,
	enableCursor: true,
	enableAnimation: true,
	enableLineHeight: true,
	enableTextAlignment: true,
	enableTextSize: true,
	enableTextSpacing: true,
	enableTooltipLeaveDelay: true
};
const AppDefaultsAccessibilityStates = {
	textSize: "default",
	textSpacing: "default",
	lineHeight: "default",
	cursor: "default",
	textAlign: "default",
	animation: "play",
	tooltipLeaveDelay: "default"
};

//#endregion
//#region src/hooks/useAppAccessibilityPreferences.tsx
const useAppAccessibilityPreferences = () => {
	const context = useContext(AppAccessibilityContext);
	return useMemo(() => {
		if (!context) return null;
		const { preferences } = context;
		return {
			...AppDefaultsAccessibilityPreferences,
			...preferences || {}
		};
	}, [context]);
};

//#endregion
//#region src/hooks/useAppAccessibilityStates.tsx
function useAppAccessibilityStates() {
	const { states } = useContext(AppAccessibilityContext);
	return useMemo(() => {
		return {
			...AppDefaultsAccessibilityStates,
			...states || {}
		};
	}, [states]);
}

//#endregion
//#region src/hooks/useAccessibilityThemeBuilder.ts
const buildThemeOverride = (accessibilityStates, accessibilityPreferences) => ({ global: {
	components: {
		MuiCssBaseline: { styleOverrides: { ...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableAnimation && accessibilityStates?.animation === "pause" ? { "*, *::before, *::after": {
			transition: "none !important",
			animation: "none !important"
		} } : {} } },
		...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableAnimation && accessibilityStates?.animation === "pause" ? { MuiButtonBase: { defaultProps: { disableRipple: true } } } : {},
		...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableTooltipLeaveDelay ? { MuiTooltip: { defaultProps: { leaveDelay: accessibilityStates?.getTooltipLeaveDelay() } } } : {}
	},
	typography: { allVariants: {
		...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableTextAlignment && accessibilityStates?.getTextAlign() ? { textAlign: accessibilityStates?.getTextAlign() } : {},
		...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableTextSize && accessibilityStates?.getTextSize() ? { fontSize: accessibilityStates?.getTextSize() } : {},
		...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableLineHeight && accessibilityStates?.getLineHeight() ? { lineHeight: accessibilityStates?.getLineHeight() } : {},
		...accessibilityPreferences?.enableAccessibility && accessibilityPreferences?.enableTextSpacing && accessibilityStates?.getTextSpacing() ? { letterSpacing: accessibilityStates?.getTextSpacing() } : {}
	} }
} });
function useAccessibilityThemeBuilder() {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	return useMemo(() => buildThemeOverride(accessibilityStates, accessibilityPreferences), [accessibilityStates, accessibilityPreferences]);
}

//#endregion
//#region src/hooks/useAppAccessibilityContext.tsx
function useAppAccessibilityContext() {
	return useContext(AppAccessibilityContext);
}

//#endregion
//#region src/name.ts
const MODULE_NAME = "tui.a11y";

//#endregion
//#region src/components/elements/AccessibilityButton.tsx
/**
* A Step component used as part of the Accessibility Button component to notify the user how many options are associated with the button
*
* @param {boolean} [active] An optional field, it will change the color of the button to show an active or inactive state
*
* @returns {ReactNode} Returns a ReactNode component
*/
const Step = ({ active = true }) => {
	const theme = useTheme();
	return /* @__PURE__ */ jsx(Grid, {
		size: 3,
		sx: {
			flexGrow: 1,
			display: "flex",
			justifyContent: "center"
		},
		children: /* @__PURE__ */ jsx(Paper, {
			variant: "outlined",
			sx: {
				backgroundColor: active && theme.palette.success.main,
				borderColor: active ? theme.palette.success.main : theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
				height: theme.spacing(1),
				width: theme.spacing(5)
			}
		})
	});
};
/**
* Render an Accessibility Button Component as part of the Accessibility Drawer.
* These are interactive buttons meant to enhance the user experience by accommodating different disabilities.
*
* @param {() => void} action The action to occur when the accessibility button is interacted with
* @param {ReactNode} Icon A ReactNode component for an icon to be display in the accessibility button
* @param {string} title A human readable string to describe the function and purpose of the accessibility button
* @param {Step} [Steps] An optional <code>Step</code> component or combination of <code>Step</code> components. Used to tell the user which option of the button they are on
* @param {string} [tooltip] An optional tooltip text to provide more details on the accessibility button purpose and function
* @param {boolean} [active] An optional field, used to hide/show a checkmark on the button as a way to notify the user that the button has changed a default setting of the application
*
* @returns {ReactNode} Returns a ReactNode component
*/
const AccessibilityButton = ({ action, Icon, title, Steps, tooltip, active = false }) => {
	const drawer = useAppDrawer();
	return /* @__PURE__ */ jsx(Grid, {
		textAlign: "center",
		size: {
			xs: 12,
			sm: 6,
			md: drawer.maximized ? 4 : 6,
			xl: drawer.maximized ? 2 : 4
		},
		children: /* @__PURE__ */ jsxs(Button, {
			variant: "outlined",
			color: "inherit",
			onClick: action,
			sx: {
				width: "100%",
				position: "relative"
			},
			children: [
				/* @__PURE__ */ jsxs(Stack, { children: [
					/* @__PURE__ */ jsx(Box, {
						pt: 1,
						display: "flex",
						justifyContent: "center",
						children: Icon
					}),
					/* @__PURE__ */ jsx(Typography, {
						my: .5,
						children: title
					}),
					Steps && /* @__PURE__ */ jsx(Box, {
						sx: { flexGrow: 1 },
						children: /* @__PURE__ */ jsxs(Grid, {
							container: true,
							spacing: 3,
							children: [/* @__PURE__ */ jsx(Step, {}), Steps]
						})
					})
				] }),
				tooltip && /* @__PURE__ */ jsx(Tooltip, {
					title: tooltip,
					children: /* @__PURE__ */ jsx(HelpOutlineOutlinedIcon, { sx: {
						position: "absolute",
						top: "0.25rem",
						right: "0.25rem"
					} })
				}),
				active && /* @__PURE__ */ jsx(CheckCircleOutlineIcon, {
					color: "success",
					sx: {
						position: "absolute",
						top: "0.25rem",
						left: "0.25rem"
					}
				})
			]
		})
	});
};

//#endregion
//#region src/components/elements/AnimationButton.tsx
const PauseAnimationIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 36 36",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			children: [/* @__PURE__ */ jsx("path", {
				fill: "currentColor",
				d: "M15.8087111 23.6666667h-1.2702778c-.4429444 0-.8018333-.3598334-.8018333-.8027778v-9.7277778c0-.4429444.3588889-.8027778.8018333-.8027778h1.2702778c.4429445 0 .8027778.3598334.8027778.8027778v9.7277778c0 .4429444-.3598333.8027778-.8027778.8027778m6.6525722 0h-1.2702777c-.442 0-.8018334-.3598334-.8018334-.8027778v-9.7277778c0-.4429444.3598334-.8027778.8018334-.8027778h1.2702777c.4438889 0 .8027778.3598334.8027778.8027778v9.7277778c0 .4429444-.3588889.8027778-.8027778.8027778"
			}), /* @__PURE__ */ jsx("path", {
				stroke: "currentColor",
				strokeLinecap: "round",
				strokeWidth: "1.88888889",
				d: "M18.5 4.77777778V1m0 34v-3.7777778M31.7222222 18H35.5m-34 0h3.77777778m3.87278889-9.34943333L6.47873333 5.97967778M30.5204167 30.0204167l-2.6708889-2.6708889m-.0000945-18.69896113 2.6708889-2.67088889M6.47911111 30.0204167l2.67183333-2.6708889M23.5542889 5.78219444l1.4440555-3.49066666M12.0013722 33.7087556l1.4440556-3.4906667m17.2723778-7.1638 3.4906666 1.4440555M2.79124444 11.5013722l3.49066667 1.4440556m7.15274999-7.15860558L11.9877722 2.2971m13.0246445 31.4061778-1.4468889-3.4897222m7.14765-17.2788945L34.2029 11.4877722M2.79672222 24.5124167l3.48972222-1.4468889"
			})]
		})
	});
};
const PlayAnimationIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 36 36",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			children: [/* @__PURE__ */ jsx("path", {
				fill: "currentColor",
				d: "M14 13.6845422v8.6309156c0 .5522848.4477153 1 1 1 .167319 0 .3319635-.0419834.4788521-.1221044l7.9116727-4.3154578c.4848483-.2644628.6635062-.8718994.3990434-1.3567477-.0919453-.1685665-.2304769-.3070981-.3990434-.3990435l-7.9116727-4.3154578c-.4848483-.2644627-1.0922849-.0858049-1.3567477.3990435-.080121.1468886-.1221044.3115331-.1221044.4788521Z"
			}), /* @__PURE__ */ jsx("path", {
				stroke: "currentColor",
				strokeLinecap: "round",
				strokeWidth: "1.88888889",
				d: "M18 4.77777778V1m0 34v-3.7777778M31.2222222 18H35M1 18h3.77777778m3.87278889-9.34943333L5.97873333 5.97967778M30.0204167 30.0204167l-2.6708889-2.6708889m-.0000945-18.69896113 2.6708889-2.67088889M5.97911111 30.0204167l2.67183333-2.6708889M23.0542889 5.78219444l1.4440555-3.49066666M11.5013722 33.7087556l1.4440556-3.4906667m17.2723778-7.1638 3.4906666 1.4440555M2.29124444 11.5013722l3.49066667 1.4440556m7.15274999-7.15860558L11.4877722 2.2971m13.0246445 31.4061778-1.4468889-3.4897222m7.14765-17.2788945L33.7029 11.4877722M2.29672222 24.5124167l3.48972222-1.4468889"
			})]
		})
	});
};
const AnimationButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableAnimation ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: accessibilityStates?.animation === "play" ? t("accessibilitymenu.animation.pause") : t("accessibilitymenu.animation.play"),
		tooltip: t("accessibilitymenu.animation.tooltip"),
		active: accessibilityStates?.animation === "pause",
		action: accessibilityStates?.toggleAnimation,
		Icon: accessibilityStates?.animation === "play" ? /* @__PURE__ */ jsx(PlayAnimationIcon, {
			height: "2rem",
			width: "2rem"
		}) : /* @__PURE__ */ jsx(PauseAnimationIcon, {
			height: "2rem",
			width: "2rem"
		})
	}) : null;
};

//#endregion
//#region src/components/elements/CursorButton.tsx
const ReadingMaskIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 36 26",
		...props,
		children: /* @__PURE__ */ jsx("path", {
			fill: "currentColor",
			d: "m29.012621 0 3.008677.03216C33.117497.04383 34 .93578 34 2.03204V6.999l1 .00098c.552285 0 1 .44772 1 1v10c0 .55229-.447715 1-1 1l-1-.00098V24c0 1.10457-.895431 2-2 2H4c-1.104569 0-2-.89543-2-2v-5.001l-1 .00098c-.552285 0-1-.44771-1-1v-10c0-.55228.447715-1 1-1L2 6.999V2.04929c0-1.10303.893028-1.99782 1.996056-2L28.987378 0h.025243ZM5 18.999H3.8V24c0 .11046.089543.2.2.2h28c.110457 0 .2-.08954.2-.2v-5.001H31V22c0 .55228-.447715 1-1 1H6c-.552285 0-1-.44772-1-1v-3.001Zm28.75-8.99901H2.25c-.139571 0-.25.11193-.25.25v5.5c0 .13807.111929.25.25.25h31.5c.138071 0 .25-.11193.25-.25v-5.5c0-.13807-.111929-.25-.25-.25Zm-4.756547-8.19998-24.993847.04928c-.110303.00022-.199606.0897-.199606.2V6.999H5V4.0507c0-.5513.446172-.9986.997466-1l19.989356-.05066.026356.00011 3.997466.04255c.548101.00583.989356.45181.989356.99994V6.999h1.2V2.03204c0-.10962-.08825-.19882-.19787-.19999l-3.008677-.03204Z"
		})
	});
};
const ReadingGuideIcon = (props) => {
	return /* @__PURE__ */ jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		fill: "none",
		version: "1.2",
		viewBox: "0 0 36 26",
		...props,
		children: [/* @__PURE__ */ jsx("path", {
			fill: "currentColor",
			fillRule: "evenodd",
			d: "M28.993.0000711V0l-.0113.0000223-24.98564.049276C3.44479.0503855 2.94455.275608 2.58439.636476 2.22424.997344 2 1.49803 2 2.04929V24c0 .552.22484 1.0533.58579 1.4142C2.94673 25.7751 3.44796 26 4 26h28c.552 0 1.0533-.2249 1.4142-.5858C33.7752 25.0533 34 24.552 34 24V13.778c-.014.1248-.1199.2219-.2484.2219H32.2V24c0 .0555-.0214.1042-.0586.1414S32.0555 24.2 32 24.2H4c-.05548 0-.10424-.0214-.14142-.0586C3.8214 24.1042 3.8 24.0555 3.8 24V13.9999H2.25156c-.13807 0-.25-.112-.25-.25v-1.5c0-.1381.11193-.25.25-.25H3.8V2.04929c0-.05539.02135-.10411.05844-.14128.03709-.03716.08577-.05861.14117-.05872l24.97999-.04926 3.0225.03203h.0001c.055.0006.1033.02223.14.05932.0367.0371.0578.08561.0578.14067v9.96785h1.5516c.1285 0 .2344.097.2484.2218V2.03205c0-.54789-.2216-1.046139-.5783-1.406664-.3567-.360523-.8525-.5873892-1.4004-.5932238v-4e-7L28.993.0000711Z",
			clipRule: "evenodd"
		}), /* @__PURE__ */ jsx("path", {
			fill: "currentColor",
			fillRule: "evenodd",
			d: "M35 8.99976H1c-.552285 0-1 .44771-1 1v6.00004c0 .5522.447715 1 1 1h34c.5523 0 1-.4478 1-1V9.99976c0-.55229-.4477-1-1-1ZM2.25 11.9998h31.5c.1381 0 .25.1119.25.25v1.5c0 .138-.1119.25-.25.25H2.25c-.13807 0-.25-.112-.25-.25v-1.5c0-.1381.11193-.25.25-.25Z",
			clipRule: "evenodd"
		})]
	});
};
const CursorIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 36 36",
		...props,
		children: /* @__PURE__ */ jsx("path", {
			fill: "none",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			strokeWidth: "2",
			d: "m15.9983464 11.5517813 9.5269972 9.52699721-4.4465655 4.44656549-9.5269972-9.52699717-4.05145413 9.06403815L1 1.0000004l24.0623846 6.5003268z"
		})
	});
};
const getCursorIcon = (cursor) => {
	switch (cursor) {
		case "default": return /* @__PURE__ */ jsx(CursorIcon, {
			height: "2rem",
			width: "2rem"
		});
		case "readingMask": return /* @__PURE__ */ jsx(ReadingMaskIcon, {
			height: "2rem",
			width: "2rem"
		});
		case "readingGuide": return /* @__PURE__ */ jsx(ReadingGuideIcon, {
			height: "2rem",
			width: "2rem"
		});
	}
};
const CursorButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableCursor ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: accessibilityStates?.cursor === "default" ? t("accessibilitymenu.cursor.default") : accessibilityStates?.cursor === "readingGuide" ? t("accessibilitymenu.cursor.readingGuide") : t("accessibilitymenu.cursor.readingMask"),
		tooltip: t("accessibilitymenu.cursor.tooltip"),
		active: accessibilityStates?.cursor !== "default",
		action: accessibilityStates?.nextCursor,
		Icon: getCursorIcon(accessibilityStates?.cursor),
		Steps: accessibilityStates?.cursor !== "default" && /* @__PURE__ */ jsx(Step, { active: accessibilityStates?.cursor === "readingMask" })
	}) : null;
};

//#endregion
//#region src/components/elements/LineHeightButton.tsx
const LineHeightIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 47 19",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			children: [
				/* @__PURE__ */ jsx("path", {
					stroke: "currentColor",
					strokeLinecap: "round",
					strokeWidth: "2",
					d: "M3.94487862 2.71042226V16.7104223"
				}),
				/* @__PURE__ */ jsx("path", {
					fill: "currentColor",
					d: "m.11302135 14.5270412 3.44487862 4.2104072c.17486379.2137224.48987514.2452235.70359754.0703597a.4999988.4999988 0 0 0 .07035976-.0703597l3.44487862-4.2104072c.17486378-.2137225.14336265-.5287338-.07035976-.7035976-.08933106-.073089-.20119771-.1130213-.31661889-.1130213H.5c-.27614237 0-.5.2238576-.5.5 0 .1154211.0399323.2272878.11302135.3166189Zm0-10.1332381L3.55789997.18339592c.17486379-.21372241.48987514-.24522355.70359754-.07035976a.49999975.49999975 0 0 1 .07035976.07035976l3.44487862 4.2104072c.17486378.2137224.14336265.52873375-.07035976.70359754-.08933106.07308905-.20119771.11302135-.31661889.11302135H.5c-.27614237 0-.5-.22385762-.5-.5 0-.11542118.0399323-.22728783.11302135-.3166189Z"
				}),
				/* @__PURE__ */ jsx("path", {
					stroke: "currentColor",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					strokeWidth: "2",
					d: "M15.4448786 1.71042226h30m-30 5h30m-30 5.00000004h30m-30 5h24"
				})
			]
		})
	});
};
const LineHeightButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableLineHeight ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: accessibilityStates?.lineHeight === "default" ? t("accessibilitymenu.lineheight.default") : accessibilityStates?.lineHeight === "1.5x" ? t("accessibilitymenu.lineheight.15x") : accessibilityStates?.lineHeight === "1.75x" ? t("accessibilitymenu.lineheight.175x") : t("accessibilitymenu.lineheight.2x"),
		tooltip: t("accessibilitymenu.lineheight.tooltip"),
		active: accessibilityStates?.lineHeight !== "default",
		action: accessibilityStates?.nextLineHeight,
		Icon: /* @__PURE__ */ jsx(LineHeightIcon, {
			height: "2rem",
			width: "2rem"
		}),
		Steps: accessibilityStates?.lineHeight !== "default" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.lineHeight !== "1.5x" }), /* @__PURE__ */ jsx(Step, { active: accessibilityStates?.lineHeight === "2x" })] })
	}) : null;
};

//#endregion
//#region src/components/elements/TextAlignmentButton.tsx
const getTextAlignmentIcon = (textAlign) => {
	switch (textAlign) {
		case "default":
		case "alignLeft": return /* @__PURE__ */ jsx(FormatAlignLeftOutlined, { sx: {
			height: "2rem",
			width: "2rem"
		} });
		case "alignCenter": return /* @__PURE__ */ jsx(FormatAlignCenterOutlined, { sx: {
			height: "2rem",
			width: "2rem"
		} });
		case "alignRight": return /* @__PURE__ */ jsx(FormatAlignRightOutlined, { sx: {
			height: "2rem",
			width: "2rem"
		} });
		case "justified": return /* @__PURE__ */ jsx(FormatAlignJustifyOutlined, { sx: {
			height: "2rem",
			width: "2rem"
		} });
	}
};
const TextAlignmentButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTextAlignment ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: accessibilityStates?.textAlign === "default" ? t("accessibilitymenu.textalignment.default") : accessibilityStates?.textAlign === "alignLeft" ? t("accessibilitymenu.textalignment.left") : accessibilityStates?.textAlign === "alignRight" ? t("accessibilitymenu.textalignment.right") : accessibilityStates?.textAlign === "alignCenter" ? t("accessibilitymenu.textalignment.center") : t("accessibilitymenu.textalignment.justify"),
		tooltip: t("accessibilitymenu.textalignment.tooltip"),
		active: accessibilityStates?.textAlign !== "default",
		action: accessibilityStates?.nextTextAlign,
		Icon: getTextAlignmentIcon(accessibilityStates?.textAlign),
		Steps: accessibilityStates?.textAlign !== "default" && /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textAlign !== "alignLeft" }),
			/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textAlign !== "alignLeft" && accessibilityStates?.textAlign !== "alignRight" }),
			/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textAlign === "justified" })
		] })
	}) : null;
};

//#endregion
//#region src/components/elements/TextSizeButton.tsx
const TextSizeIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 36 36",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeWidth: "2",
			children: [
				/* @__PURE__ */ jsx("path", {
					strokeLinejoin: "round",
					d: "M26.58 21.3225806V1m-7.92 4.06451613V1H34.5v4.06451613"
				}),
				/* @__PURE__ */ jsx("path", { d: "M22.62 21.3225806h7.92" }),
				/* @__PURE__ */ jsx("path", {
					strokeLinejoin: "round",
					d: "M6.78 18.6129032V5.06451613M1.5 7.77419355V5.06451613h10.56v2.70967742"
				}),
				/* @__PURE__ */ jsx("path", { d: "M4.14 18.6129032h5.28" })
			]
		})
	});
};
const TextSizeButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTextSize ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: t("accessibilitymenu.textsize.default"),
		tooltip: t("accessibilitymenu.textsize.tooltip"),
		active: accessibilityStates?.textSize !== "default",
		action: accessibilityStates?.nextTextSize,
		Icon: /* @__PURE__ */ jsx(TextSizeIcon, {
			height: "2rem",
			width: "2rem"
		}),
		Steps: accessibilityStates?.textSize !== "default" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textSize !== "sm" }), /* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textSize === "lg" })] })
	}) : null;
};

//#endregion
//#region src/components/elements/TextSpacingButton.tsx
const LightSpacingIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 36 36",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeWidth: "2",
			children: [/* @__PURE__ */ jsx("path", {
				strokeDasharray: "4,7",
				d: "M3 7h26"
			}), /* @__PURE__ */ jsx("path", {
				strokeLinejoin: "round",
				d: "M7 13 1 7l6-6m18 12 6-6-6-6"
			})]
		})
	});
};
const ModerateSpacingIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 60 36",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeWidth: "2",
			children: [/* @__PURE__ */ jsx("path", {
				strokeDasharray: "4,7",
				d: "M3.5 7h48"
			}), /* @__PURE__ */ jsx("path", {
				strokeLinejoin: "round",
				d: "M7 13 1 7l6-6m41 12 6-6-6-6"
			})]
		})
	});
};
const HeavySpacingIcon = (props) => {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		version: "1.2",
		viewBox: "0 0 68 36",
		...props,
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			fillRule: "evenodd",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeWidth: "2",
			children: [/* @__PURE__ */ jsx("path", {
				strokeDasharray: "4,7",
				d: "M3 7h62"
			}), /* @__PURE__ */ jsx("path", {
				strokeLinejoin: "round",
				d: "M7 13 1 7l6-6m51 12 6-6-6-6"
			})]
		})
	});
};
const getTextSpacingIcon = (textSpacing) => {
	switch (textSpacing) {
		case "default":
		case "moderate": return /* @__PURE__ */ jsx(ModerateSpacingIcon, {
			height: "2rem",
			width: "2rem"
		});
		case "light": return /* @__PURE__ */ jsx(LightSpacingIcon, {
			height: "2rem",
			width: "2rem"
		});
		case "heavy": return /* @__PURE__ */ jsx(HeavySpacingIcon, {
			height: "2rem",
			width: "2rem"
		});
	}
};
const TextSpacingButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTextSpacing ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: accessibilityStates?.textSpacing === "default" ? t("accessibilitymenu.linespacing.default") : accessibilityStates?.textSpacing === "light" ? t("accessibilitymenu.linespacing.light") : accessibilityStates?.textSpacing === "moderate" ? t("accessibilitymenu.linespacing.moderate") : t("accessibilitymenu.linespacing.heavy"),
		tooltip: t("accessibilitymenu.linespacing.tooltip"),
		active: accessibilityStates?.textSpacing !== "default",
		action: accessibilityStates?.nextTextSpacing,
		Icon: getTextSpacingIcon(accessibilityStates?.textSpacing),
		Steps: accessibilityStates?.textSpacing !== "default" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textSpacing !== "light" }), /* @__PURE__ */ jsx(Step, { active: accessibilityStates?.textSpacing === "heavy" })] })
	}) : null;
};

//#endregion
//#region src/components/elements/TooltipLeaveDelayButton.tsx
const getTooltipLeaveDelayIcon = (tooltipLeaveDelay) => {
	switch (tooltipLeaveDelay) {
		case "long": return /* @__PURE__ */ jsx(HourglassFullOutlined, {
			height: "2.5rem",
			width: "2.5rem"
		});
		case "moderate": return /* @__PURE__ */ jsx(HourglassBottomOutlined, {
			height: "2.5rem",
			width: "2.5rem"
		});
		case "short": return /* @__PURE__ */ jsx(HourglassEmptyOutlined, {
			height: "2.5rem",
			width: "2.5rem"
		});
		default: return /* @__PURE__ */ jsx(HourglassDisabledOutlined, {
			height: "2.5rem",
			width: "2.5rem"
		});
	}
};
const TooltipLeaveDelayButton = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	return accessibilityPreferences.enableAccessibility && accessibilityPreferences.enableTooltipLeaveDelay ? /* @__PURE__ */ jsx(AccessibilityButton, {
		title: accessibilityStates?.tooltipLeaveDelay === "default" ? t("accessibilitymenu.tooltipleavedelay.default") : accessibilityStates?.tooltipLeaveDelay === "short" ? t("accessibilitymenu.tooltipleavedelay.short") : accessibilityStates?.tooltipLeaveDelay === "moderate" ? t("accessibilitymenu.tooltipleavedelay.moderate") : t("accessibilitymenu.tooltipleavedelay.long"),
		tooltip: t("accessibilitymenu.tooltipleavedelay.tooltip"),
		active: accessibilityStates?.tooltipLeaveDelay !== "default",
		action: accessibilityStates?.nextTooltipLeaveDelay,
		Icon: getTooltipLeaveDelayIcon(accessibilityStates?.tooltipLeaveDelay),
		Steps: accessibilityStates?.tooltipLeaveDelay !== "default" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Step, { active: accessibilityStates?.tooltipLeaveDelay !== "short" }), /* @__PURE__ */ jsx(Step, { active: accessibilityStates?.tooltipLeaveDelay === "long" })] })
	}) : null;
};

//#endregion
//#region src/hooks/useAppAccessibilityFeatures.tsx
const DEFAULT_ACCESSIBILITY_FEATURES = [
	/* @__PURE__ */ jsx(CursorButton, {}, "cursorAccessibilityButton"),
	/* @__PURE__ */ jsx(AnimationButton, {}, "animationAccessibilityButton"),
	/* @__PURE__ */ jsx(LineHeightButton, {}, "lineHeightAccessibilityButton"),
	/* @__PURE__ */ jsx(TextSizeButton, {}, "textSizeAccessibilityButton"),
	/* @__PURE__ */ jsx(TextSpacingButton, {}, "textSpacingAccessibilityButton"),
	/* @__PURE__ */ jsx(TextAlignmentButton, {}, "textAlignmentAccessibilityButton"),
	/* @__PURE__ */ jsx(TooltipLeaveDelayButton, {}, "TooltipLeaveDelayButton")
];
function useAppAccessibilityFeatures() {
	const { features } = useContext(AppAccessibilityContext);
	return useMemo(() => {
		return [...DEFAULT_ACCESSIBILITY_FEATURES, ...features || []];
	}, [features]);
}

//#endregion
//#region src/hooks/useAppKeyboardShortcut.tsx
/**
* A react hook that will call a function when the necessary keys are pressed in unison
*
* @param {string} key Which key needs to be pressed to perform some action
* @param {boolean} [expectControl=false] An optional field to need CTRL to be pressed as part of the keybind
* @param {boolean} [expectShift=false] An optional field to need SHIFT to be pressed as part of the keybind
* @param {boolean} [expectAlt=false] An optional field to need ALT to be pressed as part of the keybind
* @param {() => void} [onKeyPressed] The action to perform when all of the necessary keys are pressed
*/
function useAppKeyboardShortcut({ key, onKeyPressed, expectControl = false, expectShift = false, expectAlt = false }) {
	useEffect(() => {
		function keyDownHandler(e) {
			if ((!expectControl || expectControl && e.ctrlKey) && (!expectShift || expectShift && e.shiftKey) && (!expectAlt || expectAlt && e.altKey) && e.key === key) {
				e.preventDefault();
				onKeyPressed();
			}
		}
		document.addEventListener("keydown", keyDownHandler);
		return () => {
			document.removeEventListener("keydown", keyDownHandler);
		};
	}, [
		key,
		expectControl,
		expectShift,
		expectAlt,
		onKeyPressed
	]);
}

//#endregion
//#region src/hooks/useAppMousePosition.tsx
/**
* A react hook to get the current mouse position within the visible browser window
*
* @returns {{x: number, y: number}} Returns the x and y position of the mouse
*/
const useAppMousePosition = () => {
	const [mousePosition, setMousePosition] = useState({
		x: null,
		y: null
	});
	useEffect(() => {
		const updateMousePosition = (ev) => {
			setMousePosition({
				x: ev.clientX,
				y: ev.clientY
			});
		};
		window.addEventListener("mousemove", updateMousePosition);
		return () => {
			window.removeEventListener("mousemove", updateMousePosition);
		};
	}, []);
	return mousePosition;
};

//#endregion
//#region src/components/AppDrawerAccessibility.tsx
const AccessibilityDrawer = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const accessibilityButtons = useAppAccessibilityFeatures();
	const { t } = useTranslation(MODULE_NAME);
	return /* @__PURE__ */ jsxs(PageContent, { children: [/* @__PURE__ */ jsx(Box, {
		sx: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: "0.5rem",
			marginBottom: "1rem",
			paddingLeft: "1rem",
			alignContent: "center"
		},
		children: /* @__PURE__ */ jsx(Typography, {
			fontSize: "1.75rem !important",
			children: t("accessibilitymenu")
		})
	}), /* @__PURE__ */ jsxs(Grid, {
		container: true,
		spacing: 1,
		justifyContent: "center",
		children: [accessibilityButtons.map((AccessibilityButton$1) => AccessibilityButton$1), /* @__PURE__ */ jsx(Grid, {
			size: 12,
			sx: {
				flexGrow: 1,
				textAlign: "center",
				mt: 2
			},
			children: /* @__PURE__ */ jsx(Button, {
				onClick: accessibilityStates?.resetToDefault,
				variant: "outlined",
				color: "inherit",
				size: "large",
				startIcon: /* @__PURE__ */ jsx(CachedOutlined, {}),
				children: /* @__PURE__ */ jsx(Typography, { children: t("accessibilitymenu.title") })
			})
		})]
	})] });
};
const AppDrawerAccessibilityIconButton = () => {
	const drawer = useAppDrawer();
	const accessibilityPreferences = useAppAccessibilityPreferences();
	const { t } = useTranslation(MODULE_NAME);
	const openDrawer = useCallback(() => drawer.open({
		id: "tui.app.drawer.accessibility",
		mode: "float",
		element: /* @__PURE__ */ jsx(AccessibilityDrawer, {})
	}), [drawer]);
	const closeDrawer = useCallback(() => {
		if (drawer.id === "tui.app.drawer.accessibility") drawer.close();
	}, [drawer]);
	useAppKeyboardShortcut({
		key: "u",
		expectControl: true,
		onKeyPressed: openDrawer
	});
	useAppKeyboardShortcut({
		key: "Escape",
		expectControl: false,
		onKeyPressed: closeDrawer
	});
	return accessibilityPreferences?.enableAccessibility && /* @__PURE__ */ jsx(Tooltip, {
		title: t("accessibilitymenu.tooltip"),
		children: /* @__PURE__ */ jsx(IconButton, {
			color: "inherit",
			onClick: openDrawer,
			size: "large",
			"aria-label": t("accessibilitymenu.tooltip"),
			children: /* @__PURE__ */ jsx(AccessibilityNew, {})
		})
	});
};

//#endregion
//#region src/i18n/en.json
var en_default = {
	accessibilitymenu: "Accessibility Menu (CTRL+U)",
	"accessibilitymenu.tooltip": "Open Accessibility Settings",
	"accessibilitymenu.animation.pause": "Pause Animation",
	"accessibilitymenu.animation.play": "Play Animation",
	"accessibilitymenu.animation.tooltip": "Toggle to play or pause animations.",
	"accessibilitymenu.cursor.default": "Cursor",
	"accessibilitymenu.cursor.readingGuide": "Reading Guide",
	"accessibilitymenu.cursor.readingMask": "Reading Mask",
	"accessibilitymenu.cursor.tooltip": "Click to adjust cursor to either stay on track while reading, or to highlight and focus on specific text.",
	"accessibilitymenu.lineheight.15x": "Line Height (1.5x)",
	"accessibilitymenu.lineheight.175x": "Line Height (1.75x)",
	"accessibilitymenu.lineheight.2x": "Line Height (2x)",
	"accessibilitymenu.lineheight.default": "Line Height",
	"accessibilitymenu.lineheight.tooltip": "Click to adjust different line heights.",
	"accessibilitymenu.linespacing.default": "Line Spacing",
	"accessibilitymenu.linespacing.heavy": "Heavy Spacing",
	"accessibilitymenu.linespacing.light": "Light Spacing",
	"accessibilitymenu.linespacing.moderate": "Moderate Spacing",
	"accessibilitymenu.linespacing.tooltip": "Click to adjust different line spacings.",
	"accessibilitymenu.textalignment.center": "Align Center",
	"accessibilitymenu.textalignment.default": "Text Align",
	"accessibilitymenu.textalignment.justify": "Justify",
	"accessibilitymenu.textalignment.left": "Align Left",
	"accessibilitymenu.textalignment.right": "Align Right",
	"accessibilitymenu.textalignment.tooltip": "Click to adjust different text aligments.",
	"accessibilitymenu.textsize.default": "Bigger Text",
	"accessibilitymenu.textsize.tooltip": "Click to adjust different text sizes.",
	"accessibilitymenu.title": "Reset All Accessibility Settings",
	"accessibilitymenu.tooltipleavedelay.default": "Tooltip Leave Delay",
	"accessibilitymenu.tooltipleavedelay.long": "Long Delay",
	"accessibilitymenu.tooltipleavedelay.moderate": "Moderate Delay",
	"accessibilitymenu.tooltipleavedelay.short": "Short Delay",
	"accessibilitymenu.tooltipleavedelay.tooltip": "Click to adjust different tooltip leave delays."
};

//#endregion
//#region src/i18n/fr.json
var fr_default = {
	accessibilitymenu: "Menu d’accessibilité (CTRL+U)",
	"accessibilitymenu.tooltip": "Ouvrir les paramètres d’accessibilité",
	"accessibilitymenu.animation.pause": "Mettre l’animation en pause",
	"accessibilitymenu.animation.play": "Lancer l’animation",
	"accessibilitymenu.animation.tooltip": "Basculer pour lancer ou mettre en pause les animations.",
	"accessibilitymenu.cursor.default": "Curseur",
	"accessibilitymenu.cursor.readingGuide": "Guide de lecture",
	"accessibilitymenu.cursor.readingMask": "Masque de lecture",
	"accessibilitymenu.cursor.tooltip": "Cliquez pour ajuster le curseur afin de rester sur la ligne pendant la lecture ou pour mettre en évidence et focaliser un texte spécifique.",
	"accessibilitymenu.lineheight.15x": "Hauteur de ligne (1,5x)",
	"accessibilitymenu.lineheight.175x": "Hauteur de ligne (1,75x)",
	"accessibilitymenu.lineheight.2x": "Hauteur de ligne (2x)",
	"accessibilitymenu.lineheight.default": "Hauteur de ligne",
	"accessibilitymenu.lineheight.tooltip": "Cliquez pour ajuster les différentes hauteurs de ligne.",
	"accessibilitymenu.linespacing.default": "Espacement des lignes",
	"accessibilitymenu.linespacing.heavy": "Espacement important",
	"accessibilitymenu.linespacing.light": "Espacement léger",
	"accessibilitymenu.linespacing.moderate": "Espacement modéré",
	"accessibilitymenu.linespacing.tooltip": "Cliquez pour ajuster les différents espacements de lignes.",
	"accessibilitymenu.textalignment.center": "Aligner au centre",
	"accessibilitymenu.textalignment.default": "Alignement du texte",
	"accessibilitymenu.textalignment.justify": "Justifier",
	"accessibilitymenu.textalignment.left": "Aligner à gauche",
	"accessibilitymenu.textalignment.right": "Aligner à droite",
	"accessibilitymenu.textalignment.tooltip": "Cliquez pour ajuster les différents alignements du texte.",
	"accessibilitymenu.textsize.default": "Texte plus grand",
	"accessibilitymenu.textsize.tooltip": "Cliquez pour ajuster les différentes tailles de texte.",
	"accessibilitymenu.title": "Réinitialiser tous les paramètres d’accessibilité",
	"accessibilitymenu.tooltipleavedelay.default": "Délai de fermeture de l’infobulle",
	"accessibilitymenu.tooltipleavedelay.long": "Délai long",
	"accessibilitymenu.tooltipleavedelay.moderate": "Délai modéré",
	"accessibilitymenu.tooltipleavedelay.short": "Délai court",
	"accessibilitymenu.tooltipleavedelay.tooltip": "Cliquez pour ajuster les différents délais de fermeture des infobulles."
};

//#endregion
//#region src/i18n/index.ts
function addTranslations(i18n) {
	i18n.addResourceBundle("en", MODULE_NAME, en_default);
	i18n.addResourceBundle("fr", MODULE_NAME, fr_default);
}

//#endregion
//#region src/components/AppAccessibilityReadingCursors.tsx
const AppAccessibilityReadingCursors = () => {
	const accessibilityStates = useAppAccessibilityStates();
	const mousePosition = useAppMousePosition();
	const theme = useTheme();
	if (accessibilityStates?.cursor === "readingMask") return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Box, {
		id: "ReadingMaskTopZone",
		sx: {
			position: "fixed !important",
			zIndex: "2147483647 !important",
			width: "100% !important",
			top: "0px !important",
			background: "rgba(0, 0, 0, 0.5) !important",
			height: `${mousePosition.y - 50}px`,
			borderBottom: "10px solid",
			borderBottomColor: theme.palette.info.main
		}
	}), /* @__PURE__ */ jsx(Box, {
		id: "ReadingMaskBottomZone",
		sx: {
			position: "fixed !important",
			zIndex: "2147483647 !important",
			width: "100% !important",
			bottom: "0px !important",
			background: "rgba(0, 0, 0, 0.5) !important",
			height: `${window.innerHeight - mousePosition.y - 50}px`,
			borderTop: "10px solid",
			borderTopColor: theme.palette.success.main
		}
	})] });
	else if (accessibilityStates?.cursor === "readingGuide") return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Box, {
		id: "ReadingGuideTopArrow",
		sx: {
			position: "fixed !important",
			zIndex: "2147483647 !important",
			top: `calc(${mousePosition.y}px - 1.5rem) !important`,
			left: `calc(${mousePosition.x}px - 0.5rem) !important`,
			width: "0.75rem",
			height: "0.75rem",
			backgroundColor: theme.palette.text.primary,
			borderLeft: "2px solid",
			borderTop: "2px solid",
			borderColor: theme.palette.warning.main,
			transform: "rotate(45deg)"
		}
	}), /* @__PURE__ */ jsx(Box, {
		id: "ReadingGuideBarBottom",
		sx: {
			position: "fixed !important",
			zIndex: "2147483646 !important",
			top: `calc(${mousePosition.y}px - 1.15rem) !important`,
			left: `calc(${mousePosition.x}px - 10rem) !important`,
			width: "20rem",
			height: "0.75rem",
			backgroundColor: theme.palette.text.primary,
			border: "2px solid",
			borderColor: theme.palette.warning.main
		}
	})] });
	return null;
};

//#endregion
//#region src/providers/AppAccessibilityProvider.tsx
const AppAccessibilityThemeComponent = ({ children }) => {
	const themeOptions = useAccessibilityThemeBuilder();
	const { setOptionsOverride } = useAppTheme();
	useEffect(() => {
		setOptionsOverride(themeOptions);
	}, [themeOptions, setOptionsOverride]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [children, /* @__PURE__ */ jsx(AppAccessibilityReadingCursors, {})] });
};
const AppAccessibilityProvider = ({ children, preferences, features }) => {
	const [textSize, setTextSize] = useState("default");
	const [textSpacing, setTextSpacing] = useState("default");
	const [textAlign, setTextAlign] = useState("default");
	const [lineHeight, setLineHeight] = useState("default");
	const [cursor, setCursor] = useState("default");
	const [animation, setAnimation] = useState("play");
	const [tooltipLeaveDelay, setTooltipLeaveDelay] = useState("default");
	const nextTextSize = useCallback(() => {
		switch (textSize) {
			case "default":
				setTextSize("sm");
				break;
			case "sm":
				setTextSize("md");
				break;
			case "md":
				setTextSize("lg");
				break;
			case "lg":
				setTextSize("default");
				break;
		}
	}, [textSize]);
	const getTextSize = useCallback(() => {
		switch (textSize) {
			case "default": return null;
			case "sm": return 18;
			case "md": return 20;
			case "lg": return 22;
		}
	}, [textSize]);
	const nextTextSpacing = useCallback(() => {
		switch (textSpacing) {
			case "default":
				setTextSpacing("light");
				break;
			case "light":
				setTextSpacing("moderate");
				break;
			case "moderate":
				setTextSpacing("heavy");
				break;
			case "heavy":
				setTextSpacing("default");
				break;
		}
	}, [textSpacing]);
	const getTextSpacing = useCallback(() => {
		switch (textSpacing) {
			case "default": return null;
			case "light": return "2px";
			case "moderate": return "4px";
			case "heavy": return "8px";
		}
	}, [textSpacing]);
	const nextTextAlign = useCallback(() => {
		switch (textAlign) {
			case "default":
				setTextAlign("alignLeft");
				break;
			case "alignLeft":
				setTextAlign("alignRight");
				break;
			case "alignRight":
				setTextAlign("alignCenter");
				break;
			case "alignCenter":
				setTextAlign("justified");
				break;
			case "justified":
				setTextAlign("default");
				break;
		}
	}, [textAlign]);
	const getTextAlign = useCallback(() => {
		switch (textAlign) {
			case "default": return null;
			case "alignLeft": return "left";
			case "alignRight": return "right";
			case "alignCenter": return "center";
			case "justified": return "justify";
		}
	}, [textAlign]);
	const nextLineHeight = useCallback(() => {
		switch (lineHeight) {
			case "default":
				setLineHeight("1.5x");
				break;
			case "1.5x":
				setLineHeight("1.75x");
				break;
			case "1.75x":
				setLineHeight("2x");
				break;
			case "2x":
				setLineHeight("default");
				break;
		}
	}, [lineHeight]);
	const getLineHeight = useCallback(() => {
		switch (lineHeight) {
			case "default": return null;
			case "1.5x": return "1.5";
			case "1.75x": return "1.75";
			case "2x": return "2";
		}
	}, [lineHeight]);
	const nextCursor = useCallback(() => {
		switch (cursor) {
			case "default":
				setCursor("readingGuide");
				break;
			case "readingGuide":
				setCursor("readingMask");
				break;
			case "readingMask":
				setCursor("default");
				break;
		}
	}, [cursor]);
	const toggleAnimation = useCallback(() => setAnimation((_state) => _state === "play" ? "pause" : "play"), []);
	const nextTooltipLeaveDelay = useCallback(() => {
		switch (tooltipLeaveDelay) {
			case "default":
				setTooltipLeaveDelay("short");
				break;
			case "short":
				setTooltipLeaveDelay("moderate");
				break;
			case "moderate":
				setTooltipLeaveDelay("long");
				break;
			case "long":
				setTooltipLeaveDelay("default");
				break;
		}
	}, [tooltipLeaveDelay]);
	const getTooltipLeaveDelay = useCallback(() => {
		switch (tooltipLeaveDelay) {
			case "default": return 0;
			case "short": return 200;
			case "moderate": return 500;
			case "long": return 1e3;
		}
	}, [tooltipLeaveDelay]);
	const resetToDefault = useCallback(() => {
		setTextSize("default");
		setTextSpacing("default");
		setTextAlign("default");
		setLineHeight("default");
		setCursor("default");
		setAnimation("play");
		setTooltipLeaveDelay("default");
	}, []);
	const context = useMemo(() => {
		return {
			initialized: true,
			preferences,
			features,
			states: {
				textSize,
				textSpacing,
				textAlign,
				lineHeight,
				cursor,
				animation,
				tooltipLeaveDelay,
				nextTextSize,
				nextTextSpacing,
				nextTextAlign,
				nextLineHeight,
				nextCursor,
				toggleAnimation,
				resetToDefault,
				getTextSize,
				getTextAlign,
				getLineHeight,
				getTextSpacing,
				nextTooltipLeaveDelay,
				getTooltipLeaveDelay
			}
		};
	}, [
		preferences,
		features,
		textSize,
		textSpacing,
		textAlign,
		lineHeight,
		cursor,
		animation,
		tooltipLeaveDelay,
		nextTextSize,
		nextTextSpacing,
		nextTextAlign,
		nextLineHeight,
		nextCursor,
		toggleAnimation,
		resetToDefault,
		getTextSize,
		getTextAlign,
		getLineHeight,
		getTextSpacing,
		nextTooltipLeaveDelay,
		getTooltipLeaveDelay
	]);
	return /* @__PURE__ */ jsx(AppAccessibilityContext.Provider, {
		value: context,
		children: /* @__PURE__ */ jsx(AppAccessibilityThemeComponent, { children })
	});
};

//#endregion
export { AppAccessibilityProvider, AppDrawerAccessibilityIconButton, MODULE_NAME, addTranslations, buildThemeOverride, useAppAccessibilityContext, useAppAccessibilityFeatures, useAppAccessibilityPreferences, useAppAccessibilityStates, useAppKeyboardShortcut, useAppMousePosition };
//# sourceMappingURL=index.js.map