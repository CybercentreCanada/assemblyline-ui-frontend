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

export type UserContextProps = {
    user: UserProfileProps,
    setUser: (user: UserProfileProps) => void,
    isReady: () => boolean
}


export const UserContext = React.createContext<UserContextProps>(null);

export type UserProviderProps = {
    user: UserProfileProps,
    setUser: (user: UserProfileProps) => void,
    isReady: () => boolean,
    provided?: boolean,
}

const UserProvider: React.FC<UserProviderProps> = ({user, isReady, setUser, provided = false, children}) => {

  if(!isReady() && !provided) {
    // TODO: maybe provide skeleton layout while awaiting.
    return <Box paddingTop={10}>
      <PageCenter width={50}>
        <CircularProgress color="inherit"/>
      </PageCenter>
    </Box>
  }

  // TODO: build in logic that check if there is a user or not.
  // - Provide fetch-user rest endpoint as property, and use endpoint to fetch it.
  // - If no user, then it can forward to a login page, provide fake user, etc...
  return <UserContext.Provider value={{user, setUser, isReady}} >
      {children}
    </UserContext.Provider>
}

export default UserProvider;