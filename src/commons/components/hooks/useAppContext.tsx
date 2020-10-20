import { useContext } from 'react';
import { AppContext, AppContextProps } from '../app/AppContextProvider';

export default function useAppContext(): AppContextProps {
  return useContext(AppContext);
}
