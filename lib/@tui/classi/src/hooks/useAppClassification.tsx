import { useContext } from 'react';
import { AppClassificationContext } from '../providers/AppClassificationProvider';

export const useAppClassification = () => {
  return useContext(AppClassificationContext);
};
