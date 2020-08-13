import { useContext } from "react";
import {UserContextProps, UserContext} from "commons/components/user/UserProvider";

export default function useUser(): UserContextProps {
    return useContext(UserContext);
}