import { useContext } from "react";
import {UserContextProps, UserContext, UserProfileProps} from "../user/UserProvider";

export default function useUser<U extends UserProfileProps>(): UserContextProps<U> {
    return useContext(UserContext) as UserContextProps<U>;
}