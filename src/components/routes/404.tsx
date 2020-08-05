import React from "react";
import { useTranslation } from 'react-i18next';

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import LinkOffIcon from '@material-ui/icons/LinkOff';

import PageCenter from "commons/components/layout/pages/PageCenter";

const NotFoundPage = () => {
    const { t } = useTranslation();
    return (
        <PageCenter width={75}>
            <Box pt={6} textAlign="center" fontSize={200}>
                <LinkOffIcon color="secondary" fontSize="inherit" />
            </Box>
            <Box pb={2}><Typography variant="h2">{t("page.404.title")}</Typography></Box>
            <Box><Typography variant="h5">{t("page.404.description")}</Typography></Box>
        </PageCenter>
    );
};

export default NotFoundPage;