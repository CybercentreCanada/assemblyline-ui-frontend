import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { Badge, Box, Chip, Divider, Drawer, Grid, Icon, IconButton, Link, Skeleton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import DOMPurify from "dompurify";
import Markdown from "react-markdown";
import "dayjs/locale/en-ca.js";
import "dayjs/locale/fr-ca.js";
import { useTranslation } from "react-i18next";
import { Circle, CloseOutlined, ErrorOutline, FeedbackOutlined, NotificationsActiveOutlined, NotificationsNoneOutlined } from "@mui/icons-material";

//#region src/providers/AppNotificationProvider.tsx
const AppNotificationServiceContext = createContext(null);
const DEFAULT_CONTEXT = {
	provided: false,
	service: {
		feedUrls: [],
		notificationRenderer: null
	},
	state: {
		urls: [],
		set: () => null
	}
};
const AppNotificationServiceProvider = ({ service, children }) => {
	const defaultService = useMemo(() => {
		return {
			feedUrls: null,
			notificationRenderer: null
		};
	}, []);
	const [state, setState] = useState(DEFAULT_CONTEXT.state);
	const context = useMemo(() => ({
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
	return /* @__PURE__ */ jsx(AppNotificationServiceContext.Provider, {
		value: context,
		children
	});
};

//#endregion
//#region src/hooks/useAppNotification.tsx
function useAppNotification() {
	return useContext(AppNotificationServiceContext);
}

//#endregion
//#region src/elements/item/NotificationItemAuthor.tsx
const NotificationItemAuthor = memo(({ author = null }) => {
	const theme = useTheme();
	const avatar = useMemo(() => {
		if (author?.avatar.includes("github")) {
			const url = new URLSearchParams(author?.avatar);
			url.append("s", "50");
			return decodeURIComponent(url.toString());
		} else return author?.avatar;
	}, [author]);
	const NotificationAuthorContent = useMemo(() => /* @__PURE__ */ jsxs(Fragment, { children: [avatar && /* @__PURE__ */ jsx("img", {
		src: avatar,
		alt: avatar,
		style: {
			maxHeight: "25px",
			borderRadius: "50%",
			color: theme.palette.text.secondary,
			marginRight: theme.spacing(1)
		}
	}), /* @__PURE__ */ jsx(Typography, {
		variant: "caption",
		color: "textSecondary",
		sx: author?.url && author?.url !== "" && {
			color: theme.palette.text.secondary,
			transition: "color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
			"&:hover": { color: theme.palette.mode === "dark" ? theme.palette.secondary.light : theme.palette.secondary.dark }
		},
		children: author?.name
	})] }), [
		author?.name,
		author?.url,
		avatar,
		theme
	]);
	return author && author?.url && author?.url !== "" ? /* @__PURE__ */ jsx(Link, {
		title: author?.url,
		href: author?.url,
		target: "_blank",
		rel: "noopener noreferrer",
		style: { display: "contents" },
		children: NotificationAuthorContent
	}, `${author?.name}`) : /* @__PURE__ */ jsx("div", {
		style: { display: "contents" },
		children: NotificationAuthorContent
	}, `${author?.name}`);
});

//#endregion
//#region src/elements/item/NotificationItemContent.tsx
const NotificationItemContent = memo(({ content_html = null, content_text = null, content_md = null }) => content_md ? /* @__PURE__ */ jsx(Box, {
	sx: {
		"& *": {
			margin: 0,
			marginBottom: .5
		},
		overflow: "hidden"
	},
	children: /* @__PURE__ */ jsx(Markdown, {
		components: { a: (props) => /* @__PURE__ */ jsx(Link, {
			href: props.href,
			children: props.children
		}) },
		children: content_md
	})
}) : content_html ? /* @__PURE__ */ jsx(Typography, {
	sx: {
		"& *": {
			margin: 0,
			marginBottom: .5
		},
		overflow: "hidden"
	},
	dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(content_html, { USE_PROFILES: { html: true } }) }
}) : content_text ? /* @__PURE__ */ jsx(Typography, {
	sx: {
		"& *": {
			margin: 0,
			marginBottom: .5
		},
		overflow: "hidden"
	},
	variant: "body2",
	color: "textPrimary",
	children: content_text
}) : null);

//#endregion
//#region src/elements/item/NotificationItemDate.tsx
const NotificationItemDate = memo(({ date_published = null }) => {
	const { i18n } = useTranslation();
	return !date_published ? null : /* @__PURE__ */ jsx(Typography, {
		lineHeight: "revert",
		display: "block",
		variant: "caption",
		color: "textSecondary",
		children: /* @__PURE__ */ jsx(Fragment, { children: dayjs(date_published).locale(i18n.language).fromNow() })
	});
});

//#endregion
//#region src/elements/item/NotificationItemImage.tsx
const NotificationItemImage = memo(({ image = null }) => image && /* @__PURE__ */ jsx("div", {
	style: {
		width: "100%",
		display: "flex",
		justifyContent: "center"
	},
	children: /* @__PURE__ */ jsx("img", {
		src: image,
		alt: image,
		style: {
			maxWidth: "256px",
			maxHeight: "256px",
			borderRadius: "5px",
			marginTop: "8px"
		}
	})
}));

//#endregion
//#region src/elements/item/NotificationItemTag.tsx
const TAG_COLOR = {
	new: "info",
	current: "success",
	dev: "warning",
	service: "secondary",
	blog: "default"
};
const NotificationItemTag = memo(({ tag = null }) => tag && tag in TAG_COLOR && /* @__PURE__ */ jsx(Chip, {
	label: tag.toLowerCase(),
	variant: "outlined",
	size: "small",
	color: TAG_COLOR[tag] ?? "default"
}));

//#endregion
//#region src/elements/item/NotificationItemTitle.tsx
const NotificationItemTitle = memo(({ title = null, url = null, _isNew = false }) => {
	const theme = useTheme();
	return !title ? null : !url ? /* @__PURE__ */ jsx(Typography, {
		variant: "h6",
		sx: { color: theme.palette.primary.main },
		children: /* @__PURE__ */ jsxs(Stack, {
			direction: "row",
			alignItems: "center",
			gap: 1,
			children: [title, _isNew && /* @__PURE__ */ jsx(Circle, { sx: { width: "15px" } })]
		})
	}) : /* @__PURE__ */ jsx(Typography, {
		component: Link,
		href: url,
		target: "_blank",
		rel: "noopener noreferrer",
		underline: "none",
		sx: {
			color: theme.palette.primary.main,
			transition: "color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
			"&:hover": { color: theme.palette.text.secondary }
		},
		variant: "h6",
		children: /* @__PURE__ */ jsxs(Stack, {
			direction: "row",
			alignItems: "center",
			gap: 1,
			children: [title, _isNew && /* @__PURE__ */ jsx(Circle, { sx: { width: "15px" } })]
		})
	});
});

//#endregion
//#region src/elements/item/NotificationItem.tsx
const NotificationItem = memo(({ item = null }) => {
	const theme = useTheme();
	return !item ? null : /* @__PURE__ */ jsxs("div", {
		style: {
			width: "100%",
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start"
		},
		children: [
			/* @__PURE__ */ jsx(NotificationItemDate, { ...item }),
			/* @__PURE__ */ jsx(NotificationItemTitle, { ...item }),
			/* @__PURE__ */ jsx(NotificationItemContent, { ...item }),
			/* @__PURE__ */ jsx(NotificationItemImage, { ...item }),
			/* @__PURE__ */ jsxs("div", {
				style: {
					width: "100%",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					marginTop: theme.spacing(1)
				},
				children: [
					item?.tags && item?.tags.map((tag) => /* @__PURE__ */ jsx(NotificationItemTag, { tag }, `${tag}`)),
					/* @__PURE__ */ jsx("div", { style: { flex: 1 } }),
					item?.authors && item?.authors.map((author) => /* @__PURE__ */ jsx(NotificationItemAuthor, { author }, `${author?.name}`))
				]
			})
		]
	});
});

//#endregion
//#region src/name.ts
const MODULE_NAME = "tui.notis";

//#endregion
//#region src/elements/NotificationCloseButton.tsx
const NotificationCloseButton = memo(({ drawer = false, onDrawerOpen = () => null, onDrawerClose = () => null }) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(IconButton, {
	onClick: () => drawer ? onDrawerClose() : onDrawerOpen(),
	size: "large",
	children: /* @__PURE__ */ jsx(CloseOutlined, { fontSize: "medium" })
}) }));

//#endregion
//#region src/elements/NotificationHeader.tsx
const NotificationHeader = memo(({ title = "", icon = null, children = null }) => {
	const theme = useTheme();
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		style: {
			width: "100%",
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			paddingTop: theme.spacing(2)
		},
		children: [
			/* @__PURE__ */ jsx(Icon, {
				fontSize: "medium",
				sx: {
					color: "inherit",
					backgroundColor: "inherit",
					marginLeft: theme.spacing(1.5),
					marginRight: theme.spacing(1.5)
				},
				children: icon
			}),
			/* @__PURE__ */ jsx(Typography, {
				variant: "h6",
				fontSize: "large",
				fontWeight: "bolder",
				flex: 1,
				children: title
			}),
			children
		]
	}), /* @__PURE__ */ jsx(Divider, {
		orientation: "horizontal",
		flexItem: true,
		style: {
			width: "100%",
			marginTop: theme.spacing(.5)
		}
	})] });
});

