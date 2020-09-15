import { ALAppContext, ALAppContextProps } from 'components/providers/ALContextProvider';
import { useContext } from 'react';

export default function useALContext(): ALAppContextProps {
  return useContext(ALAppContext) as ALAppContextProps;
}
