import { Backdrop, Box, ClickAwayListener, IconButton, Paper, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Close, DoubleArrow } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

//#region src/providers/AppDrawerProvider.tsx
const AppDrawerContext = createContext(null);
const AppDrawerElementContext = createContext(null);
const AppDrawerProvider = ({ children }) => {
	const [state, setState] = useState({
		open: false,
		floatThreshold: 1600,
		expandable: true
	});
	const [element, setElement] = useState(null);
	const [maximized, setMaximized] = useState(false);
	const [mode, setMode] = useState("float");
	const isFloatThreshold = useMediaQuery(`(max-width: ${state.floatThreshold}px)`);
	const open = useCallback((props) => {
		const { element: newElement, mode: newMode,...newProps } = props;
		setState((_state) => ({
			..._state,
			...newProps,
			open: true
		}));
		setElement(newElement);
		setMode((_mode) => newMode || _mode);
	}, []);
	const close = useCallback(() => {
		setState((_state) => {
			if (_state?.onClose) _state?.onClose();
			return {
				..._state,
				open: false
			};
		});
		setMaximized(false);
	}, []);
	const drawerContextValue = useMemo(() => ({
		mode,
		maximized,
		isFloatThreshold,
		id: state.id,
		width: state.width,
		isOpen: state.open,
		enableClickAway: state.enableClickAway !== void 0 ? state.enableClickAway : mode === "float",
		expandable: !!state.expandable,
		toolbar: state.toolbar,
		open,
		close,
		setWidth: (width) => setState((_state) => ({
			..._state,
			width
		})),
		setMode,
		setMaximized,
		setElement
	}), [
		mode,
		maximized,
		isFloatThreshold,
		state.id,
		state.width,
		state.open,
		state.enableClickAway,
		state.expandable,
		state.toolbar,
		open,
		close
	]);
	return /* @__PURE__ */ jsx(AppDrawerContext.Provider, {
		value: drawerContextValue,
		children: /* @__PURE__ */ jsx(AppDrawerElementContext.Provider, {
			value: element,
			children
		})
	});
};

//#endregion
//#region src/hooks/useAppDrawer.tsx
function useAppDrawer() {
	return useContext(AppDrawerContext);
}

//#endregion
//#region src/hooks/useDrawerWidth.tsx
const useDrawerWidth = () => {
	const drawer = useAppDrawer();
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));
	const isSm = useMediaQuery(theme.breakpoints.only("sm"));
	const isMd = useMediaQuery(theme.breakpoints.only("md"));
	const isLg = useMediaQuery(theme.breakpoints.only("lg"));
	const isXl = useMediaQuery(theme.breakpoints.only("xl"));
	const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const handler = () => setWindowWidth(window.innerWidth);
		window.addEventListener("resize", handler);
		return () => window.removeEventListener("resize", handler);
	}, []);
	return useMemo(() => {
		const clamp = (min, value, max) => Math.min(max, Math.max(min, value));
		const desktopMaxWidth = Math.max(320, windowWidth - 96);
		const maximizedWidth = Math.min(windowWidth * .85, windowWidth - 32);
		let minimizedWidth = 300;
		if (isXs || isSm) return {
			maximizedWidth: windowWidth,
			minimizedWidth: windowWidth
		};
		if (drawer.width) minimizedWidth = drawer.width;
		else if (isMd) minimizedWidth = Math.min(550, desktopMaxWidth);
		else if (isLg) minimizedWidth = Math.min(clamp(600, windowWidth * .42, 680), desktopMaxWidth);
		else if (isXl) minimizedWidth = Math.min(clamp(680, windowWidth * .45, 760), desktopMaxWidth);
		return {
			maximizedWidth,
			minimizedWidth
		};
	}, [
		windowWidth,
		drawer.width,
		isLg,
		isMd,
		isSm,
		isXl,
		isXs
	]);
};

//#endregion
//#region src/name.ts
const MODULE_NAME = "tui.drawer";

