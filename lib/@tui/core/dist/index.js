import { createContext, createElement, forwardRef, memo, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { create, useStore } from "zustand";
import "i18next";
import Cookies from "js-cookie";
import { parse } from "cookie";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AppBar, Avatar, Box, Breadcrumbs, Button, Card, Chip, CircularProgress, ClickAwayListener, Collapse, CssBaseline, Dialog, DialogContent, DialogTitle, Divider, Drawer, Fade, FormControl, IconButton, InputAdornment, InputBase, InputLabel, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, MenuItem, MenuList, Paper, Popper, Select, Skeleton, Slide, SnackbarContent, Stack, Switch, ThemeProvider, Toolbar, Tooltip, Typography, colors, createTheme, emphasize, styled, useMediaQuery, useScrollTrigger, useTheme } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { cloneDeep, merge } from "lodash-es";
import { Apps, Bolt, ChevronRight, Circle, Clear, Close, DarkMode, DragIndicator, Error as Error$1, Fullscreen, FullscreenExit, Info, KeyboardCommandKey, Language, Menu, Search, Tune, TurnRight, ZoomInMap, ZoomOutMap } from "@mui/icons-material";
import { alpha, darken, getOverlayAlpha, lighten } from "@mui/material/styles";
import { SnackbarProvider, useSnackbar } from "notistack";

//#region src/app/AppDefaults.ts
const AppDefaultsCookieConfigs = {
	theme: "theme.tui.default",
	mode: "dark",
	layout: "side",
	density: "comfortable",
	drawerOpen: true,
	autoHideAppbar: false,
	showBreadcrumbs: true,
	showQuickSearch: true
};
const AppDefaultsPreferencesConfigs = {
	brand: void 0,
	appLink: "/",
	allowAutoHideTopbar: true,
	allowBreadcrumbs: true,
	allowQuickSearch: true,
	allowReset: true,
	allowLayoutSelection: true,
	allowThemeSelection: true,
	allowTranslate: true,
	allowDensitySelection: true
};
const AppDefaultsLeftNavConfigs = { width: 240 };
const AppDefaultsTopNavConfigs = {
	themeSelectionMode: "profile",
	quickSearchURI: "/search/",
	quickSearchParam: "q"
};
const AppDefaultsThemeConfigs = {};

//#endregion
//#region src/app/AppContexts.ts
const AppContext = createContext({
	initialized: false,
	preferences: null,
	router: null
});
const AppLayoutContext = createContext({
	initialized: false,
	ready: false,
	current: "side",
	mode: "side",
	toggle: () => {},
	setReady: () => {},
	setFocus: () => {},
	hideMenus: () => {},
	showMenus: () => {}
});
const AppBarContext = createContext({
	initialized: false,
	show: true,
	autoHide: false,
	setShow: () => {},
	setAutoHide: () => {},
	toggleAutoHide: () => {}
});
const AppBreadcrumbsContext = createContext({
	initialized: false,
	show: true,
	items: [],
	setItems: () => {},
	toggle: () => {},
	history: []
});
const AppLeftNavContext = createContext({
	initialized: false,
	menus: [],
	open: false,
	setOpen: () => {},
	toggle: () => {},
	toggleMenu: () => {},
	closeMenu: () => {},
	openMenu: () => {},
	updateMenu: () => {},
	collapseMenus: () => {},
	expandMenus: () => {},
	setMenus: () => {}
});
const AppQuickSearchContext = createContext({
	initialized: false,
	show: false,
	setShow: () => {},
	toggle: () => {}
});
const AppSearchServiceContext = createContext({
	initialized: false,
	provided: false,
	service: null,
	state: {
		searching: false,
		menu: false,
		mode: "inline",
		items: [],
		set: () => {}
	}
});

//#endregion
//#region src/cookies/client.ts
const parseTuiClientCookies = (defaults) => {
	return parseTuiCookies(Cookies.get(), defaults);
};
const setClientCookie = (key, value) => {
	Cookies.set(key, value, TUI_COOKIE_OPTIONS);
};

//#endregion
//#region src/cookies/server.ts
const parseExtraServerCookie = (request, ...entry) => {
	if (request.headers.get("cookie")) return parseCookies(parse(request.headers.get("cookie")), ...entry);
	return {};
};
const parseTuiServerCookies = (request, defaults) => {
	const cookies = request.headers.get("cookie");
	return parseTuiCookies(cookies ? parse(cookies) : {}, defaults);
};

//#endregion
//#region src/cookies/index.ts
const TUI_COOKIE_OPTIONS = {
	path: "/",
	expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
};
const TUI_COOKIE_KEYS = [
	"tui.lang",
	"tui.theme",
	"tui.mode",
	"tui.layout",
	"tui.density",
	"tui.drawerOpen",
	"tui.autoHideAppbar",
	"tui.showQuickSearch",
	"tui.showBreadcrumbs"
];
const defaultValue = (appDefault, tuiDefault) => {
	return appDefault !== void 0 ? appDefault : tuiDefault;
};
const parseTuiCookies = (cookies, defaults) => {
	return parseCookies(cookies, {
		key: "tui.lang",
		name: "lang",
		type: "string"
	}, {
		key: "tui.theme",
		name: "theme",
		default: defaultValue(defaults?.theme, AppDefaultsCookieConfigs.theme)
	}, {
		key: "tui.mode",
		name: "mode",
		default: defaultValue(defaults?.mode, AppDefaultsCookieConfigs.mode)
	}, {
		key: "tui.layout",
		name: "layout",
		default: defaultValue(defaults?.layout, AppDefaultsCookieConfigs.layout)
	}, {
		key: "tui.drawerOpen",
		name: "drawerOpen",
		type: "boolean",
		default: defaultValue(defaults?.drawerOpen, AppDefaultsCookieConfigs.drawerOpen)
	}, {
		key: "tui.autoHideAppbar",
		name: "autoHideAppbar",
		type: "boolean",
		default: defaultValue(defaults?.autoHideAppbar, AppDefaultsCookieConfigs.autoHideAppbar)
	}, {
		key: "tui.showQuickSearch",
		name: "showQuickSearch",
		type: "boolean",
		default: defaultValue(defaults?.showQuickSearch, AppDefaultsCookieConfigs.showQuickSearch)
	}, {
		key: "tui.showBreadcrumbs",
		name: "showBreadcrumbs",
		type: "boolean",
		default: defaultValue(defaults?.showBreadcrumbs, AppDefaultsCookieConfigs.showBreadcrumbs)
	}, {
		key: "tui.density",
		name: "density",
		default: defaultValue(defaults?.density, AppDefaultsCookieConfigs.density)
	});
};
const parseCookies = (cookies, ...include) => {
	return include.reduce((_cookies, _entry) => {
		const cookie = cookies[_entry.key] || _entry.default;
		if (cookie !== void 0) if (_entry.type === "json") try {
			_cookies[_entry.name] = JSON.parse(cookie);
		} catch (error) {
			console.error(`Failed to parse cookie ${_entry.key} as JSON:`, error);
			_cookies[_entry.name] = _entry.default;
		}
		else if (_entry.type === "boolean") _cookies[_entry.name] = typeof cookie === "boolean" ? cookie : cookie === "true";
		else _cookies[_entry.name] = cookie;
		return _cookies;
	}, {});
};

//#endregion
//#region src/app/providers/AppCookiesProvider.tsx
const createCookieStore = (cookies, _i18n) => {
	const store = create((set) => {
		return {
			...cookies,
			initialized: true,
			setTheme: (newTheme) => {
				setClientCookie("tui.theme", newTheme);
				set({ theme: newTheme });
			},
			setMode: (newMode) => {
				setClientCookie("tui.mode", newMode);
				set({ mode: newMode });
			},
			setLang: (newLang) => {
				_i18n.changeLanguage(newLang);
				set({ lang: newLang });
			},
			setLayout: (newLayout) => {
				setClientCookie("tui.layout", newLayout);
				set({ layout: newLayout });
			},
			setAutoHideAppbar: (auto) => {
				setClientCookie("tui.autoHideAppbar", `${auto}`);
				set({ autoHideAppbar: auto });
			},
			setDrawerOpen: (open$1) => {
				setClientCookie("tui.drawerOpen", `${open$1}`);
				set({ drawerOpen: open$1 });
			},
			setShowQuickSearch: (show) => {
				setClientCookie("tui.showQuickSearch", `${show}`);
				set({ showQuickSearch: show });
			},
			setShowBreadcrumbs: (show) => {
				setClientCookie("tui.showBreadcrumbs", `${show}`);
				set({ showBreadcrumbs: show });
			},
			setDensity: (newDensity) => {
				setClientCookie("tui.density", newDensity);
				set({ density: newDensity });
			},
			reset: () => {
				for (const key of TUI_COOKIE_KEYS) {
					const cookieValue = cookies[key.split(".")[1]];
					setClientCookie(key, `${cookieValue}`);
					if (key === "tui.lang") _i18n.changeLanguage(cookieValue);
				}
				set({ ...cookies });
			}
		};
	});
	if (cookies.lang !== _i18n.language) _i18n.changeLanguage(cookies.lang);
	return store;
};
const AppCookiesContext = createContext(void 0);
const AppCookiesProvider = ({ cookies, i18n: i18n$1, children }) => {
	const store = useMemo(() => {
		return createCookieStore(cookies, i18n$1);
	}, [cookies, i18n$1]);
	return /* @__PURE__ */ jsx(AppCookiesContext.Provider, {
		value: store,
		children
	});
};

//#endregion
//#region src/cookies/hooks/useCookiesStore.tsx
const useCookiesStore = (selector) => {
	return useStore(useContext(AppCookiesContext), selector);
};

//#endregion
//#region src/app/hooks/useAppBar.tsx
function useAppBar() {
	return useContext(AppBarContext);
}

//#endregion
//#region src/app/hooks/useAppBarHeight.tsx
const APPBAR_READY_EVENT = "tui.event.appbar.ready";
function useAppBarHeight() {
	const [height, setHeight] = useState(-1);
	const updateHeight = () => {
		const appbar = document.getElementById("appbar");
		if (appbar) setHeight(appbar.getBoundingClientRect().height);
	};
	useLayoutEffect(() => {
		updateHeight();
		window.addEventListener("resize", updateHeight);
		window.addEventListener(APPBAR_READY_EVENT, updateHeight);
		return () => {
			window.removeEventListener("resize", updateHeight);
			window.removeEventListener(APPBAR_READY_EVENT, updateHeight);
		};
	}, []);
	return height;
}

//#endregion
//#region src/app/hooks/useAppBarScrollTrigger.tsx
function useAppBarScrollTrigger() {
	return useScrollTrigger({
		disableHysteresis: true,
		threshold: 0
	});
}

//#endregion
//#region src/app/hooks/useAppPreferences.tsx
const useAppPreferences = () => {
	const { preferences } = useContext(AppContext);
	return useMemo(() => {
		const _configs = { preferences: {
			...AppDefaultsPreferencesConfigs,
			...preferences || {},
			topnav: {
				...AppDefaultsTopNavConfigs,
				...preferences?.topnav || {}
			},
			leftnav: {
				...AppDefaultsLeftNavConfigs,
				...preferences?.leftnav || {}
			}
		} };
		return {
			allowPersonalization: _configs.preferences.allowAutoHideTopbar || _configs.preferences.allowBreadcrumbs || _configs.preferences.allowQuickSearch || _configs.preferences.allowReset || _configs.preferences.allowThemeSelection || _configs.preferences.allowLayoutSelection,
			..._configs.preferences
		};
	}, [preferences]);
};

//#endregion
//#region src/app/hooks/useAppBrand.tsx
const BRAND_VARIANTS = [
	"app",
	"logo",
	"name",
	"banner-vertical",
	"banner-horizontal"
];
const getBrandSizes = (theme, size) => {
	return {
		app: {
			divider: { margin: theme.spacing(1.5) },
			name: { height: theme.spacing(3) },
			icon: {
				width: theme.spacing(5),
				height: theme.spacing(5)
			},
			text: { fontSize: theme.spacing(3) }
		},
		xlarge: {
			divider: { margin: theme.spacing(1.25) },
			name: { height: theme.spacing(11.75) },
			icon: {
				width: theme.spacing(18.75),
				height: theme.spacing(18.75)
			},
			text: { fontSize: theme.spacing(11.75) }
		},
		large: {
			divider: { margin: theme.spacing(1) },
			name: { height: theme.spacing(7.875) },
			icon: {
				width: theme.spacing(12.5),
				height: theme.spacing(12.5)
			},
			text: { fontSize: theme.spacing(7.875) }
		},
		medium: {
			divider: { margin: theme.spacing(.75) },
			name: { height: theme.spacing(4.625) },
			icon: {
				width: theme.spacing(7.5),
				height: theme.spacing(7.5)
			},
			text: { fontSize: theme.spacing(4.625) }
		},
		small: {
			divider: { margin: theme.spacing(.5) },
			name: { height: theme.spacing(3) },
			icon: {
				width: theme.spacing(5),
				height: theme.spacing(5)
			},
			text: { fontSize: theme.spacing(3) }
		},
		xsmall: {
			divider: { margin: theme.spacing(.25) },
			name: { height: theme.spacing(1.875) },
			icon: {
				width: theme.spacing(3),
				height: theme.spacing(3)
			},
			text: { fontSize: theme.spacing(1.875) }
		}
	}[size];
};
const useAppBrand = (props) => {
	const theme = useTheme();
	const { brand } = useAppPreferences();
	const variant = props?.variant || "app";
	const size = props?.size || "small";
	const sizes = useMemo(() => getBrandSizes(theme, size), [theme, size]);
	return useMemo(() => {
		if (!brand) return null;
		return {
			brand,
			variant,
			size,
			sizes
		};
	}, [
		brand,
		variant,
		size,
		sizes
	]);
};

//#endregion
//#region src/app/hooks/useAppBreadcrumbs.tsx
const useAppBreadcrumbs = () => {
	return useContext(AppBreadcrumbsContext);
};

//#endregion
//#region src/app/hooks/useAppDensity.tsx
const useAppDensity = () => {
	return {
		density: useCookiesStore((state) => state.density),
		setDensity: useCookiesStore((state) => state.setDensity)
	};
};

//#endregion
//#region src/name.ts
const MODULE_NAME = "tui.core";

//#endregion
//#region src/app/hooks/useAppLanguage.tsx
const useAppLanguage = (onChange) => {
	const lang = useCookiesStore((state) => state.lang);
	const setLang = useCookiesStore((state) => state.setLang);
	const { i18n: i18n$1 } = useTranslation(MODULE_NAME);
	const toggle = useCallback(() => {
		setLang(lang === "en" ? "fr" : "en");
	}, [lang, setLang]);
	useEffect(() => {
		if (onChange) i18n$1.on("languageChanged", onChange);
		return () => {
			if (onChange) i18n$1.off("languageChanged", onChange);
		};
	}, [i18n$1, onChange]);
	return useMemo(() => ({
		isFR: () => lang === "fr",
		isEN: () => lang === "en",
		toggle
	}), [lang, toggle]);
};

//#endregion
//#region src/app/hooks/useAppLayout.tsx
const useAppLayout = () => {
	return useContext(AppLayoutContext);
};

//#endregion
//#region src/app/hooks/useAppLeftNav.tsx
const useAppLeftNav = () => {
	return useContext(AppLeftNavContext);
};

//#endregion
//#region src/app/hooks/useAppLogo.tsx
const useAppLogo = () => {
	const { palette } = useTheme();
	const { brand } = useAppPreferences();
	return useMemo(() => brand ? palette.mode === "dark" ? brand.logo.dark : brand.logo.light : void 0, [brand, palette.mode]);
};

//#endregion
//#region src/app/hooks/useAppQuickSearch.tsx
const useAppQuickSearch = () => {
	return useContext(AppQuickSearchContext);
};

//#endregion
//#region src/app/hooks/useAppRouter.tsx
const useAppRouter = () => {
	const { router } = useContext(AppContext);
	return router;
};

//#endregion
//#region src/app/hooks/useAppSearchService.tsx
const useAppSearchService = () => {
	return useContext(AppSearchServiceContext);
};

//#endregion
//#region src/themes/density.ts
const SPACING_FACTOR = {
	comfortable: 8,
	compact: 6,
	dense: 4
};
const getDensityThemeOverrides = (density) => {
	if (density === "comfortable") return {};
	const isCompact = density === "compact";
	const size = "small";
	return {
		spacing: SPACING_FACTOR[density],
		typography: {
			fontSize: isCompact ? 13 : 12,
			body1: { fontSize: isCompact ? "0.875rem" : "0.8125rem" },
			body2: { fontSize: isCompact ? "0.8125rem" : "0.75rem" }
		},
		components: {
			MuiTableCell: { styleOverrides: { root: { padding: isCompact ? "4px 8px" : "2px 6px" } } },
			MuiButton: { defaultProps: { size } },
			MuiIconButton: { defaultProps: { size } },
			MuiFab: { defaultProps: { size } },
			MuiTextField: { defaultProps: {
				size,
				margin: "dense"
			} },
			MuiSelect: { defaultProps: {
				size,
				margin: "dense"
			} },
			MuiAutocomplete: { defaultProps: { size } },
			MuiInputBase: { defaultProps: { margin: "dense" } },
			MuiFormControl: { defaultProps: {
				size,
				margin: "dense"
			} },
			MuiList: { defaultProps: { dense: true } },
			MuiListItem: { defaultProps: { dense: true } },
			MuiMenuItem: { defaultProps: { dense: true } },
			MuiListItemIcon: { styleOverrides: { root: { minWidth: isCompact ? 48 : 40 } } },
			MuiListItemButton: { styleOverrides: { root: { minHeight: isCompact ? 40 : 32 } } },
			MuiCardContent: { styleOverrides: { root: {
				padding: isCompact ? "12px" : "8px",
				"&:last-child": { paddingBottom: isCompact ? "12px" : "8px" }
			} } },
			MuiCardHeader: { styleOverrides: { root: { padding: isCompact ? "12px" : "8px" } } },
			MuiToolbar: { defaultProps: { variant: "dense" } },
			MuiChip: { defaultProps: { size } },
			MuiAvatar: { styleOverrides: { root: {
				width: isCompact ? 32 : 28,
				height: isCompact ? 32 : 28
			} } },
			MuiTab: { styleOverrides: { root: {
				minHeight: isCompact ? 40 : 36,
				padding: isCompact ? "6px 12px" : "4px 8px"
			} } },
			MuiAccordionSummary: { styleOverrides: {
				root: { minHeight: isCompact ? 40 : 36 },
				content: { margin: isCompact ? "8px 0" : "4px 0" }
			} }
		}
	};
};

//#endregion
//#region src/themes/hooks/useAppThemeBuilder.tsx
const BASE_THEME_CONFIG = {
	zIndex: { tui: { superOverlay: 2e3 } },
	components: {
		MuiCssBaseline: { styleOverrides: {
			html: {
				width: "100%",
				height: "100%"
			},
			body: {
				width: "100%",
				height: "100%"
			},
			"#root": {
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0
			}
		} },
		MuiDrawer: { styleOverrides: { paper: { borderRightColor: "transparent" } } }
	}
};
const useAppThemeBuilder = () => {
	return useCallback((theme, optionsOverride, density = "comfortable") => {
		const baseConfigs = cloneDeep(BASE_THEME_CONFIG);
		const densityOverrides = getDensityThemeOverrides(density);
		const { light, dark, global } = cloneDeep(theme.configs);
		const { light: lightOverrides, dark: darkOverrides, global: globalOverrides } = cloneDeep(optionsOverride) || {};
		return {
			lightTheme: createTheme(merge({}, baseConfigs, densityOverrides, global || null, globalOverrides || null, light || null, lightOverrides || null)),
			darkTheme: createTheme(merge({}, baseConfigs, densityOverrides, global || null, globalOverrides || null, dark || null, darkOverrides || null))
		};
	}, []);
};

//#endregion
//#region src/app/providers/AppThemesProvider.tsx
const TuiThemesContext = createContext({
	initialized: false,
	current: null,
	mode: null,
	themes: null,
	optionsOverride: null,
	setTheme: () => null,
	setOptionsOverride: () => null,
	toggleMode: () => null
});
const AppThemesProvider = ({ initTheme, themes, children }) => {
	const themeCookie = useCookiesStore((state) => state.theme);
	const modeCookie = useCookiesStore((state) => state.mode);
	const densityCookie = useCookiesStore((state) => state.density);
	const setModeCookie = useCookiesStore((state) => state.setMode);
	const setThemeCookie = useCookiesStore((state) => state.setTheme);
	const themeBuilder = useAppThemeBuilder();
	const [optionsOverride, setOptionsOverride] = useState();
	const current = useMemo(() => {
		const selectedTheme = themes.find((t) => t.id === themeCookie);
		if (selectedTheme) return selectedTheme;
		const defaultTheme = themes.find((t) => t.default);
		if (defaultTheme) return defaultTheme;
		if (themes?.length > 0) return themes[0];
		if (initTheme) return initTheme;
		throw Error("******* No themes found. *******");
	}, [
		initTheme,
		themes,
		themeCookie
	]);
	const { lightTheme, darkTheme } = useMemo(() => themeBuilder(current, optionsOverride, densityCookie), [
		themeBuilder,
		current,
		optionsOverride,
		densityCookie
	]);
	const theme = useMemo(() => {
		if (modeCookie === "dark") return darkTheme;
		else if (modeCookie === "light") return lightTheme;
		else return darkTheme;
	}, [
		darkTheme,
		lightTheme,
		modeCookie
	]);
	const toggleMode = useCallback(() => {
		setModeCookie(modeCookie === "dark" ? "light" : "dark");
	}, [modeCookie, setModeCookie]);
	const context = useMemo(() => ({
		initialized: true,
		current,
		themes,
		optionsOverride,
		mode: modeCookie,
		setTheme: (id) => {
			setThemeCookie(id);
		},
		setOptionsOverride,
		toggleMode
	}), [
		current,
		modeCookie,
		optionsOverride,
		themes,
		toggleMode,
		setThemeCookie,
		setOptionsOverride
	]);
	return /* @__PURE__ */ jsx(TuiThemesContext.Provider, {
		value: context,
		children: /* @__PURE__ */ jsx(ThemeProvider, {
			theme,
			children
		})
	});
};

//#endregion
//#region src/app/hooks/useAppTheme.tsx
const useAppTheme = () => {
	const context = useContext(TuiThemesContext);
	return useMemo(() => ({
		...context,
		isDark: context.mode === "dark",
		isLight: context.mode === "light"
	}), [context]);
};

//#endregion
//#region src/user/index.ts
const AppUserContext = createContext({
	initialized: false,
	user: null,
	setUser: () => {},
	isReady: () => false,
	validateProps: () => false
});

//#endregion
//#region src/app/hooks/useAppUser.tsx
const useAppUser = () => {
	return useContext(AppUserContext);
};

