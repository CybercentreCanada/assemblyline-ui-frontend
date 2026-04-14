import { useContext } from 'react';
import { AppLayoutContext } from '../AppContexts';

export const useAppLayout = () => {
  return useContext(AppLayoutContext);
};
