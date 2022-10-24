import { SystemMessageDefinition } from 'components/hooks/useMyUser';
import { Feed, FeedItem } from '..';

export type Store = {
  loading: { feedsFetched: boolean; lastTimeOpen: boolean };
  read: boolean;
  open: { drawer: boolean; editDialog: boolean; saveConfirmation: boolean; deleteConfirmation: boolean };
  notification: {
    urls: Array<string>;
    feeds: Array<Feed>;
    items: Array<FeedItem>;
    localStorage: string;
    lastTimeOpen: Date;
    newItemsCount: number;
  };
  systemMessage: SystemMessageDefinition;
  value: number;
};

export const useNotificationInitialState = () => {
  const initialState: Store = {
    loading: {
      feedsFetched: false,
      lastTimeOpen: false
    },
    read: false,
    open: {
      drawer: false,
      editDialog: false,
      saveConfirmation: false,
      deleteConfirmation: false
    },
    notification: {
      // urls: ['https://ici.radio-canada.ca/rss/4159', 'https://ici.radio-canada.ca/rss/4159'],
      urls: [],
      feeds: [],
      items: [],
      localStorage: 'notification.lastTimeOpen',
      lastTimeOpen: new Date(0),
      newItemsCount: 0
    },
    systemMessage: { user: '', title: '', severity: 'info', message: '' },
    value: 0
  };

  return { initialState };
};
