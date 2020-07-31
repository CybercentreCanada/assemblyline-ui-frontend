import React from "react";
import { useTranslation } from "react-i18next";

import { Box, useTheme, Typography } from "@material-ui/core";

import useAppLayout from "../../commons/components/hooks/useAppLayout";
import CardCentered from '../../commons/components/layout/pages/CardCentered';


function Logout(){
    const { t } = useTranslation()
    const theme = useTheme();
    const { getBanner, hideMenus, setCurrentUser } = useAppLayout();

    hideMenus()

    // There is probably more stuff to be done to properly logout a user...
    setTimeout(() => {
        setCurrentUser(null)
        window.location.replace("/")
    }, 2000)

    return (
        <CardCentered>
            <Box textAlign="center">
                <Box color={theme.palette.primary.main} fontSize="30pt">{ getBanner(theme) }</Box>
                <Typography>{t("page.logout")}</Typography>
            </Box>
        </CardCentered>
    );
}

export default Logout;