//#endregion
//#region src/elements/NotificationSkeleton.tsx
const NotificationSkeleton = memo(() => {
	const theme = useTheme();
	return /* @__PURE__ */ jsxs("div", {
		style: { width: "100%" },
		children: [
			/* @__PURE__ */ jsx(Typography, {
				variant: "caption",
				children: /* @__PURE__ */ jsx(Skeleton, { width: "30%" })
			}),
			/* @__PURE__ */ jsx(Typography, {
				variant: "h6",
				children: /* @__PURE__ */ jsx(Skeleton, { width: "50%" })
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					marginTop: theme.spacing(.25),
					marginBottom: theme.spacing(1)
				},
				children: [
					/* @__PURE__ */ jsx(Typography, {
						variant: "body2",
						children: /* @__PURE__ */ jsx(Skeleton, {})
					}),
					/* @__PURE__ */ jsx(Typography, {
						variant: "body2",
						children: /* @__PURE__ */ jsx(Skeleton, {})
					}),
					/* @__PURE__ */ jsx(Typography, {
						variant: "body2",
						children: /* @__PURE__ */ jsx(Skeleton, {})
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					width: "100%",
					display: "flex",
					flexDirection: "row",
					alignItems: "center"
				},
				children: [
					/* @__PURE__ */ jsx(Chip, {
						size: "small",
						variant: "outlined",
						label: /* @__PURE__ */ jsx(Skeleton, { width: "30px" }),
						style: { margin: theme.spacing(.25) }
					}),
					/* @__PURE__ */ jsx(Chip, {
						size: "small",
						variant: "outlined",
						label: /* @__PURE__ */ jsx(Skeleton, { width: "30px" }),
						style: { margin: theme.spacing(.25) }
					}),
					/* @__PURE__ */ jsx("div", { style: { flex: 1 } }),
					/* @__PURE__ */ jsx(Skeleton, {
						variant: "circular",
						width: 25,
						height: 25,
						style: { margin: theme.spacing(.25) }
					}),
					/* @__PURE__ */ jsx(Typography, {
						variant: "caption",
						style: { margin: theme.spacing(.25) },
						children: /* @__PURE__ */ jsx(Skeleton, { width: 50 })
					}),
					/* @__PURE__ */ jsx(Skeleton, {
						variant: "circular",
						width: 25,
						height: 25,
						style: { margin: theme.spacing(.25) }
					}),
					/* @__PURE__ */ jsx(Typography, {
						variant: "caption",
						style: { margin: theme.spacing(.25) },
						children: /* @__PURE__ */ jsx(Skeleton, { width: 50 })
					})
				]
			})
		]
	});
});

//#endregion
//#region src/elements/NotificationEndOfPage.tsx
function useOnScreen(ref, rootMargin = "0px") {
	const [isIntersecting, setIntersecting] = useState(false);
	useEffect(() => {
		const observerRef = ref.current;
		const observer = new IntersectionObserver(([entry]) => {
			setIntersecting(entry.isIntersecting);
		}, { rootMargin });
		if (observerRef) observer.observe(observerRef);
		return () => {
			if (observerRef) observer.unobserve(observerRef);
		};
	}, []);
	return isIntersecting;
}
const NotificationEndOfPage = memo(({ endOfPage = true, onLoading = () => null }) => {
	const ref = useRef(void 0);
	const onScreen = useOnScreen(ref);
	useEffect(() => {
		if (onScreen) onLoading();
	}, [onLoading, onScreen]);
	return endOfPage ? null : /* @__PURE__ */ jsx("div", {
		ref,
		style: {
			display: "flex",
			justifyContent: "center"
		},
		children: /* @__PURE__ */ jsx(NotificationSkeleton, {})
	});
});

//#endregion
//#region src/elements/NotificationError.tsx
const NotificationError = memo(() => {
	const { t } = useTranslation(MODULE_NAME);
	return /* @__PURE__ */ jsxs(Grid, {
		container: true,
		sx: {
			padding: 1,
			minHeight: useTheme().spacing(20)
		},
		alignContent: "center",
		justifyContent: "center",
		alignItems: "center",
		gap: 1,
		children: [/* @__PURE__ */ jsx(ErrorOutline, {
			color: "error",
			sx: { fontSize: 40 }
		}), /* @__PURE__ */ jsx(Typography, {
			color: "error",
			variant: "h6",
			children: t("notification.error")
		})]
	});
});

//#endregion
//#region src/elements/NotificationItems.tsx
const NotificationItems = memo(({ notifications = [], handleLoading = () => null, pageSize = 10, ItemComponent = null, status = "loading" }) => {
	const theme = useTheme();
	return status === "loading" ? /* @__PURE__ */ jsx(Fragment, { children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx(NotificationSkeleton, {}, `skeleton-${i}`)) }) : status === "error" ? /* @__PURE__ */ jsx(NotificationError, {}) : status === "ready" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Stack, {
		direction: "column",
		spacing: theme.spacing(1.25),
		margin: theme.spacing(1.25),
		divider: /* @__PURE__ */ jsx(Divider, {
			orientation: "horizontal",
			flexItem: true,
			style: {
				width: "100%",
				alignSelf: "center"
			}
		}),
		children: notifications.slice(0, pageSize).map((n) => /* @__PURE__ */ jsx(ItemComponent, { item: n }, n?.title))
	}), /* @__PURE__ */ jsx(NotificationEndOfPage, {
		endOfPage: pageSize >= notifications.length,
		onLoading: () => handleLoading()
	})] });
});

