import React from "react";
import { Box, CircularProgress } from "@material-ui/core";
import PageCenter from "commons/components/layout/pages/PageCenter";

export type UserProfileProps = {
  username: string,
  email: string,
  name: string,
  avatar: string,
  is_admin: boolean
}

export interface UserContextProps<U extends UserProfileProps> {
    user: U,
    setUser: (user: U) => void,
    isReady: () => boolean
}

export interface UserProviderProps<U extends UserProfileProps>  extends UserContextProps <U> {
    provided?: boolean,
    children?: React.ReactNode
}

export const UserContext = React.createContext<UserContextProps<UserProfileProps>>(null);

function UserProvider<U extends UserProfileProps>(props: UserProviderProps<U>) {
  const {children, provided, ...contextProps} = props;

  if(!contextProps.isReady() && !provided) {
    // TODO: maybe provide skeleton layout while awaiting.
    return <Box paddingTop={10}>
      <PageCenter width={50}>
        <CircularProgress color="inherit"/>
      </PageCenter>
    </Box>
  }

  return <UserContext.Provider value={contextProps} >
      {children}
    </UserContext.Provider>
}

export default UserProvider;