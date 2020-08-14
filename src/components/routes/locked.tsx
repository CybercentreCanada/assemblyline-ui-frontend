import React from "react";
import { useTranslation } from 'react-i18next';

import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import HourglassEmptyOutlinedIcon from '@material-ui/icons/HourglassEmptyOutlined';

import PageCenter from "commons/components/layout/pages/PageCenter";

const LockedPage = () => {
    const { t } = useTranslation();
    return (
        <PageCenter width={65}>
            <Box pt={6} textAlign="center" fontSize={200}>
                <HourglassEmptyOutlinedIcon color="secondary" fontSize="inherit" />
            </Box>
            <Box pb={2}><Typography variant="h3">{t("page.locked.title")}</Typography></Box>
            <Box><Typography variant="h6">{t("page.locked.description")}</Typography></Box>
        </PageCenter>
    );
};

export default LockedPage;