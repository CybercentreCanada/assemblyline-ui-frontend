import * as react0 from "react";
import { FC, PropsWithChildren, ReactElement } from "react";
import { i18n } from "i18next";

//#region src/AppNotifications.d.ts
declare const AppNotifications: FC;
//#endregion
//#region src/FeedModels.d.ts
type SystemMessage = {
  user: string;
  title: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  message: string;
};
type FeedItem = {
  id: string;
  url?: string;
  external_url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  content_md?: string;
  summary?: string;
  image?: string;
  banner_image?: string;
  date_published?: Date;
  date_modified?: Date;
  authors?: Array<FeedAuthor>;
  tags?: Array<'new' | 'current' | 'dev' | 'service' | 'blog'>;
  language?: string;
  attachments?: Array<FeedAttachment>;
  _isNew: boolean;
};
type FeedAuthor = {
  name?: string;
  url?: string;
  avatar?: string;
};
type FeedAttachment = {
  url: string;
  mime_type: string;
  title?: string;
  size_in_bytes?: number;
  duration_in_seconds?: number;
};
type Feed = {
  version: string;
  title: string;
  home_page_url?: string;
  feed_url?: string;
  description?: string;
  user_comment?: string;
  next_url?: string;
  icon?: string;
  favicon?: string;
  authors?: Array<FeedAuthor>;
  language?: string;
  expired?: boolean;
  hubs?: Array<{
    type: string;
    url: string;
  }>;
  items: Array<FeedItem>;
};
declare const DEFAULT_FEED: Feed;
declare const DEFAULT_FEED_ITEM: FeedItem;
declare const DEFAULT_FEED_ATTACHMENT: FeedAttachment;
declare const DEFAULT_FEED_AUTHOR: any;
declare function parseFeedAttachments(attachments: any): FeedAttachment[];
declare function parseFeedAuthors(authors: any): FeedAuthor[];
declare function parseFeedItems(items: any): FeedItem[];
declare function parseFeed(feed: any): Feed;
//#endregion
//#region src/AppNotificationService.d.ts
type ItemComponentProps = {
  item: FeedItem;
};
type AppNotificationService = {
  feedUrls?: string[];
  notificationRenderer?: (props: ItemComponentProps) => ReactElement;
};
//#endregion
//#region src/i18n/index.d.ts
declare function addTranslations(i18n: i18n): void;
//#endregion
//#region src/name.d.ts
declare const MODULE_NAME = "tui.notis";
//#endregion
//#region src/providers/AppNotificationProvider.d.ts
type AppNotificationServiceState = {
  urls: string[];
  set: (state: AppNotificationServiceState) => void;
};
type AppNotificationServiceContextType = {
  provided: boolean;
  service: AppNotificationService;
  state: AppNotificationServiceState;
};
declare const AppNotificationServiceContext: react0.Context<AppNotificationServiceContextType>;
type AppNotificationServiceProviderProps = PropsWithChildren & {
  service?: AppNotificationService;
};
declare const AppNotificationServiceProvider: FC<AppNotificationServiceProviderProps>;
//#endregion
export { AppNotificationService, AppNotificationServiceContext, AppNotificationServiceContextType, AppNotificationServiceProvider, AppNotificationServiceState, AppNotifications, DEFAULT_FEED, DEFAULT_FEED_ATTACHMENT, DEFAULT_FEED_AUTHOR, DEFAULT_FEED_ITEM, Feed, FeedAttachment, FeedAuthor, FeedItem, ItemComponentProps, MODULE_NAME, SystemMessage, addTranslations, parseFeed, parseFeedAttachments, parseFeedAuthors, parseFeedItems };
//# sourceMappingURL=index.d.ts.map