//#endregion
//#region src/elements/NotificationContainer.tsx
const NotificationContainer = memo((props) => {
	const { notifications = [], drawer = true, onDrawerOpen = () => null, onDrawerClose = () => null, initialPageSize = 10, loadingPageDelta = 2, ItemComponent = null, inDrawer = true, status = "loading", maxDrawerWidth = "500px" } = props;
	const { t } = useTranslation(MODULE_NAME);
	const theme = useTheme();
	const upSM = useMediaQuery(theme.breakpoints.up("sm"));
	const [pageSize, setPageSize] = useState(initialPageSize);
	const handleLoading = useCallback(() => {
		setPageSize((v) => v + loadingPageDelta);
	}, [loadingPageDelta]);
	return inDrawer ? /* @__PURE__ */ jsx(Drawer, {
		elevation: 2,
		anchor: "right",
		open: drawer,
		onClick: () => drawer ? onDrawerClose() : onDrawerOpen(),
		slotProps: { paper: { style: {
			width: upSM ? "80%" : "100%",
			maxWidth: maxDrawerWidth
		} } },
		children: /* @__PURE__ */ jsxs("div", {
			style: {
				height: "100%",
				width: "100%",
				overflowX: "hidden",
				pageBreakBefore: "avoid",
				pageBreakInside: "avoid",
				padding: theme.spacing(2.5),
				paddingTop: 0
			},
			children: [/* @__PURE__ */ jsx(NotificationHeader, {
				icon: /* @__PURE__ */ jsx(FeedbackOutlined, {}),
				title: t("notification.title"),
				children: /* @__PURE__ */ jsx(NotificationCloseButton, { ...props })
			}), /* @__PURE__ */ jsx(NotificationItems, {
				status,
				notifications,
				pageSize,
				handleLoading,
				ItemComponent
			})]
		})
	}) : /* @__PURE__ */ jsx(NotificationItems, {
		notifications,
		pageSize,
		handleLoading,
		ItemComponent,
		status
	});
});

