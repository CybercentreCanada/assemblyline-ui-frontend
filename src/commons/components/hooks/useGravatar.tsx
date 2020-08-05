import { useMemo } from "react";
const md5 = require("md5");

const useGravatar = (userEmail: string)  => {
    let email = userEmail ? userEmail : ""
    return useMemo(() => `https://s.gravatar.com/avatar/${md5(email)}?d=404`, [email])
}

export default useGravatar
