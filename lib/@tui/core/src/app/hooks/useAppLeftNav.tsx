import { useContext } from 'react';
import { AppLeftNavContext } from '../AppContexts';

export const useAppLeftNav = () => {
  return useContext(AppLeftNavContext);
};
