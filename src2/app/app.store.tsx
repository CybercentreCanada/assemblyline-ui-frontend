import { createStore } from '@tanstack/react-store';
import type { AppStore } from 'app/app.models';

export const appStore = createStore<AppStore>({
  theme: 'light'
});
