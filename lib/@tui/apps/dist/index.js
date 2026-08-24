import { Apps } from "@mui/icons-material";
import { Avatar, Button, ClickAwayListener, Fade, IconButton, Link, Paper, Popper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";

//#region src/providers/AppSwitcherProvider.tsx
const AppSwitcherContext = createContext({
	initialized: false,
	empty: true,
	items: [],
	setItems: () => []
});
const AppSwitcherProvider = ({ apps, children }) => {
	const [items, setItems] = useState(apps || []);
	const context = useMemo(() => ({
		initialized: true,
		items,
		empty: !items || items.length === 0,
		setItems
	}), [items]);
	return /* @__PURE__ */ jsx(AppSwitcherContext.Provider, {
		value: context,
		children
	});
};

//#endregion
//#region src/hooks/useAppSwitcher.tsx
function useAppSwitcher() {
	return useContext(AppSwitcherContext);
}

//#endregion
//#region src/elements/AppSwitcher.tsx
const AppSwitcher = () => {
	const theme = useTheme();
	const appSwitcher = useAppSwitcher();
	const isDarkTheme = theme.palette.mode === "dark";
	const sp1 = theme.spacing(1);
	const isSm = useMediaQuery(theme.breakpoints.down("sm"));
	const [open, setOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState();
	const onTogglePopper = useCallback((event) => {
		setOpen((_open) => !_open);
		setAnchorEl(event.currentTarget);
	}, []);
	const onClickAway = useCallback(() => setOpen(false), []);
	if (appSwitcher.empty) return null;
	return /* @__PURE__ */ jsx(ClickAwayListener, {
		onClickAway,
		children: /* @__PURE__ */ jsxs(IconButton, {
			color: "inherit",
			onClick: onTogglePopper,
			size: "large",
			children: [/* @__PURE__ */ jsx(Apps, {}), /* @__PURE__ */ jsx(Popper, {
				sx: { zIndex: theme.zIndex.drawer + 2 },
				open: open && !!anchorEl,
				anchorEl,
				placement: "bottom-end",
				transition: true,
				children: ({ TransitionProps }) => /* @__PURE__ */ jsx(Fade, {
					...TransitionProps,
					timeout: 250,
					children: /* @__PURE__ */ jsx(Paper, {
						style: {
							textAlign: "center",
							padding: theme.spacing(1)
						},
						elevation: 4,
						children: /* @__PURE__ */ jsx("div", {
							style: {
								display: "flex",
								flexDirection: "row",
								flexWrap: "wrap",
								maxWidth: appSwitcher.items.length <= 4 || isSm ? "240px" : "360px"
							},
							children: appSwitcher.items.map((a, i) => /* @__PURE__ */ jsx("div", {
								style: {
									width: "120px",
									padding: sp1,
									overflow: "hidden"
								},
								children: /* @__PURE__ */ jsxs(Button, {
									component: Link,
									target: a.newWindow ? "_blank" : null,
									href: a.route,
									style: {
										display: "inherit",
										textDecoration: "none",
										fontWeight: 400,
										color: "inherit"
									},
									children: [/* @__PURE__ */ jsx("div", {
										style: { display: "inline-flex" },
										children: /* @__PURE__ */ jsx(Avatar, {
											variant: "rounded",
											alt: a.name,
											src: isDarkTheme ? typeof a.img_d === "string" ? a.img_d : null : typeof a.img_l === "string" ? a.img_l : null,
											style: a.img_d === null || typeof a.img_d === "string" ? {
												width: theme.spacing(8),
												height: theme.spacing(8)
											} : {
												backgroundColor: "transparent",
												width: theme.spacing(8),
												height: theme.spacing(8)
											},
											sx: { "& img": { objectFit: "contain" } },
											children: isDarkTheme ? a.img_d !== null && typeof a.img_d !== "string" ? a.img_d : a.alt : a.img_l !== null && typeof a.img_l !== "string" ? a.img_l : a.alt
										}, `avatar-${i}`)
									}), /* @__PURE__ */ jsx(Typography, {
										variant: "caption",
										children: a.name
									}, `text-${i}`)]
								}, `button-${i}`)
							}, `box-${i}`))
						})
					})
				})
			})]
		})
	});
};

//#endregion
//#region src/name.ts
const MODULE_NAME = "tui.apps";

//#endregion
export { AppSwitcher, AppSwitcherProvider, MODULE_NAME, useAppSwitcher };
//# sourceMappingURL=index.js.map