//#endregion
//#region src/elements/AppDrawer.tsx
const AppDrawer = () => {
	const theme = useTheme();
	const drawer = useAppDrawer();
	const drawerElement = useContext(AppDrawerElementContext);
	const { maximizedWidth, minimizedWidth } = useDrawerWidth();
	const drawerWidth = drawer.maximized ? maximizedWidth : minimizedWidth;
	const isMdDown = useMediaQuery(theme.breakpoints.down("md"));
	const { t } = useTranslation(MODULE_NAME);
	const [visible, setVisible] = useState(false);
	const onClickAway = useCallback(() => {
		if (drawer.enableClickAway) drawer.close();
	}, [drawer]);
	useEffect(() => {
		if (drawer.isOpen) setVisible(true);
		else if (visible) {
			const timer = setTimeout(() => setVisible(false), theme.transitions.duration.enteringScreen);
			return () => clearTimeout(timer);
		}
	}, [drawer.isOpen]);
	return /* @__PURE__ */ jsx(Box, {
		className: "tui-appdrawer",
		sx: {
			position: "fixed",
			zIndex: theme.zIndex.drawer + 2,
			top: 0,
			right: 0,
			bottom: 0,
			overflow: "hidden",
			width: drawerWidth,
			transform: drawer.isOpen ? "translateX(0)" : `translateX(${drawerWidth}px)`,
			transition: theme.transitions.create(["transform", "width"], {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.enteringScreen
			})
		},
		children: visible && /* @__PURE__ */ jsx(ClickAwayListener, {
			onClickAway,
			children: /* @__PURE__ */ jsxs(Paper, {
				elevation: 2,
				sx: {
					display: "flex",
					flexDirection: "column",
					height: "100%",
					width: "100%",
					borderTopRightRadius: 0,
					borderBottomRightRadius: 0
				},
				children: [/* @__PURE__ */ jsxs(Stack, {
					direction: "row",
					alignItems: "center",
					spacing: 1,
					m: 1,
					children: [
						!isMdDown && drawer.expandable && /* @__PURE__ */ jsx(Tooltip, {
							title: t(drawer.maximized ? "button.restore.tooltip" : "button.maximize.tooltip"),
							placement: "top",
							children: /* @__PURE__ */ jsx(IconButton, {
								onClick: () => drawer.setMaximized(!drawer.maximized),
								"aria-label": t(drawer.maximized ? "button.restore.tooltip" : "button.maximize.tooltip"),
								children: /* @__PURE__ */ jsx(DoubleArrow, { sx: { transform: !drawer.maximized && "rotate(180deg)" } })
							})
						}),
						/* @__PURE__ */ jsx(Stack, {
							direction: "row",
							alignItems: "center",
							spacing: 1,
							children: drawer.toolbar?.slots?.left
						}),
						/* @__PURE__ */ jsx(Box, { flex: 1 }),
						/* @__PURE__ */ jsxs(Stack, {
							direction: "row",
							alignItems: "center",
							spacing: 1,
							children: [drawer.toolbar?.slots?.right, /* @__PURE__ */ jsx(Tooltip, {
								title: t("button.close.tooltip"),
								placement: "top",
								children: /* @__PURE__ */ jsx(IconButton, {
									onClick: drawer.toolbar?.onCloseClick ?? drawer.close,
									"aria-label": t("button.close.tooltip"),
									children: /* @__PURE__ */ jsx(Close, {})
								})
							})]
						})
					]
				}), /* @__PURE__ */ jsx(Box, {
					sx: {
						flexGrow: 1,
						overflow: "auto",
						width: "100%"
					},
					children: drawerElement
				})]
			})
		})
	});
};

//#endregion
//#region src/elements/AppDrawerContainer.tsx
const AppDrawerContainer = ({ children }) => {
	const theme = useTheme();
	const drawer = useAppDrawer();
	const { minimizedWidth } = useDrawerWidth();
	const isFloating = drawer.mode === "float" || drawer.isFloatThreshold;
	return /* @__PURE__ */ jsxs("div", {
		id: "drawer.container.root",
		style: {
			position: "relative",
			display: "flex",
			flexDirection: "row",
			height: "100%"
		},
		children: [/* @__PURE__ */ jsx("div", {
			style: {
				flex: 1,
				overflow: "auto"
			},
			children
		}), /* @__PURE__ */ jsxs("div", {
			style: {
				height: "100%",
				width: drawer.isOpen && !isFloating ? minimizedWidth : 0,
				transition: theme.transitions.create("width", {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.enteringScreen
				})
			},
			children: [drawer.isOpen && (drawer.isFloatThreshold || drawer.maximized || isFloating) && /* @__PURE__ */ jsx(Backdrop, {
				open: true,
				sx: { zIndex: theme.zIndex.drawer + 1 }
			}), /* @__PURE__ */ jsx(AppDrawer, {})]
		})]
	});
};

//#endregion
//#region src/i18n/en.json
var en_default = {
	"button.maximize.tooltip": "Maximize drawer",
	"button.restore.tooltip": "Restore drawer",
	"button.close.tooltip": "Close drawer"
};

//#endregion
//#region src/i18n/fr.json
var fr_default = {
	"button.maximize.tooltip": "Agrandir le tiroir",
	"button.restore.tooltip": "Restaurer le tiroir",
	"button.close.tooltip": "Fermer le tiroir"
};

//#endregion
//#region src/i18n/index.ts
function addTranslations(i18n) {
	i18n.addResourceBundle("en", MODULE_NAME, en_default);
	i18n.addResourceBundle("fr", MODULE_NAME, fr_default);
}

//#endregion
export { AppDrawerContainer, AppDrawerContext, AppDrawerElementContext, AppDrawerProvider, addTranslations, useAppDrawer };
//# sourceMappingURL=index.js.map