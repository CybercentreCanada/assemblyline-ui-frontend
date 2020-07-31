import { useContext } from "react";
import { AppLayoutContext, AppLayoutContextProps } from "../layout/LayoutProvider";

export default function useAppLayout(): AppLayoutContextProps {
    return useContext(AppLayoutContext);
}