//#endregion
//#region src/app/providers/AppSearchServiceProvider.tsx
const DEFAULT_CONTEXT = {
	initialized: false,
	provided: false,
	service: { itemRenderer: () => /* @__PURE__ */ jsx("div", {}) },
	state: {
		searching: false,
		menu: false,
		mode: "inline",
		items: null,
		set: () => null
	}
};
const AppSearchServiceProvider = ({ service, children }) => {
	const { navigate } = useAppRouter();
	const { topnav } = useAppPreferences();
	const defaultService = useMemo(() => {
		const searchUri = topnav.quickSearchURI;
		const params = topnav.quickSearchParam;
		return {
			onEnter: (value) => {
				navigate(`${searchUri}?${params}=${encodeURIComponent(value)}`);
			},
			itemRenderer: () => /* @__PURE__ */ jsx("div", {})
		};
	}, [topnav, navigate]);
	const [state, setState] = useState(DEFAULT_CONTEXT.state);
	const context = useMemo(() => ({
		initialized: true,
		provided: !!service,
		service: service || defaultService,
		state: {
			...state,
			set: setState
		}
	}), [
		service,
		defaultService,
		state
	]);
	return /* @__PURE__ */ jsx(AppSearchServiceContext.Provider, {
		value: context,
		children
	});
};
var AppSearchServiceProvider_default = AppSearchServiceProvider;

//#endregion
//#region src/app/providers/AppQuickSearchProvider.tsx
const AppQuickSearchProvider = ({ search, children }) => {
	const { allowQuickSearch } = useAppPreferences();
	const show = useCookiesStore((state) => allowQuickSearch && state.showQuickSearch);
	const setShow = useCookiesStore((state) => state.setShowQuickSearch);
	const context = useMemo(() => ({
		initialized: true,
		show,
		setShow,
		toggle: () => setShow(!show)
	}), [show, setShow]);
	return /* @__PURE__ */ jsx(AppQuickSearchContext.Provider, {
		value: context,
		children: /* @__PURE__ */ jsx(AppSearchServiceProvider_default, {
			service: search,
			children
		})
	});
};
var AppQuickSearchProvider_default = AppQuickSearchProvider;

//#endregion
//#region src/app/providers/AppBarProvider.tsx
const AppBarProvider = ({ search, children }) => {
	const { allowAutoHideTopbar } = useAppPreferences();
	const [show, setShow] = useState(true);
	const autoHide = useCookiesStore((state) => {
		return allowAutoHideTopbar && state.autoHideAppbar;
	});
	const setAutoHide = useCookiesStore((state) => state.setAutoHideAppbar);
	const context = useMemo(() => ({
		initialized: true,
		show,
		autoHide,
		setShow,
		setAutoHide,
		toggleAutoHide: () => setAutoHide(!autoHide)
	}), [
		show,
		autoHide,
		setAutoHide
	]);
	return /* @__PURE__ */ jsx(AppBarContext.Provider, {
		value: context,
		children: /* @__PURE__ */ jsx(AppQuickSearchProvider_default, {
			search,
			children
		})
	});
};
var AppBarProvider_default = AppBarProvider;

//#endregion
//#region src/app/providers/AppBreadcrumbsProvider.tsx
const AppBreadcrumbsProvider = ({ children }) => {
	const history = useRef([]);
	const { breadcrumbs, location } = useAppRouter();
	const { allowBreadcrumbs } = useAppPreferences();
	const [items, setItems] = useState([]);
	const show = useCookiesStore((state) => allowBreadcrumbs && state.showBreadcrumbs);
	const setShow = useCookiesStore((state) => state.setShowBreadcrumbs);
	useEffect(() => {
		const hRoute = {
			route: location.pathname,
			path: location.pathname + location.search
		};
		history.current = history.current.filter((hr) => hr.route !== hRoute.route);
		history.current.push(hRoute);
		if (history.current.length > 100) history.current = history.current.slice(-100);
		setItems(breadcrumbs(location).map((_item) => {
			const hRoute$1 = history.current.find((hr) => hr.route === _item.route);
			return hRoute$1 ? {
				..._item,
				path: hRoute$1.path
			} : _item;
		}));
	}, [breadcrumbs, location]);
	const context = useMemo(() => {
		return {
			initialized: true,
			show,
			items,
			history: history.current,
			setItems,
			toggle: () => setShow(!show)
		};
	}, [
		show,
		items,
		setShow
	]);
	return /* @__PURE__ */ jsx(AppBreadcrumbsContext.Provider, {
		value: context,
		children
	});
};
var AppBreadcrumbsProvider_default = AppBreadcrumbsProvider;

//#endregion
//#region src/display/AppAvatar.tsx
const AppAvatar = ({ url,...props }) => {
	return /* @__PURE__ */ jsx(Avatar, {
		...props,
		sx: {
			...props.sx || {},
			"&:hover": { cursor: "pointer" }
		},
		src: url
	});
};
const AppUserAvatar = styled(AppAvatar)(({ theme }) => ({
	width: `max(${theme.spacing(5)}, 28px)`,
	height: `max(${theme.spacing(5)}, 28px)`,
	[theme.breakpoints.down("sm")]: {
		width: `max(${theme.spacing(4)}, 24px)`,
		height: `max(${theme.spacing(4)}, 24px)`
	}
}));

//#endregion
//#region src/display/AppBrand.tsx
const AppBrand = ({ variant = "app", size: sizeProp }) => {
	const theme = useTheme();
	const { brand } = useAppPreferences();
	const size = variant === "app" ? "app" : sizeProp || "small";
	const sizes = useMemo(() => getBrandSizes(theme, size), [theme, size]);
	if (!brand) return null;
	const isDark = theme.palette.mode === "dark";
	const logoSrc = isDark ? brand.logo.dark : brand.logo.light;
	const nameSrc = isDark ? brand.name?.dark : brand.name?.light;
	const nameText = brand.appName;
	if (brand.component) return /* @__PURE__ */ jsx(brand.component, {
		variant,
		size,
		config: brand,
		sizes
	});
	if (variant === "logo") return /* @__PURE__ */ jsx(Stack, {
		direction: "row",
		alignItems: "center",
		children: /* @__PURE__ */ jsx("img", {
			src: logoSrc,
			alt: `${brand.application} logo`,
			style: { ...sizes.icon }
		})
	});
	if (variant === "name") return /* @__PURE__ */ jsx(Stack, {
		direction: "row",
		alignItems: "center",
		children: /* @__PURE__ */ jsx(AppBrandName, {
			nameSrc,
			nameText,
			application: brand.application,
			sizes
		})
	});
	return /* @__PURE__ */ jsxs(Stack, {
		direction: variant === "banner-horizontal" || variant === "app" ? "row" : "column",
		alignItems: "center",
		style: { width: "fit-content" },
		children: [
			/* @__PURE__ */ jsx("img", {
				src: logoSrc,
				alt: `${brand.application} logo`,
				style: { ...sizes.icon }
			}),
			/* @__PURE__ */ jsx("div", { style: { ...sizes.divider } }),
			/* @__PURE__ */ jsx(AppBrandName, {
				nameSrc,
				nameText,
				application: brand.application,
				sizes
			})
		]
	});
};
const AppBrandName = ({ nameSrc, nameText, application, sizes }) => {
	if (nameSrc) return /* @__PURE__ */ jsx("img", {
		src: nameSrc,
		alt: application,
		style: { ...sizes.name }
	});
	if (nameText) return /* @__PURE__ */ jsx(Typography, {
		sx: {
			fontSize: sizes.text.fontSize,
			lineHeight: 1
		},
		children: nameText
	});
	return null;
};

//#endregion
//#region src/display/AppInfoPanel.tsx
const AppInfoPanel = ({ i18nKey,...props }) => {
	const { t } = useTranslation(MODULE_NAME);
	const bgColor = emphasize(useTheme().palette.background.default, .1);
	const color = emphasize(bgColor, .4);
	return /* @__PURE__ */ jsxs(Stack, {
		...props,
		direction: "row",
		p: 2,
		sx: {
			...props.sx,
			alignItems: "center",
			borderRadius: 2,
			backgroundColor: bgColor,
			color
		},
		children: [
			/* @__PURE__ */ jsx(Info, { fontSize: "large" }),
			/* @__PURE__ */ jsx(Box, { m: 1 }),
			/* @__PURE__ */ jsx(Typography, {
				variant: "h5",
				children: t(i18nKey)
			})
		]
	});
};

//#endregion
//#region src/display/AppListEmpty.tsx
const AppListEmpty = (props) => {
	return /* @__PURE__ */ jsx(AppInfoPanel, {
		...props,
		i18nKey: "app.list.empty"
	});
};

//#endregion
//#region src/display/AppSurface.tsx
const AppSurface = ({ baseElevation = 0, relativeElevation = 1, withBorder = false, withShadow = false, sx,...props }) => {
	return /* @__PURE__ */ jsx(Paper, {
		...props,
		sx: [(theme) => {
			const clampedBaseElevation = Math.max(0, Math.min(24, baseElevation));
			const targetElevation = Math.max(0, Math.min(24, clampedBaseElevation + relativeElevation));
			const lightAdjust = Math.min(Math.abs(relativeElevation) * .03, .16);
			const baseOverlayAlpha = getOverlayAlpha(clampedBaseElevation);
			const targetOverlayAlphaFromElevation = getOverlayAlpha(targetElevation);
			const relativeOverlayDelta = relativeElevation * .02;
			const targetOverlayAlpha = Math.max(0, Math.min(1, Math.max(targetOverlayAlphaFromElevation, baseOverlayAlpha + relativeOverlayDelta)));
			return {
				backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : relativeElevation >= 0 ? darken(theme.palette.background.paper, lightAdjust) : lighten(theme.palette.background.paper, lightAdjust),
				backgroundImage: theme.palette.mode === "dark" ? `linear-gradient(${alpha(theme.palette.common.white, targetOverlayAlpha)}, ${alpha(theme.palette.common.white, targetOverlayAlpha)})` : "none",
				...withShadow ? {} : { boxShadow: "none" },
				...withBorder ? { border: `1px solid ${theme.palette.divider}` } : {}
			};
		}, ...Array.isArray(sx) ? sx : [sx]]
	});
};

//#endregion
//#region src/display/AppToc.tsx
const TocRoot = styled("div")(({ theme }) => ({
	display: "flex",
	".tocBar": {
		display: "none",
		paddingLeft: "16px",
		[theme.breakpoints.up("md")]: { display: "block" }
	},
	".toc": {
		fontSize: "0.875rem",
		listStyle: "none",
		paddingInlineStart: 0,
		[theme.breakpoints.only("md")]: { width: "124px" },
		[theme.breakpoints.up("lg")]: { width: "164px" },
		"& li": {
			color: theme.palette.text.primary,
			marginLeft: theme.spacing(1),
			marginBottom: theme.spacing(.5),
			paddingLeft: theme.spacing(1.25),
			paddingRight: theme.spacing(1)
		},
		"& .active": {
			borderLeft: `solid ${theme.palette.primary.main} 2px`,
			paddingLeft: theme.spacing(1),
			color: theme.palette.primary.main
		},
		"& li:hover": {
			borderLeft: `solid ${theme.palette.text.disabled} 1px`,
			paddingLeft: "9px",
			color: theme.palette.text.disabled
		},
		"& li > a": {
			color: "inherit",
			display: "block",
			textDecoration: "none",
			width: "100%"
		}
	},
	".ttop": {
		paddingTop: theme.spacing(2.5),
		marginLeft: theme.spacing(2.25),
		color: theme.palette.text.primary,
		"& a": {
			color: "inherit",
			display: "block",
			textDecoration: "none"
		},
		"& :hover": { color: theme.palette.text.disabled }
	}
}));
const AppTocElement = ({ translation, item }) => {
	const { t } = useTranslation([translation]);
	const { location } = useAppRouter();
	const currentHash = location.hash && location.hash !== "" ? location.hash.substring(1) : null;
	const active = currentHash && currentHash.startsWith(item.id) ? "active" : null;
	const { user: currentUser } = useAppUser();
	const { Link: Link$1 } = useAppRouter();
	return (!item.is_admin || currentUser.is_admin && item.is_admin) && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("li", {
		className: active,
		children: /* @__PURE__ */ jsx(Link$1, {
			to: `#${item.id}`,
			target: "_self",
			children: t(item.id)
		})
	}), active && item.subItems && /* @__PURE__ */ jsx("ul", {
		className: "toc",
		style: {
			fontSize: "smaller",
			paddingInlineStart: "8px"
		},
		children: item.subItems.map((itm) => /* @__PURE__ */ jsx(AppTocElement, {
			item: itm,
			translation
		}, itm.id))
	})] });
};
const AppTocInternal = ({ children, translation, items, titleI18nKey = "toc", topI18nKey = "top" }) => {
	const theme = useTheme();
	const { autoHide: autoHideAppbar } = useAppBar();
	const { current: currentLayout } = useAppLayout();
	const { t } = useTranslation([translation]);
	const { Link: Link$1, location } = useAppRouter();
	useEffect(() => {
		if (location.hash && location.hash !== "") {
			const scrollElement = document.getElementById(location.hash.substring(1));
			if (scrollElement) scrollElement.scrollIntoView(true);
			else console.log("[WARN] Trying to scroll to unknown ID:", location.hash);
		}
	}, [location.hash]);
	return /* @__PURE__ */ jsxs(TocRoot, {
		id: "top",
		children: [/* @__PURE__ */ jsx("div", {
			id: "content",
			children
		}), /* @__PURE__ */ jsx("div", {
			id: "toc",
			className: "tocBar",
			children: /* @__PURE__ */ jsxs("div", {
				style: {
					position: "sticky",
					top: theme.spacing(autoHideAppbar && currentLayout !== "top" ? 5 : 13)
				},
				children: [titleI18nKey && /* @__PURE__ */ jsx("div", {
					style: {
						fontSize: "1.25rem",
						marginLeft: "18px"
					},
					children: t(titleI18nKey)
				}), /* @__PURE__ */ jsxs("ul", {
					className: "toc",
					children: [items && items.map((item) => /* @__PURE__ */ jsx(AppTocElement, {
						item,
						translation
					}, item.id)), topI18nKey && /* @__PURE__ */ jsx("div", {
						className: "ttop",
						children: /* @__PURE__ */ jsx(Link$1, {
							to: "#top",
							target: "_self",
							children: t(topI18nKey)
						})
					})]
				})]
			})
		})]
	});
};
const AppToc = memo(AppTocInternal);

//#endregion
//#region src/display/hooks/useAppColor.tsx
const useAppColor = (color = "grey", lightVariant = 100, darkVariant = 900) => {
	const { isDark } = useAppTheme();
	return useMemo(() => {
		return colors[color][isDark ? darkVariant : lightVariant];
	}, [
		isDark,
		color,
		lightVariant,
		darkVariant
	]);
};

//#endregion
//#region src/leftnav/v2/LeftNavItem.tsx
const LeftNavItem = ({ icon, label, i18nKey, tooltipI18nKey, level, active, activeParent, context, children }) => {
	const { t: clientT } = useTranslation();
	const { open: navopen } = useAppLeftNav();
	return /* @__PURE__ */ jsx(Tooltip, {
		title: useMemo(() => {
			if (tooltipI18nKey) return clientT(tooltipI18nKey);
			return !navopen && level === 0 ? i18nKey ? clientT(i18nKey) : label : "";
		}, [
			navopen,
			clientT,
			level,
			i18nKey,
			label,
			tooltipI18nKey
		]),
		placement: "right",
		children: /* @__PURE__ */ jsx(Stack, {
			direction: "row",
			alignItems: "center",
			position: "relative",
			width: "100%",
			children: /* @__PURE__ */ jsxs(Stack, {
				direction: "row",
				alignItems: "center",
				pt: 1.5,
				pb: 1.5,
				pl: context === "accordion" ? level === 0 ? 0 : 2 * level : 0,
				pr: context === "accordion" ? 2 : 0,
				width: "100%",
				className: `${active ? "active" : ""} ${activeParent ? "active_parent" : ""}`,
				position: "relative",
				zIndex: 0,
				sx: (theme) => ({
					"& > *": { zIndex: 1 },
					"&::before": {
						content: "\"\"",
						position: "absolute",
						top: theme.spacing(1.5),
						left: theme.spacing(.75),
						bottom: theme.spacing(1.5),
						width: "4px",
						borderRadius: 1,
						bgcolor: "transparent",
						zIndex: 0
					},
					"&.active_parent::before": {
						bgcolor: "primary.main",
						top: "50%",
						bottom: "auto",
						height: theme.spacing(.5),
						width: theme.spacing(.5),
						borderRadius: "50%",
						transform: "translateY(-50%)",
						zIndex: 1
					},
					"&::after": {
						content: "\"\"",
						position: "absolute",
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						borderRadius: 0,
						opacity: 0,
						zIndex: 0
					},
					"&.active::after": {
						opacity: .1,
						top: theme.spacing(1),
						right: context === "popper" || navopen ? theme.spacing(1.5) : theme.spacing(1.25),
						bottom: theme.spacing(1),
						left: theme.spacing(1.375),
						borderRadius: 1,
						bgcolor: theme.palette.primary.main
					},
					"&:hover::after": {
						opacity: 1,
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						borderRadius: 0,
						background: theme.palette.action.hover
					}
				}),
				children: [
					/* @__PURE__ */ jsx(Box, {
						sx: (theme) => ({
							display: icon ? "inline-flex" : "none",
							flexShrink: 0,
							minWidth: `max(${theme.spacing(7)}, 42px)`,
							justifyContent: "center"
						}),
						children: icon
					}),
					/* @__PURE__ */ jsx(Typography, {
						ml: icon && level > 0 ? 0 : 2,
						mr: i18nKey || label ? 1 : 0,
						children: i18nKey ? clientT(i18nKey) : label
					}),
					children
				]
			})
		})
	});
};

//#endregion
//#region src/leftnav/v2/LeftNavAction.tsx
const LeftNavAction = (props) => {
	const { open: navopen, collapseMenus } = useAppLeftNav();
	return /* @__PURE__ */ jsx(Button, {
		fullWidth: true,
		onClick: useCallback((event) => {
			props.action(event, props);
			if (!navopen && !props.disableCollapse) collapseMenus();
		}, [
			collapseMenus,
			navopen,
			props
		]),
		variant: "outlined",
		color: "inherit",
		sx: {
			border: "none",
			p: 0,
			textTransform: "none",
			borderRadius: 0,
			"&:hover": { bgcolor: "inherit" }
		},
		children: /* @__PURE__ */ jsx(LeftNavItem, { ...props })
	});
};

//#endregion
//#region src/leftnav/v2/hooks/usePathMatcher.tsx
const usePathMatcher = () => {
	const { location, matchPath } = useAppRouter();
	return useCallback((path, configs) => {
		if (!path) return false;
		if (configs?.matcher) return configs.matcher.test(location.pathname);
		return Boolean(matchPath({
			path,
			end: configs?.matchEnd ?? true
		}, location.pathname));
	}, [location.pathname, matchPath]);
};

//#endregion
//#region src/leftnav/v2/LeftNavRoute.tsx
const LeftNavRoute = (props) => {
	const matcher = usePathMatcher();
	const { Link: Link$1 } = useAppRouter();
	const { open: navopen, collapseMenus } = useAppLeftNav();
	const onClick = useCallback(() => {
		if (!navopen) collapseMenus();
	}, [navopen, collapseMenus]);
	return /* @__PURE__ */ jsx(Link$1, {
		to: props.route,
		style: {
			display: "flex",
			textDecoration: "none",
			color: "inherit",
			width: "100%"
		},
		className: "tui-navitem",
		onClick,
		children: /* @__PURE__ */ jsx(LeftNavItem, {
			...props,
			active: matcher(props.route, { matcher: props.matcher })
		})
	});
};

//#endregion
//#region src/leftnav/v2/index.ts
const traverse = (menu, action, agg) => {
	action(menu, agg);
	for (const child of menu.items) if (child.type === "menu") traverse(child, action, agg);
	else action(child, agg);
	return agg;
};
const visit = (items, accept, action) => {
	return items.filter((child) => !!child).map((child) => {
		if (accept(child)) child = action(child);
		if (child?.type === "menu") {
			const menu = child;
			return {
				...menu,
				items: visit(menu.items, accept, action)
			};
		}
		return child;
	}).filter((child) => !!child);
};

//#endregion
//#region src/utils/hooks/useClipboard.tsx
const useClipboard = () => {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { t } = useTranslation(MODULE_NAME);
	const snackBarOptions = {
		preventDuplicate: true,
		autoHideDuration: 3e3,
		anchorOrigin: {
			vertical: "bottom",
			horizontal: "center"
		},
		SnackbarProps: { onClick: () => {
			closeSnackbar();
		} }
	};
	const copy = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			enqueueSnackbar(`${text} ${t("clipboard.success")}`, {
				variant: "success",
				...snackBarOptions
			});
		} catch {
			enqueueSnackbar(`${text} ${t("clipboard.failure")}`, {
				variant: "error",
				...snackBarOptions
			});
		}
	};
	return { copy };
};

//#endregion
//#region src/utils/hooks/useEnv.tsx
const useAppEnv = (key) => {
	return useMemo(() => {
		const env = typeof process !== "undefined" ? process.env : {};
		if (key) return env[key];
		return env;
	}, [key]);
};

