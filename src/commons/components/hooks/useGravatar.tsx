import { useMemo } from "react";
const md5 = require("md5");

const useGravatar = (email: string)  => {
    return useMemo(() => `https://s.gravatar.com/avatar/${md5(email)}?d=404`, [email])
}

export default useGravatar

