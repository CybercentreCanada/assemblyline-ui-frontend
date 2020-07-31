import React from "react";
import { useTranslation } from 'react-i18next';

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import PageCenter from "../../commons/components/layout/pages/PageCenter";

const NotFoundPage = () => {
    const { t } = useTranslation();
    return (
        <PageCenter width={75}>
            <Box pt={10} pb={6}>
                <img alt={t("page.404_dl.alt")} src="/images/dead_link.png" style={{maxHeight:"300px", maxWidth: "90%"}}/>
            </Box>
            <Box><Typography variant="h5">{t("page.404_dl.description")}</Typography></Box>
        </PageCenter>
    );
};

export default NotFoundPage;