//#endregion
//#region src/utils/hooks/useFullscreenStatus.tsx
const getBrowserFullscreenElementProp = () => {
	if (typeof document.fullscreenElement !== "undefined") return "fullscreenElement";
	if (typeof document["mozFullScreenElement"] !== "undefined") return "mozFullScreenElement";
	if (typeof document["msFullscreenElement"] !== "undefined") return "msFullscreenElement";
	if (typeof document["webkitFullscreenElement"] !== "undefined") return "webkitFullscreenElement";
	throw new Error("fullscreenElement is not supported by this browser");
};
const useFullscreenStatus = (elRef) => {
	const [isFullscreen, setIsFullscreen] = useState(typeof document !== "undefined" && document[getBrowserFullscreenElementProp()] !== null);
	const setFullscreen = useCallback(() => {
		if (elRef.current == null) return;
		elRef.current.requestFullscreen().then(() => {
			setIsFullscreen(document[getBrowserFullscreenElementProp()] !== null);
		}).catch(() => {
			setIsFullscreen(false);
		});
	}, [elRef]);
	useLayoutEffect(() => {
		if (typeof document === "undefined") return;
		const handleFullscreenChange = () => {
			setIsFullscreen(document[getBrowserFullscreenElementProp()] !== null);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, [setIsFullscreen]);
	return useMemo(() => [isFullscreen, setFullscreen], [isFullscreen, setFullscreen]);
};

//#endregion
//#region src/utils/hooks/useLocalStorage.ts
const useLocalStorage = (prefix) => {
	const _buildKey = useCallback((name) => prefix ? `${prefix}.${name}` : name, [prefix]);
	const get = useCallback((key) => JSON.parse(localStorage.getItem(_buildKey(key))), [_buildKey]);
	const set = useCallback((key, value) => localStorage.setItem(_buildKey(key), JSON.stringify(value)), [_buildKey]);
	const remove = useCallback((key, withPrefix = false) => localStorage.removeItem(withPrefix ? key : _buildKey(key)), [_buildKey]);
	const has = useCallback((key) => get(key) !== null, [get]);
	const keys = useCallback(() => Object.keys(localStorage), []);
	const items = useCallback(() => keys().map((k) => ({
		key: k,
		value: get(k)
	})), [get, keys]);
	const clear = useCallback(() => keys().forEach((key) => {
		if (prefix && key.startsWith(prefix)) remove(key, true);
		else if (!prefix) remove(key);
	}), [
		prefix,
		remove,
		keys
	]);
	return useMemo(() => ({
		get,
		set,
		remove,
		has,
		keys,
		items,
		clear
	}), [
		get,
		set,
		remove,
		has,
		keys,
		items,
		clear
	]);
};

//#endregion
//#region src/utils/hooks/useLocalStorageItem.tsx
/**
* This hooks backs the typical 'useState' hook with local storage.
*
* This means that it will initialize with the value stored in local storage.
*
* State changes are also persisted to local storage.
*
* All this ensures the state is preserved across inializations.
*
* @param key - local storage key under which to store the state.
* @param initialValue - local storage initialization value.
* @returns a stateful value, a function to update it, and a function to remove it.
*/
const useLocalStorageItem = (key, initialValue) => {
	const { get, set, has, remove } = useLocalStorage();
	const [value, setValue] = useState(get(key) ?? initialValue);
	useEffect(() => {
		if (initialValue !== null && initialValue !== void 0 && !has(key)) set(key, initialValue);
	}, [
		key,
		initialValue,
		has,
		set
	]);
	const setter = useCallback((newValue, save = true) => {
		const computedValue = typeof newValue === "function" ? newValue(value) : newValue;
		if (save) if (computedValue !== void 0) set(key, computedValue);
		else remove(key);
		setValue(computedValue);
	}, [
		key,
		remove,
		set,
		value
	]);
	const remover = useCallback(() => remove(key), [key, remove]);
	return useMemo(() => [
		value,
		setter,
		remover
	], [
		remover,
		setter,
		value
	]);
};

//#endregion
//#region src/utils/keyboard.ts
const ENTER = "Enter";
const ESCAPE = "Escape";
const ARROW_LEFT = "ArrowLeft";
const ARROW_UP = "ArrowUp";
const ARROW_RIGHT = "ArrowRight";
const ARROW_DOWN = "ArrowDown";
const BACKSPACE = "Backspace";
const SPACE = " ";
function is(key, check) {
	return key === check;
}
function isArrowUp(key) {
	return is(key, ARROW_UP);
}
function isArrowDown(key) {
	return is(key, ARROW_DOWN);
}
function isArrowLeft(key) {
	return is(key, ARROW_LEFT);
}
function isArrowRight(key) {
	return is(key, ARROW_RIGHT);
}
function isEscape(key) {
	return is(key, ESCAPE);
}
function isEnter(key) {
	return is(key, ENTER);
}
function isBackspace(key) {
	return is(key, BACKSPACE);
}
function isSpace(key) {
	return is(key, SPACE);
}
function parseEvent(event) {
	return {
		key: event.key,
		isCtrl: event.ctrlKey,
		isEnter: isEnter(event.key),
		isSpace: isSpace(event.key),
		isBackspace: isBackspace(event.key),
		isEscape: isEscape(event.key),
		isArrowLeft: isArrowLeft(event.key),
		isArrowRight: isArrowRight(event.key),
		isArrowUp: isArrowUp(event.key),
		isArrowDown: isArrowDown(event.key)
	};
}
const keyboard = {
	ENTER,
	ESCAPE,
	ARROW_LEFT,
	ARROW_UP,
	ARROW_DOWN,
	BACKSPACE,
	SPACE,
	is,
	isArrowUp,
	isArrowDown,
	isArrowLeft,
	isArrowRight,
	isEscape,
	isEnter,
	isBackspace,
	isSpace,
	parseEvent
};

//#endregion
//#region src/commands/AppCommands.tsx
const ModalTransition$1 = forwardRef(function Transition(props, ref) {
	const { children,..._props } = props;
	return /* @__PURE__ */ jsx(Slide, {
		direction: "down",
		ref,
		..._props,
		children
	});
});
const AppCommands = ({ open: open$1, setOpen }) => {
	const theme = useTheme();
	const menuRef = useRef(void 0);
	const inputRef = useRef(void 0);
	const { t: clientT } = useTranslation();
	const { t } = useTranslation(MODULE_NAME);
	const { menus } = useAppLeftNav();
	const { mode, setFocus } = useAppLayout();
	const { allowFocusMode, commands } = useAppPreferences();
	const { toggleMode, isDark } = useAppTheme();
	const { toggle: toggleLanguage, isEN } = useAppLanguage();
	const { Link: Link$1, matchPath, location } = useAppRouter();
	const [inputValue, setInputValue] = useState("");
	const [displayItems, setDisplayItems] = useState(null);
	const items = useMemo(() => {
		const _items = menus.map((menu) => traverse(menu, (child, agg) => {
			if (child.type === "route") agg.push({
				id: child.id,
				type: child.type,
				icon: child.icon,
				primary: child.label,
				primaryI18nKey: child.i18nKey,
				secondary: child.route,
				descriptionI18nKey: child.tooltipI18nKey,
				route: child.route,
				matcher: child.matcher
			});
			if (child.type === "action") agg.push({
				id: child.id,
				type: child.type,
				icon: child.icon,
				primary: child.label,
				primaryI18nKey: child.i18nKey,
				descriptionI18nKey: child.tooltipI18nKey,
				onClick: child.action
			});
		}, [])).flat();
		_items.sort((i1) => {
			return i1.type === "action" ? -1 : 1;
		});
		_items.unshift({
			id: "action.toggle.thememode",
			type: "action",
			icon: /* @__PURE__ */ jsx(DarkMode, {}),
			primary: "Theme Mode",
			description: isDark ? "Change theme mode to light" : "Change theme mode to dark",
			onClick: () => toggleMode()
		});
		_items.unshift({
			id: "action.toggle.language",
			type: "action",
			icon: /* @__PURE__ */ jsx(Language, {}),
			primary: "Language",
			description: isEN() ? "Change language to french" : "Changer la langue en anglais",
			onClick: () => toggleLanguage()
		});
		if (allowFocusMode) _items.unshift({
			id: "action.toggle.focusmode",
			type: "action",
			icon: mode === "focus" ? /* @__PURE__ */ jsx(ZoomInMap, {}) : /* @__PURE__ */ jsx(ZoomOutMap, {}),
			primary: "Focus Mode",
			description: isEN() ? mode === "focus" ? "Turn OFF focus mode" : "Turn ON focus mode" : mode === "focus" ? "Désactiver le mode focus" : "Activer le mode focus",
			onClick: () => setFocus((_focus) => !_focus)
		});
		return commands ? [..._items, ...commands] : _items;
	}, [
		mode,
		menus,
		isEN,
		isDark,
		allowFocusMode,
		commands,
		toggleMode,
		toggleLanguage,
		setFocus
	]);
	const search = useCallback((searchTerm) => {
		const filteredItems = searchTerm ? items.filter((item) => {
			return `${item.primary}${item.secondary}${item.description}`.toLowerCase().includes(searchTerm.toLowerCase());
		}) : items;
		setDisplayItems({
			actions: filteredItems.filter((i) => i.type === "action"),
			routes: filteredItems.filter((i) => i.type === "route")
		});
	}, [items]);
	const onInputValueChange = useCallback((event) => {
		event.stopPropagation();
		setInputValue(event.target.value);
		search(event.target.value);
	}, [search]);
	const onTextFieldKeyDown = useCallback((event) => {
		const { isArrowDown: isArrowDown$1, isArrowUp: isArrowUp$1 } = parseEvent(event);
		if (isArrowDown$1 || isArrowUp$1) {
			const elements = menuRef.current.querySelectorAll(".app-command");
			if (elements) {
				event.preventDefault();
				elements.item(isArrowDown$1 ? 0 : elements.length - 1).focus();
			}
		}
	}, []);
	const onModalKeyDown = useCallback((event) => {
		const { isEscape: isEscape$1, isCtrl, key } = parseEvent(event);
		if (isEscape$1) {
			setInputValue("");
			setOpen(false);
		}
		if (isCtrl && key === "/") setOpen(true);
	}, [setOpen]);
	useEffect(() => {
		const _open = open$1;
		const handler = (event) => {
			const { isCtrl, key } = parseEvent(event);
			if (isCtrl && key === "/") setOpen(true);
		};
		if (!_open) window.addEventListener("keydown", handler);
		return () => {
			if (!_open) window.removeEventListener("keydown", handler);
		};
	}, [open$1, setOpen]);
	useEffect(() => {
		if (!open$1) setDisplayItems(null);
	}, [open$1]);
	const CommandActionRenderer = useCallback((_item) => {
		const primary = _item.primaryI18nKey ? clientT(_item.primaryI18nKey) : _item.primary;
		const secondary = _item.secondaryI18nKey ? clientT(_item.secondaryI18nKey) : _item.secondary;
		const description = _item.descriptionI18nKey ? clientT(_item.descriptionI18nKey) : _item.description;
		return /* @__PURE__ */ jsxs(MenuItem, {
			dense: true,
			className: "app-command",
			onClick: (event) => {
				_item.onClick(event);
				setOpen(false);
			},
			sx: {
				display: "relative",
				whiteSpace: "break-spaces"
			},
			children: [
				/* @__PURE__ */ jsx(ListItemIcon, { children: _item.icon }),
				/* @__PURE__ */ jsx(ListItemText, {
					sx: { flex: 1 },
					primary,
					secondary: description && secondary
				}),
				/* @__PURE__ */ jsx(Typography, {
					variant: "body2",
					color: "textSecondary",
					justifyContent: "left",
					flex: 1,
					children: description || secondary
				})
			]
		}, _item.id);
	}, [setOpen, clientT]);
	const CommandRouteRenderer = useCallback((_item) => {
		const match = _item.matcher ? _item.matcher.test(location.pathname) : matchPath({ path: _item.route }, location.pathname);
		const primary = _item.primaryI18nKey ? clientT(_item.primaryI18nKey) : _item.primary;
		const secondary = _item.secondaryI18nKey ? clientT(_item.secondaryI18nKey) : _item.secondary;
		const description = _item.descriptionI18nKey ? clientT(_item.descriptionI18nKey) : _item.description;
		return /* @__PURE__ */ jsxs(MenuItem, {
			dense: true,
			className: `app-command ${match ? "app-command-active" : ""}`,
			component: Link$1,
			to: _item.route,
			onClick: () => setOpen(false),
			sx: {
				display: "relative",
				whiteSpace: "break-spaces"
			},
			children: [
				match && /* @__PURE__ */ jsx(Box, {
					position: "absolute",
					top: 22,
					bottom: 22,
					left: 4,
					width: 4,
					bgcolor: "primary.main",
					borderRadius: 2
				}),
				/* @__PURE__ */ jsx(ListItemIcon, { children: _item.icon || /* @__PURE__ */ jsx(Circle, { sx: { display: "none" } }) }),
				/* @__PURE__ */ jsx(ListItemText, {
					sx: { flex: 1 },
					primary,
					secondary: description && secondary
				}),
				/* @__PURE__ */ jsx(Typography, {
					variant: "body2",
					color: "textSecondary",
					justifyContent: "left",
					flex: 1,
					children: description || secondary
				})
			]
		}, _item.id);
	}, [
		Link$1,
		location.pathname,
		matchPath,
		setOpen,
		clientT
	]);
	return /* @__PURE__ */ jsxs(Dialog, {
		disableRestoreFocus: true,
		fullWidth: true,
		maxWidth: "md",
		open: open$1,
		onKeyDown: onModalKeyDown,
		sx: {
			maxHeight: "50%",
			".MuiDialog-container": { alignItems: "start" }
		},
		slots: { transition: ModalTransition$1 },
		slotProps: { paper: { sx: {
			borderTopLeftRadius: 0,
			borderTopRightRadius: 0,
			margin: 0,
			width: "100%"
		} } },
		onClose: () => {
			setOpen(false);
		},
		children: [/* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsx(AppSurface, {
			baseElevation: 24,
			relativeElevation: 4,
			withShadow: false,
			sx: { borderRadius: 1 },
			children: /* @__PURE__ */ jsx(InputBase, {
				autoFocus: true,
				fullWidth: true,
				ref: inputRef,
				placeholder: t("quick.command.text.field.label"),
				value: inputValue,
				onChange: onInputValueChange,
				onKeyDown: onTextFieldKeyDown,
				startAdornment: /* @__PURE__ */ jsx(InputAdornment, {
					position: "start",
					children: /* @__PURE__ */ jsx(KeyboardCommandKey, {
						color: "inherit",
						sx: { color: theme.palette.text.secondary }
					})
				}),
				endAdornment: /* @__PURE__ */ jsx(InputAdornment, {
					position: "end",
					children: /* @__PURE__ */ jsx(IconButton, {
						color: "inherit",
						sx: { color: theme.palette.text.secondary },
						onClick: () => {
							setInputValue("");
							setDisplayItems(null);
						},
						children: /* @__PURE__ */ jsx(Close, {})
					})
				}),
				sx: (theme$1) => ({
					color: theme$1.palette.text.secondary,
					width: "100%",
					p: 1
				})
			})
		}) }), /* @__PURE__ */ jsx(DialogContent, {
			sx: {
				width: "100%",
				pb: 0
			},
			children: /* @__PURE__ */ jsxs(MenuList, {
				sx: {
					outline: "none",
					mt: 0,
					pt: 0
				},
				ref: menuRef,
				children: [
					/* @__PURE__ */ jsxs(MenuItem, {
						tabIndex: -1,
						disableGutters: true,
						dense: true,
						disabled: true,
						style: { opacity: 1 },
						children: [/* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(Bolt, { color: "warning" }) }), /* @__PURE__ */ jsx(ListItemText, {
							sx: (theme$1) => ({ color: theme$1.palette.text.secondary }),
							children: t("actions")
						})]
					}),
					(displayItems?.actions || items.filter((i) => i.type === "action")).map((_item) => /* @__PURE__ */ jsx(CommandActionRenderer, { ..._item }, _item.id)),
					/* @__PURE__ */ jsxs(MenuItem, {
						tabIndex: -1,
						disableGutters: true,
						dense: true,
						disabled: true,
						style: {
							opacity: 1,
							marginTop: theme.spacing(2)
						},
						children: [/* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(TurnRight, {
							color: "primary",
							style: { marginBottom: 5 }
						}) }), /* @__PURE__ */ jsx(ListItemText, {
							sx: (theme$1) => ({ color: theme$1.palette.text.secondary }),
							children: t("routes")
						})]
					}),
					(displayItems?.routes || items.filter((i) => i.type === "route")).map((_item) => /* @__PURE__ */ jsx(CommandRouteRenderer, { ..._item }, _item.id))
				]
			})
		})]
	});
};

