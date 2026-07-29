import { createAppStore } from 'features/store/createAppStore';
import type { AssistantInsightProps } from 'layout/assistant/assistant.models';

type AppAssistantStore = {
  insights: AssistantInsightProps[];
  open: boolean;
};

export const {
  StoreProvider: AppAssistantStoreProvider,
  useStore: useAppAssistantStore,
  useStoreApi: useAppAssistantStoreApi
} = createAppStore<AppAssistantStore>({ insights: [], open: false });
