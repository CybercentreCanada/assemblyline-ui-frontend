import { useState } from "react";
import { UserProfileProps, UserProviderProps } from "commons/components/user/UserProvider";

export interface CustomUser extends UserProfileProps {
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

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): UserProviderProps<CustomUser> {
    const [user, setState] = useState<CustomUser>(null);

    const setUser = (user: CustomUser) => {
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
        provided: true  // Skip user provider loading screen
    };
}