//#endregion
//#region src/focus/AppFocusControl.tsx
const AppFocusControl = ({ focusctrl, setQuicknav, setFocus, setFocusctrl }) => {
	const paperRef = useRef(null);
	const offsetRef = useRef(null);
	const theme = useTheme();
	const { t } = useTranslation(MODULE_NAME);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [moving, setMoving] = useState(false);
	const onDismissClick = useCallback(() => {
		setFocusctrl((_focusctrl) => ({
			..._focusctrl,
			open: false
		}));
		enqueueSnackbar(/* @__PURE__ */ jsx(Trans, {
			i18nKey: "focusmode.snackbar.2",
			ns: MODULE_NAME
		}), {
			key: "snack.2",
			variant: "info",
			autoHideDuration: 8e3,
			anchorOrigin: {
				vertical: "bottom",
				horizontal: "center"
			},
			SnackbarProps: { onClick: () => {
				closeSnackbar("snack.2");
			} }
		});
	}, [
		enqueueSnackbar,
		closeSnackbar,
		setFocusctrl
	]);
	const onExitClick = useCallback(() => {
		setFocus(false);
	}, [setFocus]);
	const onMouseDown = useCallback((event) => {
		const rect = paperRef.current.getBoundingClientRect();
		offsetRef.current = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		setMoving(true);
	}, []);
	const onMouseMove = useCallback((event) => {
		const rect = paperRef.current.getBoundingClientRect();
		const boundTop = 10;
		const boundRight = window.innerWidth - rect.width - 10;
		const boundBottom = window.innerHeight - rect.height - 10;
		const boundLeft = 10;
		const zxMargin = window.innerWidth * .2;
		const zyMargin = window.innerHeight * .2;
		const zxLeft = window.innerWidth * .5 - zxMargin;
		const zxRight = window.innerWidth * .5 + zxMargin;
		const zyTop = window.innerHeight * .5 - zyMargin;
		const zyBottom = window.innerHeight * .5 + zyMargin;
		if (event.clientX <= boundLeft || event.clientX >= boundRight) {
			if (event.clientY >= zyTop && event.clientY <= zyBottom) setFocusctrl({
				...focusctrl,
				flexDirection: "column"
			});
		} else if (event.clientY <= boundTop || event.clientY >= boundBottom) {
			if (event.clientX >= zxLeft && event.clientX <= zxRight) setFocusctrl({
				...focusctrl,
				flexDirection: "row"
			});
		}
		const clientX = event.clientX - offsetRef.current.x;
		const clientY = event.clientY - offsetRef.current.y;
		const position = {
			left: clientX <= boundLeft ? boundLeft : clientX >= boundRight ? boundRight : clientX,
			top: clientY <= boundTop ? boundTop : clientY >= boundBottom ? boundBottom : clientY
		};
		paperRef.current.style.left = `${position.left}px`;
		paperRef.current.style.top = `${position.top}px`;
		paperRef.current.style.bottom = "unset";
		paperRef.current.style.transform = "unset";
	}, [focusctrl, setFocusctrl]);
	const onMouseUp = useCallback(() => {
		setMoving(false);
		offsetRef.current = null;
	}, []);
	const tooltipPopperProps = useMemo(() => ({
		sx: { zIndex: theme.zIndex.tui.superOverlay + 1 },
		modifiers: [{
			name: "flip",
			options: { fallbackPlacements: focusctrl.flexDirection === "row" ? ["top", "bottom"] : ["left", "right"] }
		}]
	}), [theme, focusctrl]);
	useEffect(() => {
		if (moving) {
			window.addEventListener("mousemove", onMouseMove);
			window.addEventListener("mouseup", onMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [
		moving,
		onMouseMove,
		onMouseUp
	]);
	return /* @__PURE__ */ jsx(Popper, {
		keepMounted: true,
		ref: paperRef,
		open: focusctrl.open,
		style: {
			position: "fixed",
			top: "unset",
			bottom: 10,
			left: "50%",
			transform: "translateX(-50%)",
			zIndex: theme.zIndex.tui.superOverlay
		},
		transition: true,
		children: ({ TransitionProps }) => /* @__PURE__ */ jsx(Fade, {
			...TransitionProps,
			timeout: 200,
			children: /* @__PURE__ */ jsxs(Paper, {
				elevation: 4,
				sx: {
					display: "flex",
					flexDirection: focusctrl.flexDirection,
					pl: focusctrl.flexDirection === "row" ? 4 : 1,
					pr: focusctrl.flexDirection === "row" ? 4 : 1,
					pt: focusctrl.flexDirection === "row" ? 1 : 4,
					pb: focusctrl.flexDirection === "row" ? 1 : 4,
					alignItems: "center",
					gap: 3,
					borderRadius: 9999
				},
				children: [
					/* @__PURE__ */ jsx(Tooltip, {
						title: t("focusmode.toolitp.draghandle"),
						slotProps: { popper: tooltipPopperProps },
						children: /* @__PURE__ */ jsx(IconButton, {
							onMouseDown,
							sx: {
								mr: focusctrl.flexDirection === "row" ? 3 : 0,
								mb: focusctrl.flexDirection === "column" ? 3 : 0
							},
							color: "primary",
							children: /* @__PURE__ */ jsx(DragIndicator, {
								className: "drag-handle",
								style: { cursor: "move" }
							})
						})
					}),
					/* @__PURE__ */ jsx(Tooltip, {
						title: t("focusmode.tooltip.exit"),
						slotProps: { popper: tooltipPopperProps },
						children: /* @__PURE__ */ jsx(IconButton, {
							onClick: onExitClick,
							color: "default",
							children: /* @__PURE__ */ jsx(ZoomInMap, {})
						}, "exit")
					}),
					/* @__PURE__ */ jsx(Tooltip, {
						title: t("quick.command.enter.tooltip"),
						slotProps: { popper: tooltipPopperProps },
						children: /* @__PURE__ */ jsx(IconButton, {
							onClick: () => setQuicknav(true),
							color: "default",
							children: /* @__PURE__ */ jsx(KeyboardCommandKey, {})
						}, "explore")
					}),
					/* @__PURE__ */ jsx(Tooltip, {
						title: t("focusmode.tooltip.dismiss"),
						slotProps: { popper: tooltipPopperProps },
						children: /* @__PURE__ */ jsx(IconButton, {
							onClick: onDismissClick,
							color: "default",
							children: /* @__PURE__ */ jsx(Close, {})
						}, "dismiss")
					})
				]
			})
		})
	});
};

//#endregion
//#region src/leftnav/v2/LeftNavSlot.tsx
const LeftNavSlot = (props) => {
	const { open: navopen } = useAppLeftNav();
	if (props.render) return props.render(navopen, props);
	if (!props.component) throw new Error("LeftNavSlot: either \"render\" or \"component\" prop must be provided.");
	return props.withProps ? /* @__PURE__ */ jsx(props.component, { ...props }) : /* @__PURE__ */ jsx(props.component, {});
};

//#endregion
//#region src/leftnav/v2/LeftNavMenu.tsx
const LeftNavMenuChildren = ({ users, items, level, context }) => {
	return items.map((child) => ({
		menu: users.validateProps(child.validators) ? /* @__PURE__ */ createElement(LeftNavMenu, {
			...child,
			key: child.id,
			context,
			level: level + 1
		}) : null,
		route: users.validateProps(child.validators) ? /* @__PURE__ */ createElement(LeftNavRoute, {
			...child,
			key: child.id,
			context,
			level
		}) : null,
		action: users.validateProps(child.validators) ? /* @__PURE__ */ createElement(LeftNavAction, {
			...child,
			key: child.id,
			context,
			level
		}) : null,
		slot: users.validateProps(child.validators) ? /* @__PURE__ */ createElement(LeftNavSlot, {
			...child,
			key: child.id,
			context,
			level
		}) : null
	})[child.type]);
};
const LeftNavMenu = (props) => {
	const { id, label, i18nKey, tooltipI18nKey, icon, level, expanded, popped } = props;
	const users = useAppUser();
	const theme = useTheme();
	const pathMatch = usePathMatcher();
	const { open: navopen, closeMenu, toggleMenu } = useAppLeftNav();
	const [popoverTarget, setPopoverTarget] = useState();
	const _level = level ?? 0;
	const _menuOpen = _level === 0 || navopen && expanded;
	const _popoverOpen = !navopen && popped && !!popoverTarget;
	const onClick = useCallback((event) => {
		setPopoverTarget(!navopen ? event.currentTarget : null);
		toggleMenu(id);
	}, [
		id,
		navopen,
		toggleMenu
	]);
	return /* @__PURE__ */ jsx(ClickAwayListener, {
		onClickAway: useCallback(() => {
			if (_popoverOpen) {
				setPopoverTarget(null);
				closeMenu(id);
			}
		}, [
			id,
			_popoverOpen,
			closeMenu
		]),
		children: /* @__PURE__ */ jsxs(Stack, {
			position: "relative",
			className: open ? "open" : null,
			sx: level > 0 && navopen && {
				"&::before": {
					content: "\"\"",
					position: "absolute",
					zIndex: 1,
					left: (theme$1) => `calc(${theme$1.spacing(1.5)} * ${_level} + ${theme$1.spacing(.75)})`,
					top: 40,
					bottom: (theme$1) => theme$1.spacing(.5),
					width: "1px",
					boxShadow: `inset 0 0 0 0.5px ${theme.palette.text.disabled}`,
					transform: "scaleY(0)",
					transformOrigin: "center",
					transition: "transform 200ms ease-out",
					opacity: .4
				},
				"&:hover::before": { transform: _menuOpen && "scaleY(1)" }
			},
			children: [
				(i18nKey || label) && /* @__PURE__ */ jsx(Stack, {
					direction: "row",
					children: /* @__PURE__ */ jsx(LeftNavAction, {
						disableCollapse: true,
						type: "action",
						context: props.context,
						id,
						tooltipI18nKey,
						i18nKey,
						label,
						icon,
						level: _level - 1,
						activeParent: props.route && pathMatch(props.route, { matchEnd: false }),
						action: onClick,
						children: /* @__PURE__ */ jsx(ChevronRight, {
							sx: (theme$1) => ({
								position: "absolute",
								top: "50%",
								right: theme$1.spacing(1),
								width: theme$1.spacing(2),
								height: theme$1.spacing(2),
								transform: `translateY(-50%) ${expanded && navopen && "rotate(90deg)" || popped && !navopen && "rotate(180deg)" || ""}`,
								transition: theme$1.transitions.create("transform", {
									easing: theme$1.transitions.easing.sharp,
									duration: expanded || open ? theme$1.transitions.duration.leavingScreen : theme$1.transitions.duration.enteringScreen
								})
							}),
							fontSize: "inherit"
						})
					})
				}),
				/* @__PURE__ */ jsx(Collapse, {
					in: _menuOpen,
					timeout: 150,
					unmountOnExit: !props.keepMounted,
					children: /* @__PURE__ */ jsx(LeftNavMenuChildren, {
						...props,
						level: _level,
						users
					})
				}),
				!navopen && /* @__PURE__ */ jsx(Popper, {
					open: _popoverOpen,
					anchorEl: popoverTarget,
					placement: "right-start",
					transition: true,
					sx: (theme$1) => ({ zIndex: theme$1.zIndex.appBar + 1 }),
					children: ({ TransitionProps }) => /* @__PURE__ */ jsx(Fade, {
						...TransitionProps,
						timeout: 350,
						children: /* @__PURE__ */ jsx(Paper, {
							elevation: props.level + 2,
							children: /* @__PURE__ */ jsx(LeftNavMenuChildren, {
								...props,
								context: "popper",
								level: _level,
								users
							})
						})
					})
				})
			]
		})
	});
};
const LeftNavMenuRoot = () => {
	const { menus } = useAppLeftNav();
	return menus.map((menu) => /* @__PURE__ */ jsx(LeftNavMenu, {
		...menu,
		context: "accordion",
		level: 0
	}, menu.id));
};

//#endregion
//#region src/overlay/OverlayProvider.tsx
const OverlayDefs = [{
	region: "layout",
	description: "The core layout elements"
}, {
	region: "slot",
	description: "The slots injection points"
}];
const OverlayContext = createContext(void 0);
const OverlayProvider = ({ children }) => {
	const [actives, setActives] = useState([]);
	const [activeProps, setActiveProps] = useState([]);
	const [regions, setRegions] = useState([]);
	const [regionProps, setRegionProps] = useState([]);
	const toggleRegion = useCallback((region) => {
		setRegions((_regions) => {
			if (_regions.includes(region)) return _regions.filter((_region) => _region !== region);
			return [..._regions, region];
		});
	}, [setRegions]);
	const toggleActive = useCallback((active) => {
		setActives((_actives) => {
			if (_actives.includes(active)) return _actives.filter((_active) => _active !== active);
			return [..._actives, active];
		});
	}, [setActives]);
	const queryRegions = useCallback(() => {
		let rCount = 0;
		return regions.map((region) => {
			const elements = document.querySelectorAll(`[data-layout-region="${region}"]`);
			return Array.from(elements).filter((el) => !!el.dataset.layoutId && !!el.dataset.layoutRegion).map((el) => {
				const rect = el.getBoundingClientRect();
				return {
					id: el.dataset.layoutId,
					region: el.dataset.layoutRegion,
					label: `o-${rCount++}`,
					description: el.dataset.layoutId,
					rect
				};
			});
		}).flat();
	}, [regions]);
	const queryActives = useCallback(() => {
		let rCount = 0;
		return actives.map((_id) => {
			const elements = document.querySelectorAll(`[data-layout-id="${_id}"]`);
			return Array.from(elements).filter((el) => !!el.dataset.layoutId && !!el.dataset.layoutRegion).map((el) => {
				const rect = el.getBoundingClientRect();
				return {
					id: el.dataset.layoutId,
					region: el.dataset.layoutRegion,
					label: `o-${rCount++}`,
					description: el.dataset.layoutId,
					rect
				};
			});
		}).flat();
	}, [actives]);
	useEffect(() => {
		if (regions.length === 0) {
			setRegionProps([]);
			return;
		}
		setRegionProps(queryRegions());
	}, [regions, queryRegions]);
	useEffect(() => {
		if (regionProps.length === 0) {
			setActives([]);
			return;
		}
		setActives((_actives) => _actives.filter((a) => regionProps.some((r) => r.id === a)));
	}, [regionProps]);
	useEffect(() => {
		if (actives?.length === 0) {
			setActiveProps([]);
			return;
		}
		setActiveProps(queryActives());
	}, [actives, queryActives]);
	const value = useMemo(() => ({
		actives,
		regions,
		activeProps,
		regionProps,
		setActives,
		setRegions,
		setActiveProps,
		setRegionProps,
		toggleActive,
		toggleRegion
	}), [
		activeProps,
		actives,
		regionProps,
		regions,
		toggleActive,
		toggleRegion
	]);
	return /* @__PURE__ */ jsx(OverlayContext.Provider, {
		value,
		children
	});
};

//#endregion
//#region src/overlay/OverlayShadow.tsx
const OverlayShadow = ({ region, id, children,...boxProps }) => {
	const ctx = useContext(OverlayContext);
	const ref = useRef(null);
	const enabled = useMemo(() => ctx?.regions.includes(region), [region, ctx?.regions]);
	const active = useMemo(() => ctx?.actives.includes(id), [id, ctx?.actives]);
	if (!enabled) return children;
	return /* @__PURE__ */ jsx(Box, {
		ref,
		"data-layout-region": region,
		"data-layout-id": id,
		style: !children ? {
			height: "100%",
			width: active ? 100 : 0
		} : {},
		...boxProps,
		children
	});
};

//#endregion
//#region src/topnav/AppName.tsx
const StyledTitle = styled("div")({
	display: "flex",
	alignItems: "center",
	flex: "0 0 auto",
	fontSize: "1.5rem",
	letterSpacing: "-1px"
});
const StyledIcon = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "0",
	minWidth: `max(${theme.spacing(7)}, 42px)`
}));
const AppName = ({ noName }) => {
	const theme = useTheme();
	const leftnav = useAppLeftNav();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));
	const { brand, appLink } = useAppPreferences();
	const { Link: Link$1 } = useAppRouter();
	const appName = brand?.appName;
	if (isXs) return /* @__PURE__ */ jsxs(StyledTitle, {
		style: { paddingLeft: theme.spacing(2) },
		children: [/* @__PURE__ */ jsx(Tooltip, {
			title: !leftnav.open && appName ? appName : "",
			placement: "right",
			children: /* @__PURE__ */ jsx(StyledIcon, { children: /* @__PURE__ */ jsx(IconButton, {
				"aria-label": "open drawer",
				edge: "start",
				onClick: leftnav.toggle,
				size: "large",
				color: "inherit",
				children: /* @__PURE__ */ jsx(Menu, {})
			}) })
		}), !noName && /* @__PURE__ */ jsx(AppBrand, { variant: "name" })]
	});
	return /* @__PURE__ */ jsx(Link$1, {
		to: appLink,
		style: {
			color: "inherit",
			textDecoration: "none"
		},
		children: /* @__PURE__ */ jsxs(StyledTitle, { children: [/* @__PURE__ */ jsx(Tooltip, {
			title: !leftnav.open && appName ? appName : "",
			placement: "right",
			children: /* @__PURE__ */ jsx(StyledIcon, { children: /* @__PURE__ */ jsx(AppBrand, { variant: "logo" }) })
		}), !noName && /* @__PURE__ */ jsx(Box, {
			ml: 2,
			children: /* @__PURE__ */ jsx(AppBrand, { variant: "name" })
		})] })
	});
};

//#endregion
//#region src/leftnav/LeftNavDrawer.tsx
const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== "open" && prop !== "width" })(({ theme, open: open$1, width }) => ({
	width,
	flexShrink: 0,
	heigth: "100%",
	whiteSpace: "nowrap",
	"@media print": { display: "none !important" },
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen
	}),
	...!open$1 && {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		overflowX: "hidden",
		width: 0,
		[theme.breakpoints.up("sm")]: { width: `max(${theme.spacing(7)}, 42px)` },
		[theme.breakpoints.only("xs")]: { border: "none" }
	},
	"& .MuiDrawer-paper": {
		width,
		overflowX: "hidden",
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		}),
		...!open$1 && {
			transition: theme.transitions.create("width", {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen
			}),
			width: 0,
			[theme.breakpoints.up("sm")]: { width: `max(${theme.spacing(7)}, 42px)` },
			[theme.breakpoints.only("xs")]: { border: "none" }
		}
	}
}));
const LeftNavHeader = () => {
	const theme = useTheme();
	const isTopLayout = useAppLayout().current === "top";
	return /* @__PURE__ */ jsxs(OverlayShadow, {
		region: "layout",
		id: "app-brand",
		children: [/* @__PURE__ */ jsx(Toolbar, {
			sx: { [theme.breakpoints.up("xs")]: { padding: 0 } },
			children: /* @__PURE__ */ jsx(AppName, {})
		}), !isTopLayout && /* @__PURE__ */ jsx(Divider, {})]
	});
};
const LeftNavFooter = () => {
	const leftnav = useAppLeftNav();
	const { t } = useTranslation(MODULE_NAME);
	const onToggle = useCallback(() => {
		if (!leftnav.open) leftnav.collapseMenus();
		leftnav.toggle();
	}, [leftnav]);
	return /* @__PURE__ */ jsx(Tooltip, {
		title: leftnav.open ? t("drawer.collapse") : t("drawer.expand"),
		"aria-label": leftnav.open ? t("drawer.collapse") : t("drawer.expand"),
		placement: "right",
		style: { alignSelf: "flex-start" },
		id: "app-leftnav-footer",
		children: /* @__PURE__ */ jsx(ListItem, {
			disablePadding: true,
			children: /* @__PURE__ */ jsx(ListItemButton, {
				onClick: onToggle,
				sx: (theme) => ({ minHeight: theme.spacing(6) }),
				children: /* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(ChevronRight, { sx: (theme) => ({
					transform: leftnav.open && "rotate(180deg)",
					transition: theme.transitions.create("transform", {
						easing: theme.transitions.easing.sharp,
						duration: leftnav.open ? theme.transitions.duration.leavingScreen : theme.transitions.duration.enteringScreen
					})
				}) }) })
			}, "chevron")
		})
	});
};
const LeftNavDrawer = () => {
	const theme = useTheme();
	const leftnav = useAppLeftNav();
	const { leftnav: leftnavPreference } = useAppPreferences();
	const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
	const onCloseDrawerIfOpen = useCallback(() => {
		if (isSmDown && leftnav.open) leftnav.setOpen(false);
	}, [isSmDown, leftnav]);
	const onToggle = useCallback(() => {
		if (!leftnav.open) leftnav.collapseMenus();
		leftnav.toggle();
	}, [leftnav]);
	return /* @__PURE__ */ jsx(ClickAwayListener, {
		mouseEvent: "onMouseDown",
		touchEvent: "onTouchStart",
		onClickAway: onCloseDrawerIfOpen,
		children: /* @__PURE__ */ jsxs(StyledDrawer, {
			slotProps: { paper: {
				elevation: 1,
				style: {
					display: "flex",
					flexDirection: "column"
				}
			} },
			variant: "permanent",
			style: { height: "100%" },
			width: leftnavPreference.width,
			open: leftnav.open,
			children: [
				/* @__PURE__ */ jsx(LeftNavHeader, {}),
				/* @__PURE__ */ jsx(Stack, {
					sx: {
						overflowY: "auto",
						overflowX: "hidden"
					},
					children: /* @__PURE__ */ jsx(OverlayShadow, {
						region: "layout",
						id: "app-leftnav-menus",
						children: /* @__PURE__ */ jsx(LeftNavMenuRoot, {})
					})
				}),
				/* @__PURE__ */ jsx(Box, {
					sx: {
						flexGrow: 1,
						"&:hover": { cursor: "pointer" }
					},
					onClick: onToggle
				}),
				/* @__PURE__ */ jsx(Divider, {}),
				/* @__PURE__ */ jsx(LeftNavFooter, {})
			]
		})
	});
};
var LeftNavDrawer_default = LeftNavDrawer;

//#endregion
//#region src/breadcrumbs/AppBreadcrumb.tsx
const AppBreadcrumb = ({ text,...props }) => {
	const { Link: Link$1 } = useAppRouter();
	return text ? /* @__PURE__ */ jsx("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			color: "inherit"
		},
		children: /* @__PURE__ */ jsx(TuiBreadcrumb, { ...props })
	}) : /* @__PURE__ */ jsx(Tooltip, {
		title: !props.i18nKey && !props.title ? "missing entry in sitemap" : props.path,
		children: /* @__PURE__ */ jsx(Link, {
			component: Link$1,
			to: props.path,
			underline: "hover",
			style: {
				display: "inline-flex",
				alignItems: "center",
				color: "inherit"
			},
			children: /* @__PURE__ */ jsx(TuiBreadcrumb, { ...props })
		})
	});
};
const TuiBreadcrumb = ({ path, icon, i18nKey, title, width }) => {
	const theme = useTheme();
	const { t } = useTranslation();
	return /* @__PURE__ */ jsxs(Fragment, { children: [icon && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Box, {
		component: "span",
		sx: { marginRight: theme.spacing(.5) }
	}), icon] }), /* @__PURE__ */ jsx("span", {
		style: {
			maxWidth: width || "200px",
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap"
		},
		children: i18nKey ? t(i18nKey) : title || /* @__PURE__ */ jsx(Chip, {
			icon: /* @__PURE__ */ jsx(Error$1, {}),
			variant: "outlined",
			color: "error",
			label: path,
			size: "small",
			clickable: true
		})
	})] });
};

//#endregion
//#region src/breadcrumbs/AppBreadcrumbs.tsx
const AppBreadcrumbs = () => {
	const { items } = useAppBreadcrumbs();
	return /* @__PURE__ */ jsx(Breadcrumbs, {
		id: "breadcrumbs",
		sx: {
			color: "inherit",
			"& li": { display: "flex" },
			"& li:first-of-type": { flex: 1 }
		},
		children: items && items.map((item) => /* @__PURE__ */ jsx(AppBreadcrumb, { ...item }, item.path))
	});
};

//#endregion
//#region src/search/AppSearchInput.tsx
const AppSearchInput = ({ searching, provided, autoFocus, showToggle, value, open: open$1, onClear, onToggleFullscreen, onFocus, onChange, onKeyDown,...inputProps }) => {
	const { t } = useTranslation(MODULE_NAME);
	const rootRef = useRef(void 0);
	const onToggleClick = useCallback(() => {
		if (open$1 && provided) onToggleFullscreen();
		else rootRef.current.querySelector("input").focus();
	}, [
		open$1,
		provided,
		onToggleFullscreen
	]);
	return /* @__PURE__ */ jsx(Stack, {
		direction: "row",
		ref: rootRef,
		children: /* @__PURE__ */ jsx(InputBase, {
			...inputProps,
			fullWidth: true,
			autoComplete: "off",
			autoFocus,
			value,
			onFocus,
			onChange,
			onKeyDown,
			placeholder: t("quicksearch.placeholder"),
			inputProps: { "aria-label": t("quicksearch.aria") },
			startAdornment: /* @__PURE__ */ jsx(InputAdornment, {
				position: "start",
				children: searching ? /* @__PURE__ */ jsx(CircularProgress, {
					size: 24,
					color: "inherit"
				}) : /* @__PURE__ */ jsx(Search, { color: "inherit" })
			}),
			endAdornment: /* @__PURE__ */ jsxs(InputAdornment, {
				position: "end",
				children: [showToggle && /* @__PURE__ */ jsx(Tooltip, {
					title: t(open$1 && provided ? "app.search.fullscreen" : "app.search.shortcut"),
					children: /* @__PURE__ */ jsx(Button, {
						size: "small",
						color: "inherit",
						onClick: onToggleClick,
						children: "CTRL+K"
					})
				}), /* @__PURE__ */ jsx(IconButton, {
					color: "inherit",
					onClick: onClear,
					children: /* @__PURE__ */ jsx(Clear, {})
				})]
			}),
			sx: (theme) => ({
				color: theme.palette.text.secondary,
				width: "100%",
				paddingTop: .5,
				paddingBottom: .5,
				paddingLeft: 1.5,
				paddingRight: 1,
				borderTopLeftRadius: theme.spacing(.5),
				borderTopRightRadius: theme.spacing(.5),
				borderBottomLeftRadius: open$1 ? 0 : theme.spacing(.5),
				borderBottomRightRadius: open$1 ? 0 : theme.spacing(.5)
			})
		})
	});
};
var AppSearchInput_default = memo(AppSearchInput);

//#endregion
//#region src/search/AppSearchResult.tsx
const AppSearchResult = ({ ...menuProps }) => {
	const { t } = useTranslation(MODULE_NAME);
	const { state, service } = useAppSearchService();
	const onKeyDown = (event, item) => {
		const { isEnter: isEnter$1, isEscape: isEscape$1 } = parseEvent(event);
		if (isEnter$1) {
			if (service.onItemSelect) service.onItemSelect(item, state);
		} else if (isEscape$1) state.set({
			...state,
			menu: false
		});
	};
	const options = useMemo(() => state.items?.reduce((_options, _item, index) => ({
		..._options,
		[index]: {
			state,
			index,
			last: index === state.items.length - 1
		}
	}), {}), [state]);
	return /* @__PURE__ */ jsx(MenuList, {
		"data-tui-id": "tui-app-search-result",
		...menuProps,
		children: state.items?.length > 0 ? state.items.map((item, index) => /* @__PURE__ */ jsx(MenuItem, {
			onKeyDown: (event) => onKeyDown(event, item),
			children: service.itemRenderer(item, options[index])
		}, item.id)) : state.items ? /* @__PURE__ */ jsx(AppListEmpty, {}) : /* @__PURE__ */ jsx(MenuItem, {
			disabled: true,
			children: /* @__PURE__ */ jsx(Box, {
				mt: 1,
				mb: 1,
				children: /* @__PURE__ */ jsx(Typography, {
					variant: "body2",
					children: /* @__PURE__ */ jsx("em", { children: t("app.search.starttyping") })
				})
			})
		})
	});
};
var AppSearchResult_default = memo(AppSearchResult);

//#endregion
//#region src/search/AppSearch.tsx
const MENU_LIST_SX = {
	maxHeight: 500,
	overflow: "auto"
};
const AppSearchRoot = styled(Box, { shouldForwardProp: (prop) => prop !== "menuOpen" })(({ theme, menuOpen }) => {
	const backgroundColor = emphasize(theme.palette.background.default, .1);
	return {
		position: "relative",
		borderRadius: theme.shape.borderRadius,
		borderBottomLeftRadius: menuOpen && 0,
		borderBottomRightRadius: menuOpen && 0,
		".app-search-input": {
			backgroundColor: theme.palette.mode === "dark" ? backgroundColor : menuOpen ? theme.palette.background.default : backgroundColor,
			boxShadow: menuOpen && theme.shadows[4]
		},
		".app-search-result": {
			backgroundColor: theme.palette.mode === "dark" ? backgroundColor : theme.palette.background.default,
			borderBottomLeftRadius: theme.shape.borderRadius,
			borderBottomRightRadius: theme.shape.borderRadius,
			boxShadow: menuOpen && theme.shadows[4],
			color: theme.palette.text.primary
		}
	};
});
const ModalTransition = forwardRef(function Transition(props, ref) {
	const { children,..._props } = props;
	return /* @__PURE__ */ jsx(Slide, {
		direction: "down",
		ref,
		..._props,
		children
	});
});
const AppSearch = () => {
	const theme = useTheme();
	const menuRef = useRef(null);
	const { topnav } = useAppPreferences();
	const { t } = useTranslation(MODULE_NAME);
	const { provided, state, service } = useAppSearchService();
	const [value, setValue] = useState("");
	const showSearchIcon = useMediaQuery(theme.breakpoints.down("xl")) || topnav.quickSearchIconOnly;
	useEffect(() => {
		if (service.onMounted) service.onMounted(setValue, state);
	}, []);
	useEffect(() => {
		const keyHandler = (event) => {
			const { key, isCtrl } = parseEvent(event);
			if (isCtrl && key === "k") {
				event.preventDefault();
				const inputRef = menuRef.current.querySelector("input");
				if (provided && !inputRef) state.set({
					...state,
					menu: !state.menu,
					mode: "fullscreen"
				});
				else if (provided && state.menu) state.set({
					...state,
					mode: "fullscreen"
				});
				else inputRef.focus();
			}
		};
		window.addEventListener("keydown", keyHandler);
		return () => {
			window.removeEventListener("keydown", keyHandler);
		};
	}, [provided, state]);
	const onFocus = useCallback(() => {
		state.set({
			...state,
			menu: true
		});
	}, [state]);
	const onChange = useCallback((event) => {
		setValue(event.currentTarget.value);
		if (service.onChange) service.onChange(event.currentTarget.value, state, setValue);
	}, [service, state]);
	const onEnter = useCallback(() => {
		if (service.onEnter) {
			state.set({
				...state,
				menu: true
			});
			service.onEnter(value, state);
		}
	}, [
		value,
		state,
		service
	]);
	const onKeyDown = useCallback((event) => {
		const { isEnter: isEnter$1, isEscape: isEscape$1, isArrowDown: isArrowDown$1 } = parseEvent(event);
		if (isEnter$1) onEnter();
		else if (isEscape$1) state.set({
			...state,
			menu: !state.menu
		});
		else if (isArrowDown$1) {
			const result = document.querySelector("[data-tui-id=\"tui-app-search-result\"]");
			if (result) {
				event.preventDefault();
				result.focus();
			}
		}
	}, [state, onEnter]);
	const onClear = useCallback(() => {
		setValue("");
		state.set({
			...state,
			items: null
		});
	}, [state]);
	const onToggleFullscreen = useCallback(() => {
		state.set({
			...state,
			mode: state.mode === "inline" ? "fullscreen" : "inline"
		});
	}, [state]);
	return /* @__PURE__ */ jsx(ClickAwayListener, {
		onClickAway: () => state.set({
			...state,
			menu: false
		}),
		children: /* @__PURE__ */ jsxs(AppSearchRoot, {
			ref: menuRef,
			sx: { mr: showSearchIcon ? 0 : 1 },
			menuOpen: state.menu,
			children: [showSearchIcon ? /* @__PURE__ */ jsx(IconButton, {
				color: "inherit",
				size: "large",
				onClick: () => state.set({
					...state,
					menu: !state.menu,
					mode: "fullscreen"
				}),
				children: /* @__PURE__ */ jsx(Tooltip, {
					title: /* @__PURE__ */ jsxs(Stack, {
						direction: "column",
						textAlign: "center",
						children: [
							/* @__PURE__ */ jsx("span", { children: t("app.search.fullscreen") }),
							" ",
							/* @__PURE__ */ jsx("span", { children: "CTLR+K" })
						]
					}),
					children: /* @__PURE__ */ jsx(Search, {})
				})
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(AppSearchInput_default, {
				showToggle: true,
				provided,
				className: "app-search-input",
				value,
				searching: state.searching,
				open: state.menu,
				onFocus,
				onChange,
				onKeyDown,
				onClear,
				onToggleFullscreen
			}), provided && /* @__PURE__ */ jsx(Popper, {
				open: state.menu && state.mode === "inline",
				anchorEl: menuRef.current,
				placement: "bottom-end",
				sx: (_theme) => ({
					width: "100%",
					zIndex: _theme.zIndex.appBar + 1
				}),
				disablePortal: true,
				children: /* @__PURE__ */ jsx(AppSearchResult_default, {
					className: "app-search-result",
					sx: MENU_LIST_SX
				})
			})] }), /* @__PURE__ */ jsxs(Dialog, {
				disableRestoreFocus: true,
				fullWidth: true,
				maxWidth: "md",
				open: state.menu && state.mode === "fullscreen",
				onClose: () => state.set({
					...state,
					mode: "inline",
					menu: false
				}),
				sx: {
					maxHeight: "75%",
					margin: 0,
					".MuiDialog-container": { alignItems: "start" }
				},
				slots: { transition: ModalTransition },
				slotProps: { paper: { sx: {
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
					margin: 0,
					width: "100%"
				} } },
				children: [/* @__PURE__ */ jsx(DialogTitle, { children: /* @__PURE__ */ jsx(AppSearchInput_default, {
					autoFocus: true,
					className: "app-search-input",
					style: { backgroundColor: emphasize(theme.palette.background.default, .1) },
					showToggle: false,
					value,
					searching: state.searching,
					open: false,
					onFocus,
					onChange,
					onKeyDown,
					onClear,
					onToggleFullscreen
				}) }), provided && state.items && /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsx(AppSearchResult_default, {}) })]
			})]
		})
	});
};