//#endregion
//#region src/elements/NotificationTopNavButton.tsx
const NotificationTopNavButton = memo(({ newItems = 0, drawer = false, onDrawerOpen = () => null, onDrawerClose = () => null }) => {
	const { t } = useTranslation(MODULE_NAME);
	return /* @__PURE__ */ jsx(Tooltip, {
		title: t("notification.title"),
		children: /* @__PURE__ */ jsx(IconButton, {
			color: "inherit",
			onClick: () => drawer ? onDrawerClose() : onDrawerOpen(),
			size: "large",
			children: /* @__PURE__ */ jsx(Badge, {
				badgeContent: newItems,
				color: "info",
				max: 99,
				children: newItems > 0 ? /* @__PURE__ */ jsx(NotificationsActiveOutlined, {}) : /* @__PURE__ */ jsx(NotificationsNoneOutlined, {})
			})
		})
	});
});

//#endregion
//#region src/FeedModels.ts
const DEFAULT_FEED = {
	version: null,
	title: null,
	home_page_url: null,
	feed_url: null,
	description: null,
	user_comment: null,
	next_url: null,
	icon: null,
	favicon: null,
	authors: [],
	language: null,
	expired: false,
	hubs: [],
	items: []
};
const DEFAULT_FEED_ITEM = {
	id: null,
	url: null,
	external_url: null,
	title: null,
	content_html: null,
	content_text: null,
	summary: null,
	image: null,
	banner_image: null,
	date_published: /* @__PURE__ */ new Date(0),
	date_modified: /* @__PURE__ */ new Date(0),
	authors: [],
	tags: [],
	language: null,
	attachments: [],
	_isNew: false
};
const DEFAULT_FEED_ATTACHMENT = {
	url: null,
	mime_type: null,
	title: null,
	size_in_bytes: 0,
	duration_in_seconds: 0
};
const DEFAULT_FEED_AUTHOR = {
	name: null,
	url: null,
	avatar: null
};
function decodeHTML(html) {
	if (!html || typeof html !== "string") return "";
	const txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}
