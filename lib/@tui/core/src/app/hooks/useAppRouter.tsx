import { useContext } from 'react';
import { AppContext } from '../AppContexts';

export const useAppRouter = () => {
  const { router } = useContext(AppContext);
  return router;
};
