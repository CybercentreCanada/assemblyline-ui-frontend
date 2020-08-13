import { useState } from "react";

export type CustomUserProfileProps = {
    // Original props
    username: string,
    email: string,
    name: string,
    avatar: string,
    is_admin: boolean
    
    //Al specific props
    agrees_with_tos: boolean,
    allow_2fa: boolean,
    allow_apikeys: boolean,
    allow_security_tokens: boolean,
    c12n_enforcing: boolean,
    classification: string,
    groups: string[],
    is_active: boolean,
    read_only: boolean,
    type: string[]
}

export type CustomUserProviderProps = {
    user: CustomUserProfileProps,
    setUser: (user: CustomUserProfileProps) => void,
    isReady: () => boolean,
    provided?: boolean,
}

// The local storage key used to store user profile info.
const STORED_USER_KEY = 'currentUser';

// This is obviously not where the login user should be fetch from,
//   maybe an API call or a checking a secure session cookie
const getStoredUser = () =>  {
    const stored = localStorage.getItem(STORED_USER_KEY);
    return stored ? JSON.parse(stored) : null
}

// Update the local storage user.
const setStoredUser = (user: CustomUserProfileProps) =>  {
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
}



// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): CustomUserProviderProps {
    const [user, setState] = useState<CustomUserProfileProps>(getStoredUser());

    const setUser = (user: CustomUserProfileProps) => {
        setStoredUser(user);
        setState(user);
    }

    const isReady = () => {
        if (user === null || !user.agrees_with_tos || !user.is_active){
            return false
        }

        return true
    }

    return {
        user,
        setUser,
        isReady,
        provided: true  // this indicates the UserProvider to not display progress.
    };
}