function parseFeedAttachments(attachments) {
	return attachments && Array.isArray(attachments) ? attachments.map((attachment) => attachment && typeof attachment === "object" ? {
		...DEFAULT_FEED_ATTACHMENT,
		...attachment
	} : null).filter((attachment) => attachment) : [];
}
function parseFeedAuthors(authors) {
	return authors && Array.isArray(authors) ? authors.map((author) => author && typeof author === "object" ? {
		...DEFAULT_FEED_AUTHOR,
		...author
	} : null).filter((author) => author) : [];
}
function parseFeedItems(items) {
	return items && Array.isArray(items) ? items.map((item) => item && typeof item === "object" ? {
		...DEFAULT_FEED_ITEM,
		...item,
		date_published: new Date(item.date_published),
		date_modified: new Date(item.date_modified),
		authors: parseFeedAuthors(item?.authors),
		attachments: parseFeedAttachments(item?.attachments),
		content_html: decodeHTML(item?.content_html)
	} : null).filter((item) => item) : [];
}
function parseFeed(feed) {
	return feed && typeof feed === "object" ? {
		...DEFAULT_FEED,
		...feed,
		items: parseFeedItems(feed?.items),
		authors: parseFeedAuthors(feed?.authors)
	} : null;
}

//#endregion
//#region src/Notification.tsx
const Notification = memo(({ urls = null, notificationItem = NotificationItem, inDrawer = true, openIfNew = false, maxDrawerWidth = "500px" }) => {
	const [drawer, setDrawer] = useState(false);
	const [feeds, setFeeds] = useState(null);
	const [notifications, setNotifications] = useState(null);
	const [status, setStatus] = useState("loading");
	const lastTimeOpen = useRef(/* @__PURE__ */ new Date(0));
	const storageKey = "notification.lastTimeOpen";
	useMemo(() => {
		dayjs.extend(relativeTime);
	}, []);
	const onDrawerOpen = useCallback(() => {
		setDrawer(true);
		lastTimeOpen.current = /* @__PURE__ */ new Date();
	}, []);
	const onDrawerClose = useCallback(() => {
		setDrawer(false);
		localStorage.setItem(storageKey, JSON.stringify(lastTimeOpen.current.valueOf()));
		setNotifications((v) => v.map((n) => ({
			...n,
			_isNew: n.date_published.valueOf() > lastTimeOpen.current.valueOf()
		})));
	}, [storageKey]);
	const loadLastTimeOpen = useCallback(() => {
		const data = localStorage.getItem(storageKey);
		if (!data) return;
		const value = JSON.parse(data);
		if (typeof value !== "number") return;
		lastTimeOpen.current = new Date(value);
	}, [storageKey]);
	const fetchFeed = useCallback(async (url = "") => {
		let response = null;
		try {
			response = await fetch(url);
			if (!response || response.status >= 400) return {};
		} catch (err) {
			console.error(`Notification Area: error caused by URL "${err}`);
			return {};
		}
		const textResponse = await response.text();
		try {
			return parseFeed(JSON.parse(textResponse));
		} catch {
			return {};
		}
	}, []);
	const fetchFeeds = useCallback(async (urls$1 = []) => {
		if (!urls$1 || urls$1.length === 0) return [];
		return (await Promise.all(urls$1.map((url) => fetchFeed(url)))).filter((f) => !!f["items"]);
	}, [fetchFeed]);
	useEffect(() => {
		loadLastTimeOpen();
		if (!urls || !Array.isArray(urls) || urls.length === 0) return;
		fetchFeeds(urls).then((_feeds) => {
			_feeds = _feeds.map((f) => ({
				...f,
				items: f?.items?.map((i) => ({
					...i,
					external_url: f.feed_url
				}))
			}));
			setFeeds(Object.fromEntries(_feeds.map((f) => [f?.feed_url, {
				...f,
				items: []
			}])));
			const _notifs = _feeds.flatMap((f) => f?.items).filter((n) => n.date_published > new Date((/* @__PURE__ */ new Date()).setFullYear((/* @__PURE__ */ new Date()).getFullYear() - 1))).sort((a, b) => b.date_published.valueOf() - a.date_published.valueOf()).map((n) => ({
				...n,
				_isNew: n.date_published.valueOf() > lastTimeOpen.current.valueOf()
			}));
			setNotifications(_notifs);
			if (openIfNew && _notifs?.some((n) => n._isNew)) onDrawerOpen();
		});
	}, [
		fetchFeeds,
		loadLastTimeOpen,
		onDrawerOpen,
		openIfNew,
		urls
	]);
	useEffect(() => {
		if (feeds === void 0) setStatus("error");
		else if (feeds && notifications) if (notifications.length === 0) setStatus("error");
		else setStatus("ready");
		else setStatus("loading");
		return () => setStatus("loading");
	}, [feeds, notifications]);
	return urls && urls.length !== 0 && /* @__PURE__ */ jsxs(Fragment, { children: [inDrawer && /* @__PURE__ */ jsx(NotificationTopNavButton, {
		drawer,
		newItems: notifications?.filter((n) => n._isNew).length,
		onDrawerOpen,
		onDrawerClose
	}), /* @__PURE__ */ jsx(NotificationContainer, {
		status,
		notifications,
		drawer,
		onDrawerOpen,
		onDrawerClose,
		ItemComponent: notificationItem,
		inDrawer,
		maxDrawerWidth
	})] });
});

