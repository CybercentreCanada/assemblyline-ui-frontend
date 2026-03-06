import { createStore } from '@tanstack/react-store';
import { AppStore } from '../models/app.models';

export const appStore = createStore<AppStore>({
  theme: 'light'
});
