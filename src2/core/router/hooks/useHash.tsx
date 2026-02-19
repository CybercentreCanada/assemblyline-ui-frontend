import { useLocation } from 'react-router';

export const useHash = <Hash,>() => {
  const location = useLocation();
  return location.hash as Hash;
};