//#endregion
//#region src/themes/elements/AppDensityPicker.tsx
const AppDensityPicker = () => {
	const { t } = useTranslation(MODULE_NAME);
	const density = useCookiesStore((store) => store.density);
	const setDensity = useCookiesStore((store) => store.setDensity);
	const onChange = (event) => {
		setDensity(event.target.value);
	};
	return /* @__PURE__ */ jsxs(FormControl, {
		fullWidth: true,
		size: "small",
		children: [/* @__PURE__ */ jsx(InputLabel, {
			id: "personalization-density-label",
			children: t("personalization.density")
		}), /* @__PURE__ */ jsxs(Select, {
			id: "personalization-density",
			label: t("personalization.density"),
			labelId: "personalization-density-label",
			value: density,
			onChange,
			children: [
				/* @__PURE__ */ jsx(MenuItem, {
					value: "comfortable",
					children: t("personalization.density.default")
				}),
				/* @__PURE__ */ jsx(MenuItem, {
					value: "compact",
					children: t("personalization.density.compact")
				}),
				/* @__PURE__ */ jsx(MenuItem, {
					value: "dense",
					children: t("personalization.density.dense")
				})
			]
		})]
	});
};

//#endregion
//#region src/themes/elements/AppThemePicker.tsx
const AppThemePicker = () => {
	const { t } = useTranslation(MODULE_NAME);
	const { t: clientT } = useTranslation();
	const { current, themes, setTheme } = useAppTheme();
	const onChange = (event) => {
		setTheme(event.target.value);
	};
	return /* @__PURE__ */ jsxs(FormControl, {
		fullWidth: true,
		size: "small",
		children: [/* @__PURE__ */ jsx(InputLabel, {
			id: "personalization-theme-label",
			children: t("personalization.theme")
		}), /* @__PURE__ */ jsx(Select, {
			id: "personalization-theme",
			label: t("personalization.theme"),
			labelId: "personalization-theme-label",
			value: current.id,
			onChange,
			children: themes.map((_theme) => /* @__PURE__ */ jsx(MenuItem, {
				value: _theme.id,
				children: _theme.i18nKey.startsWith("tui.") ? t(_theme.i18nKey) : clientT(_theme.i18nKey)
			}, _theme.id))
		})]
	});
};

//#endregion
//#region src/topnav/theme/ThemeSelection.tsx
const ThemeSelection = () => {
	const theme = useTheme();
	const layout = useAppLayout();
	const breadcrumbs = useAppBreadcrumbs();
	const appbar = useAppBar();
	const quicksearch = useAppQuickSearch();
	const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
	const { t } = useTranslation(MODULE_NAME);
	const { isFR, toggle: toggleLanguage } = useAppLanguage();
	const { themes, toggleMode: toggleThemeMode } = useAppTheme();
	const resetCookies = useCookiesStore((store) => store.reset);
	const { allowTranslate, allowPersonalization, allowLayoutSelection, allowQuickSearch, allowBreadcrumbs, allowAutoHideTopbar, allowReset, allowThemeSelection, allowDensitySelection } = useAppPreferences();
	return /* @__PURE__ */ jsxs("div", { children: [
		allowTranslate && /* @__PURE__ */ jsx(List, {
			dense: true,
			subheader: /* @__PURE__ */ jsx(ListSubheader, {
				disableSticky: true,
				children: t("app.language")
			}),
			children: /* @__PURE__ */ jsx(ListItemButton, {
				dense: true,
				onClick: toggleLanguage,
				id: "language",
				children: /* @__PURE__ */ jsx(ListItemText, {
					style: { margin: 0 },
					children: /* @__PURE__ */ jsxs("div", {
						style: {
							display: "flex",
							alignItems: "center",
							flexDirection: "row",
							width: "100%",
							textAlign: "center",
							cursor: "pointer"
						},
						children: [
							/* @__PURE__ */ jsx(Typography, {
								component: "div",
								variant: "body2",
								children: "English"
							}),
							/* @__PURE__ */ jsx("div", {
								style: { flexGrow: 1 },
								children: /* @__PURE__ */ jsx(Switch, {
									checked: isFR(),
									name: "langSwitch"
								})
							}),
							/* @__PURE__ */ jsx(Typography, {
								component: "div",
								variant: "body2",
								children: "Français"
							})
						]
					})
				})
			})
		}),
		allowPersonalization && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Divider, {}), /* @__PURE__ */ jsxs(List, {
			dense: true,
			subheader: /* @__PURE__ */ jsx(ListSubheader, {
				disableSticky: true,
				children: t("personalization")
			}),
			children: [
				allowLayoutSelection && /* @__PURE__ */ jsx(ListItem, {
					disablePadding: true,
					secondaryAction: /* @__PURE__ */ jsx(Switch, {
						edge: "end",
						checked: layout.current === "top",
						onClick: layout.toggle
					}),
					children: /* @__PURE__ */ jsx(ListItemButton, {
						onClick: layout.toggle,
						id: "personalization-sticky",
						children: /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.sticky") })
					})
				}),
				allowQuickSearch && !isSmDown && /* @__PURE__ */ jsx(ListItem, {
					disablePadding: true,
					secondaryAction: /* @__PURE__ */ jsx(Switch, {
						edge: "end",
						checked: quicksearch.show,
						onClick: quicksearch.toggle
					}),
					children: /* @__PURE__ */ jsx(ListItemButton, {
						onClick: quicksearch.toggle,
						children: /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.quicksearch") })
					})
				}),
				allowAutoHideTopbar && /* @__PURE__ */ jsx(ListItem, {
					disablePadding: true,
					secondaryAction: /* @__PURE__ */ jsx(Switch, {
						edge: "end",
						disabled: layout.current === "top",
						checked: appbar.autoHide && layout.current !== "top",
						onClick: appbar.toggleAutoHide
					}),
					children: /* @__PURE__ */ jsx(ListItemButton, {
						disabled: layout.current === "top",
						onClick: appbar.toggleAutoHide,
						id: "personalization-autohideappbar",
						children: /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.autohideappbar") })
					})
				}),
				allowBreadcrumbs && !isSmDown && /* @__PURE__ */ jsx(ListItem, {
					disablePadding: true,
					secondaryAction: /* @__PURE__ */ jsx(Switch, {
						edge: "end",
						checked: breadcrumbs.show,
						onClick: breadcrumbs.toggle
					}),
					children: /* @__PURE__ */ jsx(ListItemButton, {
						onClick: breadcrumbs.toggle,
						id: "personalization-showbreadcrumbs",
						children: /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.showbreadcrumbs") })
					})
				})
			]
		})] }),
		allowThemeSelection && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Divider, {}), /* @__PURE__ */ jsxs(List, {
			dense: true,
			subheader: /* @__PURE__ */ jsx(ListSubheader, {
				disableSticky: true,
				children: t("personalization.theme.title")
			}),
			children: [
				themes?.length > 1 && /* @__PURE__ */ jsx(ListItem, {
					sx: { mb: 1 },
					children: /* @__PURE__ */ jsx(AppThemePicker, {})
				}),
				allowDensitySelection && /* @__PURE__ */ jsx(ListItem, { children: /* @__PURE__ */ jsx(AppDensityPicker, {}) }),
				/* @__PURE__ */ jsx(ListItem, {
					disablePadding: true,
					secondaryAction: /* @__PURE__ */ jsx(Switch, {
						edge: "end",
						onChange: toggleThemeMode,
						checked: theme.palette.mode === "dark"
					}),
					children: /* @__PURE__ */ jsx(ListItemButton, {
						onClick: toggleThemeMode,
						id: "personalization-dark",
						children: /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.dark") })
					})
				})
			]
		})] }),
		(allowPersonalization || allowThemeSelection) && allowReset && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Divider, {}), /* @__PURE__ */ jsx(List, {
			dense: true,
			children: /* @__PURE__ */ jsx(ListItemButton, {
				dense: true,
				onClick: resetCookies,
				id: "personalization-reset",
				children: /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.reset_text") })
			})
		})] })
	] });
};
var ThemeSelection_default = memo(ThemeSelection);

//#endregion
//#region src/topnav/theme/ThemeSelectionIcon.tsx
const ThemeSelectionIcon = () => {
	const theme = useTheme();
	const { allowPersonalization, allowTranslate, allowReset } = useAppPreferences();
	const [open$1, setOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const onClickAway = useCallback(() => setOpen(false), []);
	const onThemeSelectionClick = useCallback((event) => {
		setOpen((_open) => !_open);
		setAnchorEl(event.currentTarget);
	}, []);
	return allowPersonalization || allowTranslate || allowReset ? /* @__PURE__ */ jsx(ClickAwayListener, {
		onClickAway,
		mouseEvent: "onMouseUp",
		children: /* @__PURE__ */ jsxs(IconButton, {
			color: "inherit",
			"aria-label": "open drawer",
			onClick: onThemeSelectionClick,
			size: "large",
			children: [/* @__PURE__ */ jsx(Tune, {}), /* @__PURE__ */ jsx(Popper, {
				sx: {
					zIndex: theme.zIndex.drawer + 2,
					minWidth: "280px"
				},
				open: open$1 && anchorEl !== null,
				anchorEl,
				placement: "bottom-end",
				transition: true,
				children: ({ TransitionProps }) => /* @__PURE__ */ jsx(Fade, {
					...TransitionProps,
					timeout: 250,
					children: /* @__PURE__ */ jsx(Paper, {
						style: { padding: theme.spacing(1) },
						elevation: 4,
						children: /* @__PURE__ */ jsx(ThemeSelection_default, {})
					})
				})
			})]
		})
	}) : null;
};
var ThemeSelectionIcon_default = ThemeSelectionIcon;

//#endregion
//#region src/topnav/user/UserProfile.tsx
const UserProfile = () => {
	const theme = useTheme();
	const anchorRef = useRef(void 0);
	const layout = useAppLayout();
	const { location, Link: Link$1 } = useAppRouter();
	const { t: clientT } = useTranslation();
	const { t } = useTranslation(MODULE_NAME);
	const { user } = useAppUser();
	const { allowPersonalization, allowTranslate, allowReset, allowFocusMode, topnav } = useAppPreferences();
	const [open$1, setOpen] = useState(false);
	const renderThemeSelection = useCallback((enabled) => {
		if (enabled && (allowPersonalization || allowTranslate || allowReset)) return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Divider, {}), /* @__PURE__ */ jsx(ThemeSelection_default, {})] });
		return null;
	}, [
		allowPersonalization,
		allowTranslate,
		allowReset
	]);
	const renderMenu = useCallback((type, menuItems, title, i18nKey, withDivider = true) => {
		if (menuItems !== void 0 && menuItems !== null && menuItems.length !== 0) return /* @__PURE__ */ jsxs("div", { children: [withDivider && /* @__PURE__ */ jsx(Divider, {}), /* @__PURE__ */ jsxs(List, {
			dense: true,
			subheader: /* @__PURE__ */ jsx(ListSubheader, {
				disableSticky: true,
				children: i18nKey ? clientT(i18nKey) : title
			}),
			children: [type === "usermenu" && allowFocusMode && /* @__PURE__ */ jsx(Tooltip, {
				title: t("personalization.focus.mode.tooltip"),
				placement: "top",
				children: /* @__PURE__ */ jsx(ListItem, {
					disablePadding: true,
					children: /* @__PURE__ */ jsxs(ListItemButton, {
						onClick: () => layout.setFocus((_focus) => !_focus),
						id: "personalization-focusmode",
						children: [/* @__PURE__ */ jsx(ListItemIcon, { children: /* @__PURE__ */ jsx(ZoomOutMap, {}) }), /* @__PURE__ */ jsx(ListItemText, { children: t("personalization.focus.mode.label") })]
					})
				})
			}), menuItems.map((a, i) => a.element ? /* @__PURE__ */ jsx(ListItem, { children: a.element }, `${type}-${i}`) : /* @__PURE__ */ jsxs(ListItemButton, {
				component: Link$1,
				to: a.route,
				children: [a.icon && /* @__PURE__ */ jsx(ListItemIcon, { children: a.icon }), /* @__PURE__ */ jsx(ListItemText, { children: a.i18nKey ? clientT(a.i18nKey) : a.title })]
			}, `${type}-${i}`))]
		})] });
		return null;
	}, [
		t,
		clientT,
		allowFocusMode,
		layout,
		Link$1
	]);
	useEffect(() => {
		if (open$1) setOpen(false);
	}, [location.pathname]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(IconButton, {
		ref: anchorRef,
		edge: "end",
		sx: {
			padding: 0,
			marginLeft: theme.spacing(1),
			marginRight: theme.spacing(1)
		},
		onClick: () => setOpen(!open$1),
		onMouseUp: (e) => e.stopPropagation(),
		size: "large",
		children: /* @__PURE__ */ jsx(AppUserAvatar, {
			alt: user.name,
			url: user.avatar,
			email: user.email,
			id: "user-avatar",
			children: user.name.split(" ", 2).map((n) => n[0].toUpperCase()).join("")
		})
	}), /* @__PURE__ */ jsx(ClickAwayListener, {
		onClickAway: () => setOpen(false),
		mouseEvent: "onMouseUp",
		children: /* @__PURE__ */ jsx(Popper, {
			sx: {
				zIndex: theme.zIndex.appBar + 200,
				minWidth: "280px"
			},
			open: open$1,
			anchorEl: anchorRef.current,
			placement: "bottom-end",
			transition: true,
			children: ({ TransitionProps }) => /* @__PURE__ */ jsx(Fade, {
				...TransitionProps,
				timeout: 250,
				children: /* @__PURE__ */ jsxs(Paper, {
					style: {
						padding: theme.spacing(1),
						maxHeight: "calc(100vh - 80px)",
						display: "flex",
						flexDirection: "column"
					},
					elevation: 4,
					children: [/* @__PURE__ */ jsx(List, {
						disablePadding: true,
						sx: {
							position: "sticky",
							top: 0,
							zIndex: 1,
							boxShadow: 0,
							borderRadius: 0,
							borderBottom: `1px solid ${theme.palette.divider}`
						},
						component: Paper,
						elevation: 4,
						children: /* @__PURE__ */ jsx(ListItem, {
							disableGutters: true,
							dense: true,
							children: /* @__PURE__ */ jsxs(Box, {
								sx: {
									display: "flex",
									paddingTop: 2,
									paddingBottom: 2,
									paddingLeft: 3,
									paddingRight: 3,
									alignItems: "center"
								},
								children: [/* @__PURE__ */ jsx(AppAvatar, {
									sx: {
										width: theme.spacing(8),
										height: theme.spacing(8)
									},
									alt: user.name,
									url: user.avatar,
									email: user.email,
									children: user.name.split(" ", 2).map((n) => n[0].toUpperCase()).join("")
								}), /* @__PURE__ */ jsxs(Box, {
									sx: { paddingLeft: 2 },
									children: [/* @__PURE__ */ jsx(Typography, {
										variant: "body1",
										noWrap: true,
										children: /* @__PURE__ */ jsx("b", { children: user.name })
									}), /* @__PURE__ */ jsx(Typography, {
										variant: "caption",
										noWrap: true,
										children: user.email
									})]
								})]
							})
						})
					}), /* @__PURE__ */ jsxs(Box, {
						sx: {
							overflowY: "auto",
							flex: 1
						},
						children: [
							renderMenu("usermenu", topnav.profile?.menus?.user?.slot, topnav.profile?.menus?.user?.title, topnav.profile?.menus?.user?.i18nKey, false),
							user.is_admin && renderMenu("adminmenu", topnav.profile?.menus?.admin?.slot, topnav.profile?.menus?.admin?.title, topnav.profile?.menus?.admin?.i18nKey),
							renderThemeSelection(topnav.themeSelectionMode === "profile")
						]
					})]
				})
			})
		})
	})] });
};

//#endregion
//#region src/topnav/AppBar.tsx
const SlotOverlayShadow = ({ id, children }) => {
	return /* @__PURE__ */ jsx(OverlayShadow, {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		region: "slot",
		id,
		children
	});
};
const AppBarBase = ({ children }) => {
	const layout = useAppLayout();
	const appbar = useAppBar();
	const isTopLayout = layout.current === "top";
	const autoHide = !isTopLayout && appbar.autoHide;
	const elevation = useMemo(() => {
		if (layout.current === "side") return 0;
		return 1;
	}, [layout]);
	return /* @__PURE__ */ jsx(AppBar, {
		"data-layout-region": "layout",
		"data-layout-id": "app-topnav",
		id: "appbar",
		position: autoHide && !isTopLayout ? "relative" : "sticky",
		elevation,
		sx: (theme) => ({
			"@media print": { display: "none !important" },
			[theme.breakpoints.only("xs")]: { zIndex: theme.zIndex.drawer - 1 },
			color: theme.palette.text.primary,
			backgroundColor: theme.palette.background.paper,
			...isTopLayout ? { zIndex: theme.zIndex.drawer + 1 } : {}
		}),
		children
	});
};
const AppBar$1 = () => {
	const muiTheme = useTheme();
	const layout = useAppLayout();
	const breadcrumbs = useAppBreadcrumbs();
	const quicksearch = useAppQuickSearch();
	const { topnav } = useAppPreferences();
	const isXs = useMediaQuery(muiTheme.breakpoints.only("xs"));
	const isMdDown = useMediaQuery(muiTheme.breakpoints.down("md"));
	const isTopLayout = layout.current === "top";
	const showBreadcrumbs = breadcrumbs.show && !isMdDown;
	useLayoutEffect(() => {
		window.dispatchEvent(new CustomEvent(APPBAR_READY_EVENT));
	}, []);
	const renderLeft = useCallback(() => /* @__PURE__ */ jsxs(Box, {
		sx: {
			height: "100%",
			display: "flex",
			flexDirection: "row",
			alignItems: "center"
		},
		children: [
			(isTopLayout || isXs) && /* @__PURE__ */ jsx(AppName, { noName: isXs }),
			/* @__PURE__ */ jsx(Box, { sx: { ...isTopLayout && { marginLeft: 3 } } }),
			/* @__PURE__ */ jsx(SlotOverlayShadow, {
				id: "topnav.slots.left",
				children: topnav.slots?.left
			}),
			/* @__PURE__ */ jsx(SlotOverlayShadow, {
				id: "topnav.slots.breadcrumbs.left",
				children: topnav.slots?.breadcrumbs?.left
			}),
			showBreadcrumbs && /* @__PURE__ */ jsx(AppBreadcrumbs, {}),
			/* @__PURE__ */ jsx(SlotOverlayShadow, {
				id: "topnav.slots.breadcrumbs.right",
				children: topnav.slots?.breadcrumbs?.right
			})
		]
	}), [
		topnav.slots,
		showBreadcrumbs,
		isXs,
		isTopLayout
	]);
	return /* @__PURE__ */ jsx(AppBarBase, { children: /* @__PURE__ */ jsxs(Toolbar, {
		disableGutters: true,
		style: {
			paddingLeft: !isXs && !isTopLayout ? muiTheme.spacing(2) : null,
			paddingRight: muiTheme.spacing(1)
		},
		children: [
			renderLeft(),
			/* @__PURE__ */ jsx("div", { style: { flex: 1 } }),
			/* @__PURE__ */ jsx(SlotOverlayShadow, {
				id: "topnav.slots.search.left",
				children: topnav.slots?.search?.left
			}),
			quicksearch.show && /* @__PURE__ */ jsx(AppSearch, {}),
			/* @__PURE__ */ jsx(SlotOverlayShadow, {
				id: "topnav.slots.search.right",
				children: topnav.slots?.search?.right
			}),
			topnav.themeSelectionMode === "icon" && /* @__PURE__ */ jsx(ThemeSelectionIcon_default, {}),
			!topnav.hideUserAvatar && /* @__PURE__ */ jsx(UserProfile, {}),
			/* @__PURE__ */ jsx(SlotOverlayShadow, {
				id: "topnav.slots.right",
				children: topnav.slots?.right
			})
		]
	}) });
};
var AppBar_default = AppBar$1;

