import React, {useState} from "react";
import { useTranslation } from "react-i18next";

import { useSnackbar, OptionsObject } from 'notistack';
import {Button, TextField, Box, useTheme} from "@material-ui/core";

import CardCentered from '../../commons/components/layout/pages/CardCentered';
import useAppLayout from "../../commons/components/hooks/useAppLayout";


function UserPassLogin(){
    const { t } = useTranslation();
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
    const { setCurrentUser } = useAppLayout();
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
        if (!login(username, password)){
            event.preventDefault();
        }
    }

    function login(username_p, password_p){
        // This is obvisouly not how you should do authentification... perhaps you can call an API? 
        if (username_p === null || username_p === null || username_p === "" || 
            password_p === null || password_p === null || password_p === ""){
            enqueueSnackbar(t("page.login.error"), snackBarOptions)
            return false;
        }
        else{
            setCurrentUser({
                username: "sgaron",
                name: "Steve Garon",
                //email: "sgaron.cse@gmail.com",
                email: "steve.garon@cyber.gc.ca",
                avatar: "https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png"
            })
            return true;
        }
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