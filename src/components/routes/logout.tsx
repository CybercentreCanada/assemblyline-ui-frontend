import React from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar, OptionsObject } from "notistack";

import { Box, useTheme, Typography, CircularProgress } from "@material-ui/core";

import useAppLayout from "../../commons/components/hooks/useAppLayout";
import CardCentered from '../../commons/components/layout/pages/CardCentered';


function Logout(){
    const { t } = useTranslation()
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
    const theme = useTheme();
    const { getBanner, hideMenus } = useAppLayout();
    const requestOptions: RequestInit = {
        method: 'GET',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }
    };
    const snackBarOptions: OptionsObject = {
        variant: "error",
        autoHideDuration: 4000,
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        onClick: snack => {
            closeSnackbar()
        }
    }

    hideMenus()

    fetch('/api/v4/auth/logout/', requestOptions)
        .then(res => {
            return res.json()
        })
        .catch(() => {
            return {
                    api_error_message: "API server unreachable.",
                    api_response: "",
                    api_server_version: "4.0.0",
                    api_status_code: 400
                }
        })
        .then(api_data => {
            if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                enqueueSnackbar("Invalid data returned by API server.", snackBarOptions);
            }
            else if (api_data.api_status_code !== 200){
                enqueueSnackbar(api_data.api_error_message, snackBarOptions);
            }
            else {
                setTimeout(() => {
                    window.location.replace("/")
                }, 500)
            }
        });

    return (
        <CardCentered>
            <Box textAlign="center">
                { getBanner(theme) }
                <Box mb={3}>
                    <Typography>{t("page.logout")}</Typography>
                </Box>
                <CircularProgress size={24}/>
            </Box>
        </CardCentered>
    );
}

export default Logout;