//#endregion
//#region src/app/providers/AppLayoutProvider.tsx
const AppHorizontal = styled("div")({
	"@media print": { overflow: "unset !important" },
	height: "100%",
	display: "flex",
	flexDirection: "column"
});
const AppVertical = styled("div")({
	height: "100%",
	display: "flex",
	flexDirection: "row",
	position: "relative"
});
const AppVerticalLeft = styled("div")(({ theme }) => ({
	height: "100%",
	[theme.breakpoints.down("md")]: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0
	}
}));
const AppVerticalRight = styled("div")({
	"@media print": {
		overflow: "unset !important",
		paddingLeft: "unset !important"
	},
	display: "flex",
	flexDirection: "column",
	position: "relative",
	flex: 1,
	height: "100%",
	minWidth: 0
});
const AppContent = styled(OverlayShadow)({
	display: "flex",
	flexDirection: "column",
	position: "relative",
	flex: 1,
	height: "100%",
	minWidth: 0
});
const AppLayoutProvider = ({ children }) => {
	const muiTheme = useTheme();
	const user = useAppUser();
	const isSM = useMediaQuery(muiTheme.breakpoints.only("sm"));
	const current = useCookiesStore((state) => state.layout);
	const setCurrent = useCookiesStore((state) => state.setLayout);
	const [ready, setReady] = useState(false);
	const [showMenus, setShowMenus] = useState(true);
	const [focus, setFocus] = useState(false);
	const [quicknav, setQuicknav] = useState(false);
	const [focusctrl, setFocusctrl] = useState({
		open: false,
		flexDirection: "row"
	});
	const toggle = useCallback(() => setCurrent(current === "top" ? "side" : "top"), [current, setCurrent]);
	const mode = useMemo(() => {
		return focus ? "focus" : current;
	}, [focus, current]);
	const showNavs = useMemo(() => {
		return !focus && showMenus;
	}, [focus, showMenus]);
	const _setFocus = useCallback((value) => {
		const nextValue = typeof value === "function" ? value(focus) : value;
		setFocus(nextValue);
		setFocusctrl((_focusctrl) => ({
			..._focusctrl,
			open: nextValue
		}));
	}, [focus]);
	const context = useMemo(() => {
		return {
			initialized: true,
			mode,
			ready,
			current,
			setReady,
			toggle,
			setFocus: _setFocus,
			hideMenus: () => setShowMenus(false),
			showMenus: () => setShowMenus(true)
		};
	}, [
		current,
		mode,
		ready,
		setReady,
		toggle,
		_setFocus
	]);
	return /* @__PURE__ */ jsxs(AppLayoutContext.Provider, {
		value: context,
		children: [
			/* @__PURE__ */ jsx(CssBaseline, { enableColorScheme: true }),
			ready && /* @__PURE__ */ jsx(AppFocusControl, {
				focus,
				setFocus: _setFocus,
				quicknav,
				setQuicknav,
				focusctrl,
				setFocusctrl
			}),
			ready && /* @__PURE__ */ jsx(AppCommands, {
				open: quicknav,
				setOpen: setQuicknav
			}),
			{
				side: /* @__PURE__ */ jsxs(AppVertical, { children: [/* @__PURE__ */ jsx(AppVerticalLeft, { children: user.isReady() && ready && showNavs && /* @__PURE__ */ jsx(LeftNavDrawer_default, {}) }), /* @__PURE__ */ jsxs(AppVerticalRight, {
					id: "app-scrollct",
					style: {
						overflow: "auto",
						paddingLeft: showNavs && isSM ? `max(${muiTheme.spacing(7)}, 42px)` : 0
					},
					children: [user.isReady() && ready && showNavs && /* @__PURE__ */ jsx(AppBar_default, {}), /* @__PURE__ */ jsx(AppContent, {
						region: "layout",
						id: "app-content",
						children
					})]
				})] }),
				top: /* @__PURE__ */ jsxs(AppHorizontal, {
					id: "app-scrollct",
					style: { overflow: "auto" },
					children: [user.isReady() && ready && showNavs && /* @__PURE__ */ jsx(AppBar_default, {}), /* @__PURE__ */ jsxs(AppVertical, { children: [/* @__PURE__ */ jsx(AppVerticalLeft, { children: user.isReady() && ready && showNavs && /* @__PURE__ */ jsx(LeftNavDrawer_default, {}) }), /* @__PURE__ */ jsx(AppVerticalRight, {
						style: { paddingLeft: showNavs && isSM ? `max(${muiTheme.spacing(7)}, 42px)` : 0 },
						children: /* @__PURE__ */ jsx(AppContent, {
							region: "layout",
							id: "app-content",
							children
						})
					})] })]
				})
			}[current]
		]
	});
};
var AppLayoutProvider_default = AppLayoutProvider;

//#endregion
//#region src/app/providers/AppLeftNavProvider.tsx
const AppLeftNavProvider = ({ children }) => {
	const { leftnav } = useAppPreferences();
	const drawerOpen = useCookiesStore((state) => state.drawerOpen);
	const setDrawerOpen = useCookiesStore((state) => state.setDrawerOpen);
	const [menus, setMenus] = useState();
	const _menus = useMemo(() => menus || leftnav.menus, [menus, leftnav.menus]);
	const toggle = useCallback(() => {
		setDrawerOpen(!drawerOpen);
	}, [drawerOpen, setDrawerOpen]);
	const updateMenu = useCallback((menuId, updater) => {
		setMenus(_menus.map((_menu) => ({
			..._menu,
			items: visit(_menu.items, (child) => child.type === "menu" && child.id === menuId, (child) => updater(child))
		})));
	}, [_menus]);
	const toggleMenu = useCallback((menuId) => {
		setMenus(_menus.map((_menu) => ({
			..._menu,
			items: visit(_menu.items, (child) => child.type === "menu" && child.id === menuId, (child) => ({
				...child,
				expanded: drawerOpen ? !child.expanded : child.expanded,
				popped: drawerOpen ? child.popped : !child.popped
			}))
		})));
	}, [_menus, drawerOpen]);
	const closeMenu = useCallback((menuId) => {
		setMenus(_menus.map((_menu) => ({
			..._menu,
			items: visit(_menu.items, (child) => child.type === "menu" && child.id === menuId, (child) => ({
				...child,
				expanded: drawerOpen ? false : child.expanded,
				popped: drawerOpen ? child.popped : false
			}))
		})));
	}, [_menus, drawerOpen]);
	const openMenu = useCallback((menuId) => {
		setMenus(_menus.map((_menu) => ({
			..._menu,
			items: visit(_menu.items, (child) => child.type === "menu" && child.id === menuId, (child) => ({
				...child,
				expanded: drawerOpen ? true : child.expanded,
				popped: drawerOpen ? child.popped : true
			}))
		})));
	}, [_menus, drawerOpen]);
	const collapseMenus = useCallback(() => {
		setMenus(_menus.map((_menu) => ({
			..._menu,
			items: visit(_menu.items, (child) => child.type === "menu", (child) => ({
				...child,
				expanded: drawerOpen ? false : child.expanded,
				popped: drawerOpen ? child.popped : false
			}))
		})));
	}, [_menus, drawerOpen]);
	const expandMenus = useCallback(() => {
		setMenus(_menus.map((_menu) => ({
			..._menu,
			items: visit(_menu.items, (child) => child.type === "menu", (child) => ({
				...child,
				expanded: drawerOpen ? true : child.expanded,
				popped: drawerOpen ? child.popped : true
			}))
		})));
	}, [_menus, drawerOpen]);
	const value = useMemo(() => ({
		initialized: true,
		menus: _menus,
		open: drawerOpen,
		setOpen: setDrawerOpen,
		toggle,
		toggleMenu,
		closeMenu,
		openMenu,
		updateMenu,
		collapseMenus,
		expandMenus,
		setMenus
	}), [
		_menus,
		drawerOpen,
		setDrawerOpen,
		toggle,
		toggleMenu,
		closeMenu,
		openMenu,
		updateMenu,
		collapseMenus,
		expandMenus
	]);
	return /* @__PURE__ */ jsx(AppLeftNavContext.Provider, {
		value,
		children
	});
};
var AppLeftNavProvider_default = AppLeftNavProvider;

//#endregion
//#region src/app/providers/AppSnackbarProvider.tsx
const StyledSnackbarProvider = styled(SnackbarProvider)`
  & .SnackbarItem-message {
    word-break: break-all;
  }
`;
const ThemedSnackbar = forwardRef(function ThemedSnackbar$1(props, ref) {
	const theme = useTheme();
	const { variant } = props;
	return /* @__PURE__ */ jsx(SnackbarContent, {
		ref,
		sx: useMemo(() => {
			if (variant === "default") return {
				backgroundColor: theme.palette.background.default,
				color: theme.palette.getContrastText(theme.palette.background.default),
				boxShadow: 4
			};
			return {
				bgcolor: theme.palette[variant].main,
				color: theme.palette.getContrastText(theme.palette[variant].main),
				boxShadow: 1
			};
		}, [theme, variant]),
		classes: props.classes,
		action: props.action,
		message: props.message,
		role: props.role
	});
});
const AppSnackbarProvider = ({ children }) => {
	return /* @__PURE__ */ jsx(StyledSnackbarProvider, {
		Components: {
			success: ThemedSnackbar,
			error: ThemedSnackbar,
			info: ThemedSnackbar,
			warning: ThemedSnackbar,
			default: ThemedSnackbar
		},
		children
	});
};
var AppSnackbarProvider_default = AppSnackbarProvider;

//#endregion
//#region src/app/providers/AppUserProvider.tsx
const AppUserProvider = ({ service, children }) => {
	const value = useMemo(() => ({
		...service,
		initialized: true
	}), [service]);
	return /* @__PURE__ */ jsx(AppUserContext.Provider, {
		value,
		children
	});
};
var AppUserProvider_default = AppUserProvider;

//#endregion
//#region src/app/AppProvider.tsx
const AppLayoutSlot = ({ preferences, children }) => {
	if (preferences?.slots?.layout) return /* @__PURE__ */ jsx(preferences.slots.layout, { children });
	return children;
};
const AppProvider = ({ router, user, search, preferences, children }) => {
	const contextValue = useMemo(() => {
		return {
			initialized: true,
			router,
			preferences
		};
	}, [router, preferences]);
	return /* @__PURE__ */ jsx(AppContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsx(AppUserProvider_default, {
			service: user,
			children: /* @__PURE__ */ jsx(AppSnackbarProvider_default, { children: /* @__PURE__ */ jsx(AppBarProvider_default, {
				search,
				children: /* @__PURE__ */ jsx(AppBreadcrumbsProvider_default, { children: /* @__PURE__ */ jsx(AppLeftNavProvider_default, { children: /* @__PURE__ */ jsx(AppLayoutSlot, {
					preferences,
					children: /* @__PURE__ */ jsx(AppLayoutProvider_default, { children })
				}) }) })
			}) })
		})
	});
};

//#endregion
//#region src/themes/theme-chill.ts
const BASE_LAYER$3 = {
	D1: "#000000",
	D1_5: "#0E0E0E",
	D2: "#171717",
	D2_5: "#232323",
	D3: "#2E2E2E",
	D4: "#464646",
	D5: "#5D5D5D",
	D6: "#747474",
	D7: "#8B8B8B",
	D8: "#A2A2A2",
	D9: "#B9B9B9",
	D10: "#D1D1D1",
	D11: "#E8E8E8",
	D11_5: "#F5F5F5",
	D12: "#FFFFFF"
};
const ACCENT_LAYER$3 = {
	dark: { SECONDARY: "#9575cd" },
	light: { SECONDARY: "#512da8" }
};
const OPACITY_LAYER$3 = {
	dark: {
		ACTION_ACTIVE: "rgba(255, 255, 255, 0.65)",
		ACTION_ACTIVE_OPACITY: .65,
		ACTION_DISABLED: "rgba(93, 93, 93, 0.4)",
		ACTION_DISABLED_OPACITY: .4,
		ACTION_FOCUS: "rgba(255, 255, 255, 0.16)",
		ACTION_FOCUS_OPACITY: .16,
		ACTION_HOVER: "rgba(255, 255, 255, 0.12)",
		ACTION_HOVER_OPACITY: .12,
		ACTION_SELECTED: "rgba(255, 255, 255, 0.20)",
		ACTION_SELECTED_OPACITY: .2,
		DIVIDER: "rgba(255, 255, 255, 0.12)",
		DIVIDER_OPACITY: .12,
		TEXT_DISABLED: "rgba(255, 255, 255, 0.27)",
		TEXT_DISABLED_OPACITY: .27,
		TEXT_PRIMARY: "rgba(255, 255, 255, 0.64)",
		TEXT_PRIMARY_OPACITY: .64,
		TEXT_SECONDARY: "rgba(255, 255, 255, 0.45)",
		TEXT_SECONDARY_OPACITY: .45
	},
	light: {
		ACTION_ACTIVE: "rgba(0, 0, 0, 0.65)",
		ACTION_ACTIVE_OPACITY: .65,
		ACTION_DISABLED: "rgba(185, 185, 185, 0.4)",
		ACTION_DISABLED_OPACITY: .4,
		ACTION_FOCUS: "rgba(0, 0, 0, 0.14)",
		ACTION_FOCUS_OPACITY: .14,
		ACTION_HOVER: "rgba(0, 0, 0, 0.12)",
		ACTION_HOVER_OPACITY: .12,
		ACTION_SELECTED: "rgba(0, 0, 0, 0.16)",
		ACTION_SELECTED_OPACITY: .16,
		DIVIDER: "rgba(0, 0, 0, 0.10)",
		DIVIDER_OPACITY: .1,
		TEXT_DISABLED: "rgba(0, 0, 0, 0.3)",
		TEXT_DISABLED_OPACITY: .3,
		TEXT_PRIMARY: "rgba(0, 0, 0, 0.75)",
		TEXT_PRIMARY_OPACITY: .75,
		TEXT_SECONDARY: "rgba(0, 0, 0, 0.47)",
		TEXT_SECONDARY_OPACITY: .47
	}
};
const CHILL_THEME = {
	id: "tui.theme.chill",
	default: true,
	i18nKey: "tui.theme.chill",
	configs: {
		light: { palette: {
			mode: "light",
			background: {
				default: BASE_LAYER$3.D12,
				paper: BASE_LAYER$3.D12
			},
			secondary: { main: ACCENT_LAYER$3.light.SECONDARY },
			text: {
				primary: OPACITY_LAYER$3.light.TEXT_PRIMARY,
				secondary: OPACITY_LAYER$3.light.TEXT_SECONDARY,
				disabled: OPACITY_LAYER$3.light.TEXT_DISABLED
			},
			divider: OPACITY_LAYER$3.light.DIVIDER,
			action: {
				hover: OPACITY_LAYER$3.light.ACTION_HOVER,
				hoverOpacity: OPACITY_LAYER$3.light.ACTION_HOVER_OPACITY,
				focus: OPACITY_LAYER$3.light.ACTION_FOCUS,
				focusOpacity: OPACITY_LAYER$3.light.ACTION_FOCUS_OPACITY,
				selected: OPACITY_LAYER$3.light.ACTION_SELECTED,
				selectedOpacity: OPACITY_LAYER$3.light.ACTION_SELECTED_OPACITY,
				active: OPACITY_LAYER$3.light.ACTION_ACTIVE,
				activatedOpacity: OPACITY_LAYER$3.light.ACTION_ACTIVE_OPACITY,
				disabled: OPACITY_LAYER$3.light.ACTION_DISABLED,
				disabledOpacity: OPACITY_LAYER$3.light.ACTION_DISABLED_OPACITY
			}
		} },
		dark: {
			palette: {
				mode: "dark",
				background: {
					default: BASE_LAYER$3.D1,
					paper: BASE_LAYER$3.D1
				},
				secondary: { main: ACCENT_LAYER$3.dark.SECONDARY },
				text: {
					primary: OPACITY_LAYER$3.dark.TEXT_PRIMARY,
					secondary: OPACITY_LAYER$3.dark.TEXT_SECONDARY,
					disabled: OPACITY_LAYER$3.dark.TEXT_DISABLED
				},
				divider: OPACITY_LAYER$3.dark.DIVIDER,
				action: {
					hover: OPACITY_LAYER$3.dark.ACTION_HOVER,
					hoverOpacity: OPACITY_LAYER$3.dark.ACTION_HOVER_OPACITY,
					focus: OPACITY_LAYER$3.dark.ACTION_FOCUS,
					focusOpacity: OPACITY_LAYER$3.dark.ACTION_FOCUS_OPACITY,
					selected: OPACITY_LAYER$3.dark.ACTION_SELECTED,
					selectedOpacity: OPACITY_LAYER$3.dark.ACTION_SELECTED_OPACITY,
					active: OPACITY_LAYER$3.dark.ACTION_ACTIVE,
					activatedOpacity: OPACITY_LAYER$3.dark.ACTION_ACTIVE_OPACITY,
					disabled: OPACITY_LAYER$3.dark.ACTION_DISABLED,
					disabledOpacity: OPACITY_LAYER$3.dark.ACTION_DISABLED_OPACITY
				}
			},
			components: { MuiCssBaseline: { styleOverrides: { body: {
				scrollbarWidth: "thin",
				scrollbarColor: `${BASE_LAYER$3.D4} transparent`,
				"&::-webkit-scrollbar": {
					width: "8px",
					height: "8px"
				},
				"&::-webkit-scrollbar-track": { background: "transparent" },
				"&::-webkit-scrollbar-thumb": {
					backgroundColor: BASE_LAYER$3.D4,
					borderRadius: "4px",
					border: `2px solid ${BASE_LAYER$3.D4}`
				}
			} } } }
		}
	}
};

//#endregion
//#region src/themes/theme-default.ts
const BASE_LAYER$2 = {
	D1: "#202020",
	D2: "#2C2C2C",
	D3: "#383838",
	D4: "#444444",
	D5: "#515151",
	D6: "#5F5F5F",
	D7: "#6D6D6D",
	D8: "#8A8A8A",
	D9: "#A7A7A7",
	D10: "#C4C4C4",
	D11: "#E1E1E1",
	D11_5: "#F5F5F5",
	D12: "#FFFFFF"
};
const ACCENT_LAYER$2 = {
	dark: {
		PRIMARY: "#7DA1DB",
		SECONDARY: "#C0DEEC"
	},
	light: {
		PRIMARY: "#0062BF",
		SECONDARY: "#619CB7"
	}
};
const OPACITY_LAYER$2 = {
	dark: {
		ACTION_ACTIVE: "rgba(255, 255, 255, 0.7)",
		ACTION_ACTIVE_OPACITY: .7,
		ACTION_DISABLED: "rgba(109, 109, 109, 0.4)",
		ACTION_DISABLED_OPACITY: .4,
		ACTION_FOCUS: "rgba(255, 255, 255, 0.16)",
		ACTION_FOCUS_OPACITY: .16,
		ACTION_HOVER: "rgba(255, 255, 255, 0.08)",
		ACTION_HOVER_OPACITY: .08,
		ACTION_SELECTED: "rgba(255, 255, 255, 0.24)",
		ACTION_SELECTED_OPACITY: .24,
		DIVIDER: "rgba(255, 255, 255, 0.12)",
		DIVIDER_OPACITY: .12,
		TEXT_DISABLED: "rgba(255, 255, 255, 0.5)",
		TEXT_DISABLED_OPACITY: .5,
		TEXT_PRIMARY: "rgba(255, 255, 255, 0.87)",
		TEXT_PRIMARY_OPACITY: .87,
		TEXT_SECONDARY: "rgba(255, 255, 255, 0.6)",
		TEXT_SECONDARY_OPACITY: .6
	},
	light: {
		ACTION_ACTIVE: "rgba(0, 0, 0, 0.54)",
		ACTION_ACTIVE_OPACITY: .54,
		ACTION_DISABLED: "rgba(167, 167, 167, 0.4)",
		ACTION_DISABLED_OPACITY: .4,
		ACTION_FOCUS: "rgba(0, 0, 0, 0.12)",
		ACTION_FOCUS_OPACITY: .12,
		ACTION_HOVER: "rgba(0, 0, 0, 0.10)",
		ACTION_HOVER_OPACITY: .1,
		ACTION_SELECTED: "rgba(0, 0, 0, 0.16)",
		ACTION_SELECTED_OPACITY: .16,
		DIVIDER: "rgba(0, 0, 0, 0.12)",
		DIVIDER_OPACITY: .12,
		TEXT_DISABLED: "rgba(0, 0, 0, 0.38)",
		TEXT_DISABLED_OPACITY: .38,
		TEXT_PRIMARY: "rgba(0, 0, 0, 0.87)",
		TEXT_PRIMARY_OPACITY: .87,
		TEXT_SECONDARY: "rgba(0, 0, 0, 0.6)",
		TEXT_SECONDARY_OPACITY: .6
	}
};
const DEFAULT_THEME = {
	id: "tui.theme.default",
	default: true,
	i18nKey: "tui.theme.default",
	configs: {
		light: { palette: {
			mode: "light",
			background: {
				default: BASE_LAYER$2.D12,
				paper: BASE_LAYER$2.D12
			},
			primary: { main: ACCENT_LAYER$2.light.PRIMARY },
			secondary: { main: ACCENT_LAYER$2.light.SECONDARY },
			text: {
				primary: OPACITY_LAYER$2.light.TEXT_PRIMARY,
				secondary: OPACITY_LAYER$2.light.TEXT_SECONDARY,
				disabled: OPACITY_LAYER$2.light.TEXT_DISABLED
			},
			divider: OPACITY_LAYER$2.light.DIVIDER,
			action: {
				hover: OPACITY_LAYER$2.light.ACTION_HOVER,
				hoverOpacity: OPACITY_LAYER$2.light.ACTION_HOVER_OPACITY,
				focus: OPACITY_LAYER$2.light.ACTION_FOCUS,
				focusOpacity: OPACITY_LAYER$2.light.ACTION_FOCUS_OPACITY,
				selected: OPACITY_LAYER$2.light.ACTION_SELECTED,
				selectedOpacity: OPACITY_LAYER$2.light.ACTION_SELECTED_OPACITY,
				active: OPACITY_LAYER$2.light.ACTION_ACTIVE,
				activatedOpacity: OPACITY_LAYER$2.light.ACTION_ACTIVE_OPACITY,
				disabled: OPACITY_LAYER$2.light.ACTION_DISABLED,
				disabledOpacity: OPACITY_LAYER$2.light.ACTION_DISABLED_OPACITY
			}
		} },
		dark: {
			palette: {
				mode: "dark",
				background: {
					default: BASE_LAYER$2.D1,
					paper: BASE_LAYER$2.D1
				},
				primary: { main: ACCENT_LAYER$2.dark.PRIMARY },
				secondary: { main: ACCENT_LAYER$2.dark.SECONDARY },
				text: {
					primary: OPACITY_LAYER$2.dark.TEXT_PRIMARY,
					secondary: OPACITY_LAYER$2.dark.TEXT_SECONDARY,
					disabled: OPACITY_LAYER$2.dark.TEXT_DISABLED
				},
				divider: OPACITY_LAYER$2.dark.DIVIDER,
				action: {
					hover: OPACITY_LAYER$2.dark.ACTION_HOVER,
					hoverOpacity: OPACITY_LAYER$2.dark.ACTION_HOVER_OPACITY,
					focus: OPACITY_LAYER$2.dark.ACTION_FOCUS,
					focusOpacity: OPACITY_LAYER$2.dark.ACTION_FOCUS_OPACITY,
					selected: OPACITY_LAYER$2.dark.ACTION_SELECTED,
					selectedOpacity: OPACITY_LAYER$2.dark.ACTION_SELECTED_OPACITY,
					active: OPACITY_LAYER$2.dark.ACTION_ACTIVE,
					activatedOpacity: OPACITY_LAYER$2.dark.ACTION_ACTIVE_OPACITY,
					disabled: OPACITY_LAYER$2.dark.ACTION_DISABLED,
					disabledOpacity: OPACITY_LAYER$2.dark.ACTION_DISABLED_OPACITY
				}
			},
			components: { MuiCssBaseline: { styleOverrides: { body: {
				scrollbarWidth: "thin",
				scrollbarColor: `${BASE_LAYER$2.D6} transparent`,
				"&::-webkit-scrollbar": {
					width: "8px",
					height: "8px"
				},
				"&::-webkit-scrollbar-track": { background: "transparent" },
				"&::-webkit-scrollbar-thumb": {
					backgroundColor: BASE_LAYER$2.D6,
					borderRadius: "4px",
					border: `2px solid ${BASE_LAYER$2.D6}`
				}
			} } } }
		}
	}
};

