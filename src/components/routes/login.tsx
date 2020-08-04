import React, {useState} from "react";
import { useTranslation } from "react-i18next";

import { useSnackbar, OptionsObject } from 'notistack';
import {Button, TextField, Box, useTheme} from "@material-ui/core";

import CardCentered from '../../commons/components/layout/pages/CardCentered';
import useAppLayout from "../../commons/components/hooks/useAppLayout";


function UserPassLogin(){
    const { t } = useTranslation();
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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

    function onSubmit(event) {
        login(username, password);
        event.preventDefault();
    }

    function login(username_p, password_p){
        const requestOptions: RequestInit = {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({user: username_p, password: password_p})
        };

        fetch('/api/v4/auth/login/', requestOptions)
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
                    window.location.reload(false);
                }
            });
    }

    return (
        <form onSubmit={onSubmit}>
            <Box display={"flex"} flexDirection={"column"}>
                <TextField variant={"outlined"} size={"small"} label={t("page.login.username")} onChange={(event) => setUsername(event.target.value)}/>
                <TextField style={{marginTop: ".5rem"}} variant={"outlined"} size={"small"} type="password" label={t("page.login.password")} onChange={event => setPassword(event.target.value)}/>
                <Button type="submit" style={{marginTop: "1.5rem"}} variant={"contained"} color={"primary"}>{t("page.login.button")}</Button>
            </Box>
        </form>
    );
}

function LoginScreen(){
    const theme = useTheme();
    const { getBanner } = useAppLayout();

    return (
        <CardCentered>
            <Box color={theme.palette.primary.main} fontSize="30pt">{ getBanner(theme) }</Box>
            <UserPassLogin/>
        </CardCentered>
    );
}

export default LoginScreen;