//#endregion
//#region src/AppNotifications.tsx
const AppNotifications = () => {
	const { service, state } = useAppNotification();
	return /* @__PURE__ */ jsx(Notification, {
		urls: service.feedUrls || state.urls,
		notificationItem: service.notificationRenderer,
		maxDrawerWidth: "800px",
		openIfNew: true
	});
};

//#endregion
//#region src/i18n/en.json
var en_default = {
	"notification.error": "Error loading the notifications",
	"notification.title": "Notifications"
};

//#endregion
//#region src/i18n/fr.json
var fr_default = {
	"notification.error": "Erreur lors du chargement des notifications",
	"notification.title": "Notifications"
};

//#endregion
//#region src/i18n/index.ts
function addTranslations(i18n) {
	i18n.addResourceBundle("en", MODULE_NAME, en_default);
	i18n.addResourceBundle("fr", MODULE_NAME, fr_default);
}

//#endregion
export { AppNotificationServiceContext, AppNotificationServiceProvider, AppNotifications, DEFAULT_FEED, DEFAULT_FEED_ATTACHMENT, DEFAULT_FEED_AUTHOR, DEFAULT_FEED_ITEM, MODULE_NAME, addTranslations, parseFeed, parseFeedAttachments, parseFeedAuthors, parseFeedItems };
//# sourceMappingURL=index.js.map