//#endregion
//#region src/themes/theme-hc.tsx
const BASE_LAYER$1 = {
	D1: "#000000",
	D2: "#111111",
	D3: "#222222",
	D4: "#333333",
	D5: "#555555",
	D6: "#777777",
	D7: "#999999",
	D8: "#BBBBBB",
	D9: "#DDDDDD",
	D10: "#EEEEEE",
	D11: "#F8F8F8",
	D12: "#FFFFFF"
};
const ACCENT_LAYER$1 = {
	dark: {
		BLUE: "#00BFFF",
		GREEN: "#00FF66",
		ORANGE: "#FFAA00",
		PURPLE: "#CC33FF",
		RED: "#FF4444",
		YELLOW: "#FFFF33"
	},
	light: {
		BLUE: "#005BFF",
		GREEN: "#008800",
		ORANGE: "#FF6600",
		PURPLE: "#6600CC",
		RED: "#CC0000",
		YELLOW: "#FFCC00"
	}
};
const OPACITY_LAYER$1 = {
	dark: {
		ACTION_ACTIVE: "rgba(255, 255, 255, 1)",
		ACTION_ACTIVE_OPACITY: 1,
		ACTION_DISABLED: "rgba(255, 255, 255, 0.5)",
		ACTION_DISABLED_OPACITY: .5,
		ACTION_DISABLED_BACKGROUND: "rgba(255, 255, 255, 0.15)",
		ACTION_FOCUS: "rgba(255, 255, 255, 0.3)",
		ACTION_FOCUS_OPACITY: .3,
		ACTION_HOVER: "rgba(255, 255, 255, 0.25)",
		ACTION_HOVER_OPACITY: .25,
		ACTION_SELECTED: "rgba(255, 255, 255, 0.35)",
		ACTION_SELECTED_OPACITY: .35,
		DIVIDER: "rgba(255, 255, 255, 1)",
		DIVIDER_OPACITY: 1,
		TEXT_DISABLED: "rgba(255, 255, 255, 0.6)",
		TEXT_DISABLED_OPACITY: .6,
		TEXT_PRIMARY: "rgba(255, 255, 255, 1)",
		TEXT_PRIMARY_OPACITY: 1,
		TEXT_SECONDARY: "rgba(255, 255, 255, 0.87)",
		TEXT_SECONDARY_OPACITY: .87
	},
	light: {
		ACTION_ACTIVE: "rgba(0, 0, 0, 1)",
		ACTION_ACTIVE_OPACITY: 1,
		ACTION_DISABLED: "rgba(0, 0, 0, 0.5)",
		ACTION_DISABLED_OPACITY: .5,
		ACTION_DISABLED_BACKGROUND: "rgba(0, 0, 0, 0.15)",
		ACTION_FOCUS: "rgba(0, 0, 0, 0.3)",
		ACTION_FOCUS_OPACITY: .3,
		ACTION_HOVER: "rgba(0, 0, 0, 0.25)",
		ACTION_HOVER_OPACITY: .25,
		ACTION_SELECTED: "rgba(0, 0, 0, 0.35)",
		ACTION_SELECTED_OPACITY: .35,
		DIVIDER: "rgba(0, 0, 0, 1)",
		DIVIDER_OPACITY: 1,
		TEXT_DISABLED: "rgba(0, 0, 0, 0.6)",
		TEXT_DISABLED_OPACITY: .6,
		TEXT_PRIMARY: "rgba(0, 0, 0, 1)",
		TEXT_PRIMARY_OPACITY: 1,
		TEXT_SECONDARY: "rgba(0, 0, 0, 0.87)",
		TEXT_SECONDARY_OPACITY: .87
	}
};
const HC_THEME = {
	id: "tui.theme.hc",
	default: true,
	i18nKey: "tui.theme.hc",
	configs: {
		light: {
			palette: {
				mode: "light",
				background: {
					default: BASE_LAYER$1.D12,
					paper: BASE_LAYER$1.D12
				},
				text: {
					primary: OPACITY_LAYER$1.light.TEXT_PRIMARY,
					secondary: OPACITY_LAYER$1.light.TEXT_SECONDARY,
					disabled: OPACITY_LAYER$1.light.TEXT_DISABLED
				},
				primary: { main: ACCENT_LAYER$1.light.BLUE },
				secondary: { main: ACCENT_LAYER$1.light.PURPLE },
				error: { main: ACCENT_LAYER$1.light.RED },
				info: { main: ACCENT_LAYER$1.light.ORANGE },
				success: { main: ACCENT_LAYER$1.light.GREEN },
				warning: { main: ACCENT_LAYER$1.light.YELLOW },
				divider: OPACITY_LAYER$1.light.DIVIDER,
				action: {
					hover: OPACITY_LAYER$1.light.ACTION_HOVER,
					hoverOpacity: OPACITY_LAYER$1.light.ACTION_HOVER_OPACITY,
					focus: OPACITY_LAYER$1.light.ACTION_FOCUS,
					focusOpacity: OPACITY_LAYER$1.light.ACTION_FOCUS_OPACITY,
					selected: OPACITY_LAYER$1.light.ACTION_SELECTED,
					selectedOpacity: OPACITY_LAYER$1.light.ACTION_SELECTED_OPACITY,
					active: OPACITY_LAYER$1.light.ACTION_ACTIVE,
					activatedOpacity: OPACITY_LAYER$1.light.ACTION_ACTIVE_OPACITY,
					disabled: OPACITY_LAYER$1.light.ACTION_DISABLED,
					disabledOpacity: OPACITY_LAYER$1.light.ACTION_DISABLED_OPACITY,
					disabledBackground: OPACITY_LAYER$1.light.ACTION_DISABLED_BACKGROUND
				}
			},
			components: {
				MuiCssBaseline: { styleOverrides: {
					".tui-navitem:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					".tui-navitem:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					".tui-appdrawer": {
						border: "1px solid",
						borderColor: OPACITY_LAYER$1.light.DIVIDER
					}
				} },
				MuiDrawer: { styleOverrides: { paper: {
					border: "1px solid",
					borderColor: OPACITY_LAYER$1.light.DIVIDER
				} } },
				MuiButton: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&:selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					}
				} } },
				MuiIconButton: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					}
				} } },
				MuiListItemButton: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					}
				} } },
				MuiAccordionSummary: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.light.BLUE
					}
				} } },
				MuiList: { styleOverrides: { root: { marginTop: "2px" } } }
			}
		},
		dark: {
			palette: {
				mode: "dark",
				background: {
					default: BASE_LAYER$1.D1,
					paper: BASE_LAYER$1.D1
				},
				text: {
					primary: OPACITY_LAYER$1.dark.TEXT_PRIMARY,
					secondary: OPACITY_LAYER$1.dark.TEXT_SECONDARY,
					disabled: OPACITY_LAYER$1.dark.TEXT_DISABLED
				},
				primary: { main: ACCENT_LAYER$1.dark.BLUE },
				secondary: { main: ACCENT_LAYER$1.dark.PURPLE },
				error: { main: ACCENT_LAYER$1.dark.RED },
				info: { main: ACCENT_LAYER$1.dark.ORANGE },
				success: { main: ACCENT_LAYER$1.dark.GREEN },
				warning: { main: ACCENT_LAYER$1.dark.YELLOW },
				divider: OPACITY_LAYER$1.dark.DIVIDER,
				action: {
					hover: OPACITY_LAYER$1.dark.ACTION_HOVER,
					hoverOpacity: OPACITY_LAYER$1.dark.ACTION_HOVER_OPACITY,
					focus: OPACITY_LAYER$1.dark.ACTION_FOCUS,
					focusOpacity: OPACITY_LAYER$1.dark.ACTION_FOCUS_OPACITY,
					selected: OPACITY_LAYER$1.dark.ACTION_SELECTED,
					selectedOpacity: OPACITY_LAYER$1.dark.ACTION_SELECTED_OPACITY,
					active: OPACITY_LAYER$1.dark.ACTION_ACTIVE,
					activatedOpacity: OPACITY_LAYER$1.dark.ACTION_ACTIVE_OPACITY,
					disabled: OPACITY_LAYER$1.dark.ACTION_DISABLED,
					disabledOpacity: OPACITY_LAYER$1.dark.ACTION_DISABLED_OPACITY,
					disabledBackground: OPACITY_LAYER$1.dark.ACTION_DISABLED_BACKGROUND
				}
			},
			components: {
				MuiCssBaseline: { styleOverrides: {
					".tui-navitem:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					".tui-navitem:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					".tui-appdrawer": {
						border: "1px solid",
						borderColor: OPACITY_LAYER$1.dark.DIVIDER
					}
				} },
				MuiDrawer: { styleOverrides: { paper: {
					border: "1px solid",
					borderColor: OPACITY_LAYER$1.dark.DIVIDER
				} } },
				MuiButton: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					}
				} } },
				MuiIconButton: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					}
				} } },
				MuiListItemButton: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					}
				} } },
				MuiAccordionSummary: { styleOverrides: { root: {
					"&:hover": {
						outline: "2px dashed",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&.Mui-selected": {
						outline: "2px solid",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					},
					"&:focus": {
						outline: "2px dotted",
						outlineColor: ACCENT_LAYER$1.dark.BLUE
					}
				} } },
				MuiList: { styleOverrides: { root: { marginTop: "2px" } } }
			}
		}
	}
};

//#endregion
//#region src/themes/theme-solarized.ts
const BASE_LAYER = {
	D1: "#00242D",
	D2: "#002B36",
	D3: "#04323D",
	D4: "#073642",
	D4_5: "#23444F",
	D5: "#3F535D",
	D6: "#586E75",
	D7: "#5F7980",
	D8: "#657B83",
	D9: "#839496",
	D10: "#93A1A1",
	D10_5: "#C1C5BB",
	D11: "#EEE8D5",
	D11_5: "#F6EFDC",
	D12: "#FDF6E3"
};
const ACCENT_LAYER = {
	dark: {
		BLUE: "#268BD2",
		BLUE_BRIGHT: "#4FA3DC",
		CYAN: "#2AA198",
		CYAN_BRIGHT: "#56B8B1",
		GREEN: "#859900",
		MAGENTA: "#D33682",
		ORANGE: "#CB4B16",
		RED: "#DC322F",
		VIOLET: "#6C71C4",
		YELLOW: "#B58900"
	},
	light: {
		BLUE: "#268BD2",
		BLUE_BRIGHT: "#4FA3DC",
		CYAN: "#2AA198",
		CYAN_BRIGHT: "#56B8B1",
		GREEN: "#859900",
		MAGENTA: "#D33682",
		ORANGE: "#CB4B16",
		RED: "#DC322F",
		VIOLET: "#6C71C4",
		YELLOW: "#B58900"
	}
};
const OPACITY_LAYER = {
	light: {
		ACTION_ACTIVE: "rgba(0, 36, 45, 0.54)",
		ACTION_ACTIVE_OPACITY: .54,
		ACTION_DISABLED: "rgba(0, 36, 45, 0.40)",
		ACTION_DISABLED_OPACITY: .4,
		ACTION_FOCUS: "rgba(0, 36, 45, 0.14)",
		ACTION_FOCUS_OPACITY: .14,
		ACTION_HOVER: "rgba(0, 36, 45, 0.10)",
		ACTION_HOVER_OPACITY: .1,
		ACTION_SELECTED: "rgba(0, 36, 45, 0.16)",
		ACTION_SELECTED_OPACITY: .16,
		DIVIDER: "rgba(0, 36, 45, 0.18)",
		DIVIDER_OPACITY: .18,
		TEXT_PRIMARY: "rgba(0, 36, 45, 0.87)",
		TEXT_PRIMARY_OPACITY: .87,
		TEXT_SECONDARY: "rgba(0, 36, 45, 0.60)",
		TEXT_SECONDARY_OPACITY: .6
	},
	dark: {
		ACTION_ACTIVE: "rgba(253, 246, 227, 0.70)",
		ACTION_ACTIVE_OPACITY: .7,
		ACTION_DISABLED: "rgba(253, 246, 227, 0.40)",
		ACTION_DISABLED_OPACITY: .4,
		ACTION_FOCUS: "rgba(253, 246, 227, 0.14)",
		ACTION_FOCUS_OPACITY: .14,
		ACTION_HOVER: "rgba(253, 246, 227, 0.10)",
		ACTION_HOVER_OPACITY: .1,
		ACTION_SELECTED: "rgba(253, 246, 227, 0.16)",
		ACTION_SELECTED_OPACITY: .16,
		DIVIDER: "rgba(253, 246, 227, 0.18)",
		DIVIDER_OPACITY: .18,
		TEXT_PRIMARY: "rgba(253, 246, 227, 0.87)",
		TEXT_PRIMARY_OPACITY: .87,
		TEXT_SECONDARY: "rgba(253, 246, 227, 0.60)",
		TEXT_SECONDARY_OPACITY: .6
	}
};
const SOLARIZED_THEME = {
	id: "tui.theme.solarized",
	i18nKey: "tui.theme.solarized",
	configs: {
		light: {
			palette: {
				mode: "light",
				background: {
					default: BASE_LAYER.D12,
					paper: BASE_LAYER.D12
				},
				primary: {
					main: ACCENT_LAYER.light.BLUE,
					contrastText: BASE_LAYER.D12
				},
				secondary: {
					main: ACCENT_LAYER.light.CYAN,
					contrastText: BASE_LAYER.D12
				},
				success: { main: ACCENT_LAYER.light.GREEN },
				warning: { main: ACCENT_LAYER.light.YELLOW },
				error: { main: ACCENT_LAYER.light.RED },
				info: { main: ACCENT_LAYER.light.VIOLET },
				divider: OPACITY_LAYER.light.DIVIDER,
				action: {
					hover: OPACITY_LAYER.light.ACTION_HOVER,
					hoverOpacity: OPACITY_LAYER.light.ACTION_HOVER_OPACITY,
					focus: OPACITY_LAYER.light.ACTION_FOCUS,
					focusOpacity: OPACITY_LAYER.light.ACTION_FOCUS_OPACITY,
					selected: OPACITY_LAYER.light.ACTION_SELECTED,
					selectedOpacity: OPACITY_LAYER.light.ACTION_SELECTED_OPACITY,
					active: OPACITY_LAYER.light.ACTION_ACTIVE,
					activatedOpacity: OPACITY_LAYER.light.ACTION_ACTIVE_OPACITY,
					disabled: OPACITY_LAYER.light.ACTION_DISABLED,
					disabledOpacity: OPACITY_LAYER.light.ACTION_DISABLED_OPACITY
				}
			},
			components: {
				MuiCssBaseline: { styleOverrides: { body: {
					scrollbarWidth: "thin",
					scrollbarColor: `${BASE_LAYER.D10} transparent`,
					"&::-webkit-scrollbar": {
						width: "8px",
						height: "8px"
					},
					"&::-webkit-scrollbar-track": { background: "transparent" },
					"&::-webkit-scrollbar-thumb": {
						backgroundColor: BASE_LAYER.D10,
						borderRadius: "4px",
						border: `2px solid ${BASE_LAYER.D10}`
					}
				} } },
				MuiInputAdornment: { styleOverrides: { root: { color: "inherit" } } }
			}
		},
		dark: {
			palette: {
				mode: "dark",
				background: {
					default: BASE_LAYER.D2,
					paper: BASE_LAYER.D2
				},
				primary: { main: ACCENT_LAYER.dark.BLUE_BRIGHT },
				secondary: { main: ACCENT_LAYER.dark.CYAN_BRIGHT },
				success: { main: ACCENT_LAYER.dark.GREEN },
				warning: { main: ACCENT_LAYER.dark.YELLOW },
				error: { main: ACCENT_LAYER.dark.RED },
				info: { main: ACCENT_LAYER.dark.VIOLET },
				text: {
					primary: OPACITY_LAYER.dark.TEXT_PRIMARY,
					secondary: OPACITY_LAYER.dark.TEXT_SECONDARY
				},
				divider: OPACITY_LAYER.dark.DIVIDER,
				action: {
					hover: OPACITY_LAYER.dark.ACTION_HOVER,
					hoverOpacity: OPACITY_LAYER.dark.ACTION_HOVER_OPACITY,
					focus: OPACITY_LAYER.dark.ACTION_FOCUS,
					focusOpacity: OPACITY_LAYER.dark.ACTION_FOCUS_OPACITY,
					selected: OPACITY_LAYER.dark.ACTION_SELECTED,
					selectedOpacity: OPACITY_LAYER.dark.ACTION_SELECTED_OPACITY,
					active: OPACITY_LAYER.dark.ACTION_ACTIVE,
					activatedOpacity: OPACITY_LAYER.dark.ACTION_ACTIVE_OPACITY,
					disabled: OPACITY_LAYER.dark.ACTION_DISABLED,
					disabledOpacity: OPACITY_LAYER.dark.ACTION_DISABLED_OPACITY
				}
			},
			components: {
				MuiCssBaseline: { styleOverrides: { body: {
					scrollbarWidth: "thin",
					scrollbarColor: `${BASE_LAYER.D6} transparent`,
					"&::-webkit-scrollbar": {
						width: "8px",
						height: "8px"
					},
					"&::-webkit-scrollbar-track": { background: "transparent" },
					"&::-webkit-scrollbar-thumb": {
						backgroundColor: BASE_LAYER.D6,
						borderRadius: "4px",
						border: `2px solid ${BASE_LAYER.D6}`
					}
				} } },
				MuiInputAdornment: { styleOverrides: { root: { color: "inherit" } } }
			}
		}
	}
};

//#endregion
//#region src/themes/elements/AppDensity.tsx
const AppDensity = ({ density, children }) => {
	const outerTheme = useTheme();
	const theme = useMemo(() => {
		const overrides = getDensityThemeOverrides(density);
		if (!Object.keys(overrides).length) return outerTheme;
		return createTheme(merge({}, outerTheme, overrides));
	}, [outerTheme, density]);
	if (theme === outerTheme) return children;
	return /* @__PURE__ */ jsx(ThemeProvider, {
		theme,
		children
	});
};

//#endregion
//#region src/themes/index.ts
const TUI_THEMES = [
	DEFAULT_THEME,
	CHILL_THEME,
	SOLARIZED_THEME,
	HC_THEME
];

//#endregion
//#region src/app/AppRoot.tsx
const AppRoot = ({ i18n: i18n$1, cookies, themes, children }) => {
	return /* @__PURE__ */ jsx(AppCookiesProvider, {
		cookies,
		i18n: i18n$1,
		children: /* @__PURE__ */ jsxs(AppThemesProvider, {
			themes: themes ?? TUI_THEMES,
			children: [/* @__PURE__ */ jsx(CssBaseline, { enableColorScheme: true }), children]
		})
	});
};

//#endregion
//#region src/i18n/en.json
var en_default = {
	actions: "Actions",
	"app.language": "Language",
	"app.search.fullscreen": "Activate fullscreen search",
	"app.search.starttyping": "Start typing and/or press ENTER",
	"clipboard.failure": "could not be copied to clipboard",
	"clipboard.success": "was copied to clipboard.",
	"drawer.collapse": "Collapse drawer",
	"drawer.expand": "Expand drawer",
	"focusmode.snackbar.2": "Use <strong>CTLR + /</strong> to exit focus mode from Quick Commands menu",
	"focusmode.toolitp.draghandle": "Click and hold to move",
	"focusmode.tooltip.dismiss": "Dismiss and stay in focus mode",
	"focusmode.tooltip.exit": "Exit focus mode",
	personalization: "Personalization",
	"personalization.autohideappbar": "Auto Hide Topbar",
	"personalization.dark": "Dark Mode",
	"personalization.density": "Density",
	"personalization.density.compact": "Compact",
	"personalization.density.default": "Default",
	"personalization.density.dense": "Dense",
	"personalization.focus.mode.label": "Focus Mode",
	"personalization.focus.mode.tooltip": "Focus mode removes all navigation elements (e.g., left nav and top bar) from the application layout.",
	"personalization.quicksearch": "Show Quick Search",
	"personalization.reset_text": "Reset to site defaults",
	"personalization.showbreadcrumbs": "Show Breadcrumbs",
	"personalization.sticky": "Sticky Topbar",
	"personalization.theme": "Theme",
	"personalization.theme.title": "Theme Options",
	"quick.command.enter.tooltip": "Open quick commands menu",
	"quick.command.text.field.label": "Search quick commands...",
	"quicksearch.aria": "search",
	"quicksearch.placeholder": "Search...",
	routes: "Routes",
	"tui.theme.chill": "Chill",
	"tui.theme.default": "Default",
	"tui.theme.hc": "High Constrast",
	"tui.theme.solarized": "Solarized"
};

//#endregion
//#region src/i18n/fr.json
var fr_default = {
	actions: "Actions",
	"app.language": "Langue",
	"app.search.fullscreen": "Activer la recherche plein écran",
	"app.search.starttyping": "Commencez à taper et/ou appuyez sur ENTRÉE",
	"clipboard.failure": "n'a pas pu être copié dans le presse-papiers.",
	"clipboard.success": "a été copié dans le presse-papiers.",
	"drawer.collapse": "Fermer le menu",
	"drawer.expand": "Ouvrir le menu",
	"focusmode.snackbar.2": "Utilisez <strong>CTLR + /</strong> pour quitter le mode focus depuis le menu de Commendes Rapides",
	"focusmode.toolitp.draghandle": "Cliquez et maintenez le bouton enfoncé pour déplacer",
	"focusmode.tooltip.dismiss": "Ignorer et rester en mode focus",
	"focusmode.tooltip.exit": "Quitter le mode de mise au point",
	personalization: "Personnalisation",
	"personalization.autohideappbar": "Masquer la barre supérieure",
	"personalization.dark": "Mode sombre",
	"personalization.density": "Densité",
	"personalization.density.compact": "Compact",
	"personalization.density.default": "Défaut",
	"personalization.density.dense": "Dense",
	"personalization.focus.mode.label": "Mode Focus",
	"personalization.focus.mode.tooltip": "Le mode Focus supprime tous les éléments de navigation, par ex. navigation de gauche et barre supérieure, à partir de la présentation de l'application.",
	"personalization.quicksearch": "Afficher recherche rapide",
	"personalization.reset_text": "Réinitialiser les paramètres",
	"personalization.showbreadcrumbs": "Afficher fils d'ariane",
	"personalization.sticky": "Barre supérieure toujours affichée",
	"personalization.theme": "Thème",
	"personalization.theme.title": "Options thème",
	"quick.command.enter.tooltip": "Ouvrir le menu de commande rapide",
	"quick.command.text.field.label": "Rechercher les commendes rapides...",
	"quicksearch.aria": "recherche",
	"quicksearch.placeholder": "Recherche...",
	routes: "Routes",
	"tui.theme.chill": "Chill",
	"tui.theme.default": "Défaut",
	"tui.theme.hc": "Contraste élevé",
	"tui.theme.solarized": "Solarized"
};

