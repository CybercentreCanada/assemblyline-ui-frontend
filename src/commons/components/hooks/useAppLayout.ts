import { useContext } from "react";
import { AppLayoutContext, AppLayoutContextProps } from "commons/components/layout/LayoutProvider";

export default function useAppLayout(): AppLayoutContextProps {
    return useContext(AppLayoutContext);
}