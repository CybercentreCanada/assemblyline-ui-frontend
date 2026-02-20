import { useLocation } from 'react-router';

export type useHashProps = undefined | {};

export const useHash = <Hash,>(props: useHashProps = null) => {
  const location = useLocation();
  return location.hash as Hash;
};