//#endregion
//#region src/i18n/index.ts
function addTranslations(i18n$1) {
	i18n$1.addResourceBundle("en", MODULE_NAME, en_default);
	i18n$1.addResourceBundle("fr", MODULE_NAME, fr_default);
}

//#endregion
//#region src/overlay/OverlayLabel.tsx
const OverlayLabel = ({ label, rect }) => {
	const bgColor = useTheme().palette.background.paper;
	const overlayBg = `rgba(${parseInt(bgColor.slice(1, 3), 16)}, ${parseInt(bgColor.slice(3, 5), 16)}, ${parseInt(bgColor.slice(5, 7), 16)}, 0.85)`;
	const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
	const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
	return /* @__PURE__ */ jsx(Paper, {
		elevation: 1,
		sx: {
			position: "fixed",
			top: rect.top + scrollY,
			left: rect.left + scrollX,
			width: rect.width,
			height: rect.height,
			bgcolor: overlayBg,
			border: "1px dashed",
			borderColor: "primary.main",
			pointerEvents: "none",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 9999,
			textAlign: "center",
			fontSize: 12
		},
		children: /* @__PURE__ */ jsx(Typography, {
			fontWeight: 600,
			children: label
		})
	});
};

//#endregion
//#region src/overlay/index.ts
const useAppOverlay = () => {
	return useContext(OverlayContext);
};

//#endregion
//#region src/pages/hooks/usePageProps.tsx
const PagePropsDefaults = {
	margin: null,
	mt: 2,
	mr: 2,
	mb: 2,
	ml: 2
};
const usePageProps = ({ props, defaultOverrides = PagePropsDefaults }) => {
	const { className, width, height, margin, mt, mr, mb, ml } = {
		...PagePropsDefaults,
		...defaultOverrides,
		...props
	};
	const theme = useTheme();
	const divider = useMediaQuery(theme.breakpoints.up("md")) ? 1 : 2;
	return useMemo(() => ({
		className,
		style: {
			width,
			height,
			marginBottom: theme.spacing(margin !== null ? margin / divider : mb / divider),
			marginLeft: theme.spacing(margin !== null ? margin / divider : ml / divider),
			marginRight: theme.spacing(margin !== null ? margin / divider : mr / divider),
			marginTop: theme.spacing(margin !== null ? margin / divider : mt / divider)
		}
	}), [
		className,
		width,
		height,
		margin,
		mt,
		mr,
		mb,
		ml,
		divider,
		theme
	]);
};

//#endregion
//#region src/pages/PageCardCentered.tsx
const StyledCard = styled(Card)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	position: "absolute",
	left: "50%",
	top: "50%",
	transform: "translate(-50%, -50%)",
	maxWidth: "22rem",
	backgroundColor: theme.palette.background.paper,
	borderRadius: "4px",
	[theme.breakpoints.down("sm")]: {
		backgroundColor: theme.palette.background.default,
		width: "100%",
		maxWidth: "22rem",
		padding: "0rem 1rem 3rem"
	},
	[theme.breakpoints.up("sm")]: {
		width: "22rem",
		padding: "0 2rem 3rem"
	}
}));
const PageCardCenteredInternal = ({ children }) => {
	return /* @__PURE__ */ jsx(StyledCard, {
		elevation: useMediaQuery(useTheme().breakpoints.only("xs")) ? 0 : 4,
		children
	});
};
const PageCardCentered = memo(PageCardCenteredInternal);

//#endregion
//#region src/pages/PageContent.tsx
const PageContentInternal = ({ children,...props }) => {
	return /* @__PURE__ */ jsx("div", {
		...usePageProps({ props }),
		children
	});
};
const PageContent = memo(PageContentInternal);

//#endregion
//#region src/pages/PageCenter.tsx
const PageCenterInternal = ({ children, height, width = "95%", maxWidth = "1200px", textAlign = "center",...props }) => {
	return /* @__PURE__ */ jsx(Box, {
		component: "div",
		height,
		width,
		maxWidth,
		sx: (theme) => ({
			height,
			width,
			textAlign,
			display: "flex",
			flexDirection: "column",
			margin: "0 auto 0 auto",
			maxWidth,
			[theme.breakpoints.down("sm")]: { maxWidth: "100%" }
		}),
		children: /* @__PURE__ */ jsx(PageContent, {
			...props,
			height: "100%",
			children
		})
	});
};
const PageCenter = memo(PageCenterInternal);

//#endregion
//#region src/pages/PageFullScreen.tsx
const PageFullscreenInternal = ({ children, margin = null, mb = 2, ml = 2, mr = 2, mt = 2, fsIconPos = "sticky" }) => {
	const maximizableElement = useRef(null);
	const appBarHeight = useAppBarHeight();
	const layout = useAppLayout();
	const appbar = useAppBar();
	let isFullscreen;
	let setIsFullscreen;
	let fullscreenSupported;
	const barWillHide = layout.current !== "top" && appbar.autoHide;
	try {
		[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
	} catch {
		fullscreenSupported = false;
		isFullscreen = false;
		setIsFullscreen = void 0;
	}
	const handleEnterFullscreen = useCallback(() => {
		setIsFullscreen();
	}, [setIsFullscreen]);
	const handleExitFullscreen = () => {
		document.exitFullscreen();
	};
	return /* @__PURE__ */ jsxs(Box, {
		ref: maximizableElement,
		component: "div",
		sx: (theme) => ({ backgroundColor: theme.palette.background.default }),
		children: [/* @__PURE__ */ jsx(Box, {
			component: "div",
			sx: (theme) => ({
				top: barWillHide || isFullscreen ? 0 : appBarHeight,
				float: "right",
				paddingTop: theme.spacing(2),
				position: fsIconPos,
				right: theme.spacing(2),
				zIndex: theme.zIndex.appBar + 1
			}),
			children: fullscreenSupported ? null : isFullscreen ? /* @__PURE__ */ jsx(IconButton, {
				onClick: handleExitFullscreen,
				size: "large",
				children: /* @__PURE__ */ jsx(FullscreenExit, {})
			}) : /* @__PURE__ */ jsx(IconButton, {
				onClick: handleEnterFullscreen,
				size: "large",
				children: /* @__PURE__ */ jsx(Fullscreen, {})
			})
		}), /* @__PURE__ */ jsx(PageContent, {
			margin,
			mb,
			ml,
			mr,
			mt,
			children
		})]
	});
};
const PageFullscreen = memo(PageFullscreenInternal);

//#endregion
//#region src/pages/PageFullWidth.tsx
const PageFullWidthInternal = ({ children, height, margin = null, mb = 2, ml = 2, mr = 2, mt = 2 }) => {
	return /* @__PURE__ */ jsx(PageContent, {
		width: "100%",
		height,
		margin,
		mb,
		ml,
		mr,
		mt,
		children
	});
};
const PageFullWidth = memo(PageFullWidthInternal);

//#endregion
//#region src/pages/PageHeader.tsx
const PageHeaderInternal = ({ children, left, right, actions: actions$2, backgroundColor, className, isSticky = false, top = null, elevation = 0 }) => {
	const theme = useTheme();
	const layout = useAppLayout();
	const appbar = useAppBar();
	const appBarHeight = useAppBarHeight();
	const barWillHide = layout.current !== "top" && appbar.autoHide;
	return /* @__PURE__ */ jsxs(AppBar, {
		id: "header1",
		position: isSticky ? "sticky" : "relative",
		style: {
			top: top !== null ? top : isSticky ? barWillHide ? 0 : appBarHeight : null,
			backgroundColor: backgroundColor || theme.palette.background.default,
			zIndex: !isSticky ? theme.zIndex.appBar - 100 : null
		},
		className,
		elevation,
		color: "inherit",
		children: [children, (left || right || actions$2) && /* @__PURE__ */ jsxs(Toolbar, {
			style: { minHeight: 0 },
			disableGutters: true,
			children: [
				/* @__PURE__ */ jsx("div", {
					style: { flexGrow: 1 },
					children: left
				}),
				/* @__PURE__ */ jsx("div", { children: actions$2 && actions$2.map((a, i) => {
					let act = null;
					if (a.title) act = /* @__PURE__ */ jsx(Button, {
						startIcon: a.icon,
						color: a.color,
						onClick: a.action,
						...a.btnProp,
						style: { marginRight: theme.spacing(1) },
						children: a.title
					}, a.tooltip ? null : a.key ? a.key : `ph-action-${i}`);
					else act = /* @__PURE__ */ jsx(IconButton, {
						color: a.color,
						onClick: a.action,
						...a.btnProp,
						style: { marginRight: theme.spacing(1) },
						size: "large",
						children: a.icon
					}, a.tooltip ? null : a.key ? a.key : `ph-action-${i}`);
					return a.tooltip ? /* @__PURE__ */ jsx(Tooltip, {
						title: a.tooltip,
						children: act
					}, a.key ? a.key : `ph-action-${i}`) : act;
				}) }),
				/* @__PURE__ */ jsx("div", { children: right })
			]
		})]
	});
};
const PageHeader = memo(PageHeaderInternal);

//#endregion
//#region src/skeleton/AppSkeleton.tsx
const StyledContainer = styled("div")(({ theme }) => ({
	position: "fixed",
	zIndex: theme.zIndex.appBar + 1e3,
	top: 0,
	left: 0,
	right: 0,
	bottom: 0
}));
const StyledTopLayout = styled("div")({
	height: "100%",
	display: "flex",
	flexDirection: "column"
});
const StyledLeftLayout = styled("div")({
	height: "100%",
	display: "flex",
	flexDirection: "row"
});
const StyledContent = styled("div")(({ theme }) => ({
	display: "flex",
	flexDirection: "row",
	flex: 1,
	backgroundColor: theme.palette.background.default
}));
const StyledContentLeft = styled("div")(({ theme }) => ({
	border: "1px solid",
	borderColor: theme.palette.divider,
	borderTopColor: "transparent",
	backgroundColor: theme.palette.background.paper,
	marginRight: 5,
	display: "flex",
	flexDirection: "column",
	[theme.breakpoints.down("sm")]: { display: "none" }
}));
const StyledContentRight = styled("div")({ flex: "1 1 auto" });
const StyledQuickSearchSkeleton = styled(Skeleton)(({ theme }) => ({ padding: theme.spacing(2) }));
const StyledBreadcrumbsSkeleton = styled(Skeleton)(({ theme }) => ({
	height: theme.spacing(4),
	[theme.breakpoints.down("sm")]: { display: "none" }
}));
const ButtonSkeleton = ({ style, withText,...boxProps }) => {
	const theme = useTheme();
	const isXs = useMediaQuery(theme.breakpoints.only("xs"));
	return /* @__PURE__ */ jsxs("div", {
		style: {
			...style,
			height: 48,
			display: "flex",
			flexDirection: "row"
		},
		...boxProps,
		children: [/* @__PURE__ */ jsx(Skeleton, {
			variant: "text",
			animation: "wave",
			children: /* @__PURE__ */ jsx(Apps, {})
		}), withText && /* @__PURE__ */ jsx(Skeleton, {
			variant: "text",
			animation: "wave",
			style: {
				flexGrow: 1,
				marginLeft: isXs ? theme.spacing(2) : theme.spacing(4)
			}
		})]
	});
};
const LeftNavElementsSkeleton = ({ elements, withText }) => {
	const theme = useTheme();
	return /* @__PURE__ */ jsx(Fragment, { children: elements.map((element, i) => {
		if (element.type === "slot" && element.component === Divider) return /* @__PURE__ */ jsx(Divider, {}, `leftnav-sklt-divider-${i}`);
		return /* @__PURE__ */ jsx(ButtonSkeleton, {
			withText,
			style: {
				paddingTop: theme.spacing(1),
				paddingBottom: theme.spacing(1),
				paddingLeft: theme.spacing(2),
				paddingRight: theme.spacing(2)
			}
		}, `leftnav-sklt-${element.id}`);
	}) });
};
const AppBarSkeleton = ({ layout }) => {
	const leftnav = useAppLeftNav();
	const breadcrumbs = useAppBreadcrumbs();
	const quicksearch = useAppQuickSearch();
	const { brand, topnav: topnavPreferences } = useAppPreferences();
	const appName = brand?.appName;
	const muiTheme = useTheme();
	const isXs = useMediaQuery(muiTheme.breakpoints.only("xs"));
	const isSm = useMediaQuery(muiTheme.breakpoints.only("sm"));
	const isSmDown = useMediaQuery(muiTheme.breakpoints.down("md"));
	const sp1 = muiTheme.spacing(1);
	const sp2 = muiTheme.spacing(2);
	const sp3 = muiTheme.spacing(3);
	const sp4 = muiTheme.spacing(4);
	const showTopBarBreadcrumbs = breadcrumbs.show && !isSm;
	return /* @__PURE__ */ jsx(AppBarBase, { children: /* @__PURE__ */ jsxs(Toolbar, {
		disableGutters: true,
		style: {
			paddingRight: sp2,
			paddingLeft: !isXs ? sp2 : null
		},
		children: [
			isXs && /* @__PURE__ */ jsx(ButtonSkeleton, {
				withText: leftnav.open,
				style: {
					paddingTop: sp1,
					paddingBottom: sp1,
					paddingLeft: sp2,
					paddingRight: sp2,
					flexGrow: 1
				}
			}),
			layout === "top" && /* @__PURE__ */ jsxs(Fragment, { children: [!isXs && /* @__PURE__ */ jsx(ButtonSkeleton, {
				withText: false,
				style: {
					paddingTop: sp1,
					paddingBottom: sp1,
					paddingRight: sp4
				}
			}), /* @__PURE__ */ jsx(Skeleton, {
				variant: "text",
				animation: "wave",
				style: { marginRight: sp3 },
				children: /* @__PURE__ */ jsx("div", {
					style: {
						fontSize: "1.5rem",
						letterSpacing: "-1px"
					},
					children: appName
				})
			})] }),
			topnavPreferences.slots?.left?.length > 0 && /* @__PURE__ */ jsx(Stack, {
				direction: "row",
				spacing: 3,
				mr: 2.5,
				children: topnavPreferences.slots.left.map((_, index) => /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: false,
					style: {}
				}, `topnav.slot.left.${index}`))
			}),
			topnavPreferences.slots?.breadcrumbs?.left?.length > 0 && /* @__PURE__ */ jsx(Stack, {
				direction: "row",
				spacing: 3,
				ml: 2,
				mr: 2.5,
				children: topnavPreferences.slots.breadcrumbs.left.map((_, index) => /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: false,
					style: {}
				}, `topnav.slots.breadcrumbs.left.${index}`))
			}),
			showTopBarBreadcrumbs && /* @__PURE__ */ jsx(StyledBreadcrumbsSkeleton, {
				variant: "text",
				animation: "wave",
				width: 100
			}),
			topnavPreferences.slots?.breadcrumbs?.right?.length > 0 && /* @__PURE__ */ jsx(Stack, {
				direction: "row",
				spacing: 3,
				ml: 2,
				mr: 2.5,
				children: topnavPreferences.slots.breadcrumbs.right.map((_, index) => /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: false,
					style: {}
				}, `topnav.slots.breadcrumbs.right.${index}`))
			}),
			/* @__PURE__ */ jsx("div", { style: { flexGrow: 1 } }),
			topnavPreferences.slots?.search?.left?.length > 0 && /* @__PURE__ */ jsx(Stack, {
				direction: "row",
				spacing: 3,
				ml: 2,
				mr: 2.5,
				children: topnavPreferences.slots.search.left.map((_, index) => /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: false,
					style: {}
				}, `topnav.slots.search.left.${index}`))
			}),
			quicksearch.show && (isSmDown || topnavPreferences.quickSearchIconOnly ? /* @__PURE__ */ jsx(ButtonSkeleton, {
				withText: false,
				style: {}
			}) : /* @__PURE__ */ jsx(StyledQuickSearchSkeleton, {
				variant: "text",
				animation: "wave",
				width: showTopBarBreadcrumbs ? 358 : "auto",
				style: { flexGrow: !showTopBarBreadcrumbs ? 1 : 0 }
			})),
			topnavPreferences.slots?.search?.right?.length > 0 && /* @__PURE__ */ jsx(Stack, {
				direction: "row",
				spacing: 3,
				ml: 2,
				mr: 2.5,
				children: topnavPreferences.slots.search.right.map((_, index) => /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: false,
					style: {}
				}, `topnav.slots.search.right.${index}`))
			}),
			/* @__PURE__ */ jsx(Skeleton, {
				animation: "wave",
				variant: "circular",
				children: /* @__PURE__ */ jsx(AppUserAvatar, {})
			}),
			topnavPreferences.slots?.right?.length > 0 && /* @__PURE__ */ jsx(Stack, {
				direction: "row",
				spacing: 3,
				ml: 2,
				children: topnavPreferences.slots.right.map((_, index) => /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: false,
					style: {}
				}, `topnav.slot.right.${index}`))
			})
		]
	}) });
};
/**
* A Skeleton for the side layout...
*/
const SideLayoutSkeleton = () => {
	const leftnav = useAppLeftNav();
	const { leftnav: leftnavPreference } = useAppPreferences();
	const muiTheme = useTheme();
	const sp1 = muiTheme.spacing(1);
	const sp2 = muiTheme.spacing(2);
	const sp7 = muiTheme.spacing(7);
	return /* @__PURE__ */ jsx(StyledContainer, { children: /* @__PURE__ */ jsx(StyledLeftLayout, { children: /* @__PURE__ */ jsxs(StyledContent, { children: [/* @__PURE__ */ jsxs(StyledContentLeft, {
		style: { width: leftnav.open ? leftnavPreference.width : sp7 },
		children: [
			/* @__PURE__ */ jsx(Toolbar, {
				disableGutters: true,
				children: /* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: leftnav.open,
					style: {
						paddingTop: sp1,
						paddingBottom: sp1,
						paddingLeft: sp2,
						paddingRight: sp2,
						flexGrow: 1
					}
				})
			}),
			/* @__PURE__ */ jsx(Divider, {}),
			/* @__PURE__ */ jsxs(List, {
				disablePadding: true,
				sx: {
					display: "flex",
					flexDirection: "column",
					flexGrow: 1
				},
				children: [
					/* @__PURE__ */ jsx(LeftNavElementsSkeleton, {
						elements: leftnav.menus.map((m) => m.items).flat(),
						withText: leftnav.open
					}),
					/* @__PURE__ */ jsx(Box, { sx: { flexGrow: 1 } }),
					leftnav.menus?.length > 0 && /* @__PURE__ */ jsx(Divider, {}),
					/* @__PURE__ */ jsx(ButtonSkeleton, {
						withText: leftnav.open,
						style: {
							paddingTop: sp1,
							paddingBottom: sp1,
							paddingLeft: sp2,
							paddingRight: sp2
						}
					})
				]
			})
		]
	}), /* @__PURE__ */ jsx(StyledContentRight, { children: /* @__PURE__ */ jsx(AppBarSkeleton, { layout: "side" }) })] }) }) });
};
/**
* A Skeleton for the top layout.
*/
const TopLayoutSkeleton = () => {
	const leftnav = useAppLeftNav();
	const { leftnav: leftnavPreference } = useAppPreferences();
	const muiTheme = useTheme();
	const sp1 = muiTheme.spacing(1);
	const sp2 = muiTheme.spacing(2);
	const sp7 = muiTheme.spacing(7);
	return /* @__PURE__ */ jsx(StyledContainer, { children: /* @__PURE__ */ jsxs(StyledTopLayout, { children: [/* @__PURE__ */ jsx(AppBarSkeleton, { layout: "top" }), /* @__PURE__ */ jsxs(StyledContent, { children: [/* @__PURE__ */ jsx(StyledContentLeft, {
		style: { width: leftnav.open ? leftnavPreference.width : sp7 },
		children: /* @__PURE__ */ jsxs(List, {
			disablePadding: true,
			children: [
				/* @__PURE__ */ jsx(LeftNavElementsSkeleton, {
					elements: leftnav.menus.map((m) => m.items).flat(),
					withText: leftnav.open
				}),
				leftnav.menus?.length > 0 && /* @__PURE__ */ jsx(Divider, {}),
				/* @__PURE__ */ jsx(ButtonSkeleton, {
					withText: leftnav.open,
					style: {
						paddingTop: sp1,
						paddingBottom: sp1,
						paddingLeft: sp2,
						paddingRight: sp2
					}
				})
			]
		})
	}), /* @__PURE__ */ jsx(StyledContentRight, {})] })] }) });
};
/**
* Default Skeleton component that will render either [TopLayoutSkeleton] or [SideLayoutSkeleton] based on [useAppLayout::currentLayout].
*/
const LayoutSkeleton = () => {
	return useAppLayout().current === "top" ? /* @__PURE__ */ jsx(TopLayoutSkeleton, {}) : /* @__PURE__ */ jsx(SideLayoutSkeleton, {});
};

//#endregion
export { APPBAR_READY_EVENT, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, AppAvatar, AppBrand, AppCookiesProvider, AppDefaultsCookieConfigs, AppDefaultsLeftNavConfigs, AppDefaultsPreferencesConfigs, AppDefaultsThemeConfigs, AppDefaultsTopNavConfigs, AppDensity, AppInfoPanel, AppListEmpty, AppProvider, AppRoot, AppSurface, AppThemesProvider, AppToc, AppUserAvatar, AppUserContext, BACKSPACE, BRAND_VARIANTS, ENTER, ESCAPE, LayoutSkeleton, LeftNavAction, LeftNavItem, LeftNavRoute, MODULE_NAME, OverlayDefs, OverlayLabel, OverlayProvider, OverlayShadow, PageCardCentered, PageCenter, PageContent, PageFullWidth, PageFullscreen, PageHeader, SPACE, TUI_COOKIE_KEYS, TUI_COOKIE_OPTIONS, TUI_THEMES, addTranslations, getBrandSizes, getDensityThemeOverrides, is, isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isBackspace, isEnter, isEscape, isSpace, keyboard, parseCookies, parseEvent, parseExtraServerCookie, parseTuiClientCookies, parseTuiCookies, parseTuiServerCookies, setClientCookie, traverse, useAppBar, useAppBarHeight, useAppBarScrollTrigger, useAppBrand, useAppBreadcrumbs, useAppColor, useAppDensity, useAppEnv, useAppLanguage, useAppLayout, useAppLeftNav, useAppLogo, useAppOverlay, useAppPreferences, useAppQuickSearch, useAppRouter, useAppSearchService, useAppTheme, useAppThemeBuilder, useAppUser, useClipboard, useCookiesStore, useFullscreenStatus, useLocalStorage, useLocalStorageItem, usePageProps, usePathMatcher, visit };
//# sourceMappingURL=index.js.map