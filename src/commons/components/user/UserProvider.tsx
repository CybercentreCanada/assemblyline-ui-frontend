import React from 'react';

export type UserProfileProps = {
  username: string;
  email: string;
  name: string;
  avatar: string;
  is_admin: boolean;
};

export type ValidatedProp = {
  prop: string;
  value: any;
};

export interface UserContextProps<U extends UserProfileProps> {
  user: U;
  setUser: (user: U) => void;
  isReady: () => boolean;
  validateProps: (props: ValidatedProp[]) => boolean;
}

export interface UserProviderProps<U extends UserProfileProps> extends UserContextProps<U> {
  children: React.ReactNode;
}

export const UserContext = React.createContext<UserContextProps<UserProfileProps>>(null);

function UserProvider<U extends UserProfileProps>(props: UserProviderProps<U>) {
  const { children, ...contextProps } = props;
  return <UserContext.Provider value={contextProps}>{children}</UserContext.Provider>;
}

export default UserProvider;
