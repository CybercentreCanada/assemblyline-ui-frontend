import React, {useState} from "react";
import { useTranslation } from "react-i18next";

import {  OptionsObject } from 'notistack';
import { Button, TextField, Box,  CircularProgress, Typography, makeStyles, createStyles } from "@material-ui/core";

import { useLocation, useHistory } from "react-router-dom";

const useStyles = makeStyles(() =>
  createStyles({
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    }
  }),
);

type ResetPasswordNowProps = {
    buttonLoading: boolean, 
    setButtonLoading: (value: boolean) => void,
    enqueueSnackbar: (message: string, options: OptionsObject) => void,
    snackBarOptions: OptionsObject,
    setShownControls: (shownControls: string) => void
};
  
export function ResetPasswordNow(props: ResetPasswordNowProps){
    const location = useLocation();
    const history = useHistory();
    const { t } = useTranslation();
    const classes = useStyles();
    const params = new URLSearchParams(location.search);
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [done, setDone] = useState(false);

    function onSubmit(event){
        const resetRequestOptions: RequestInit = {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reset_id: params.get("reset_id"),
                password: password, 
                password_confirm: passwordConfirm
            })
        };
        
        props.setButtonLoading(true)
        fetch(`/api/v4/auth/reset_pwd/`, resetRequestOptions)
            .then(res => {
                return res.json()
            })
            .catch(() => {
                return {
                        api_error_message: t("api.unreachable"),
                        api_response: "",
                        api_server_version: "4.0.0",
                        api_status_code: 400
                    }
            })
            .then(api_data => {
                props.setButtonLoading(false)
                if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                    props.enqueueSnackbar(t("api.invalid"), props.snackBarOptions);
                }
                else if (api_data.api_status_code !== 200){
                    props.enqueueSnackbar(api_data.api_error_message, props.snackBarOptions);
                }
                else {
                    setDone(true)
                    if (params.get("reset_id")){
                        history.push("/")
                    }
                    setTimeout(() => props.setShownControls('up'), 7000) 
                }
            });
        event.preventDefault()
    }

    return (
        <form onSubmit={onSubmit}>
            <Box display={"flex"} flexDirection={"column"}>
                {done ? 
                    <>
                        <Typography align="center" variant="h6" gutterBottom={true}>{t("page.login.reset_now.done")}</Typography>
                        <Typography align="center" variant="caption">{t("page.login.reset_now.redirect")}</Typography>
                    </> :
                    <>
                        <TextField autoFocus type="password" variant={"outlined"} size={"small"} label={t("page.login.reset_now.password")} onChange={(event) => setPassword(event.target.value)}/>
                        <TextField style={{marginTop: ".5rem"}} type="password" variant={"outlined"} size={"small"} label={t("page.login.reset_now.password_confirm")} onChange={(event) => setPasswordConfirm(event.target.value)}/>
                        <Button type="submit" style={{marginTop: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                            {t("page.login.reset_now.button")}
                            {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </Button>
                    </>
                }
            </Box>
        </form>
    );
}

type ResetPasswordProps = {
    buttonLoading: boolean, 
    setButtonLoading: (value: boolean) => void,
    enqueueSnackbar: (message: string, options: OptionsObject) => void,
    snackBarOptions: OptionsObject
};
  
export function ResetPassword(props: ResetPasswordProps){
    const { t } = useTranslation();
    const classes = useStyles();
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    function onSubmit(event){
        const resetRequestOptions: RequestInit = {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email: email})
        };
        
        props.setButtonLoading(true)
        fetch(`/api/v4/auth/get_reset_link/`, resetRequestOptions)
            .then(res => {
                return res.json()
            })
            .catch(() => {
                return {
                        api_error_message: t("api.unreachable"),
                        api_response: "",
                        api_server_version: "4.0.0",
                        api_status_code: 400
                    }
            })
            .then(api_data => {
                props.setButtonLoading(false)
                if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                    props.enqueueSnackbar(t("api.invalid"), props.snackBarOptions);
                }
                else if (api_data.api_status_code !== 200){
                    props.enqueueSnackbar(api_data.api_error_message, props.snackBarOptions);
                }
                else {
                    setDone(true)
                }
            });
        event.preventDefault()
    }

    return (
        <form onSubmit={onSubmit}>
            <Box display={"flex"} flexDirection={"column"}>
                {done ? 
                    <Typography align="center">{t("page.login.reset.done")}</Typography> :
                    <>
                        <TextField autoFocus type="email" variant={"outlined"} size={"small"} label={t("page.login.reset.email")} onChange={(event) => setEmail(event.target.value)}/>
                        <Button type="submit" style={{marginTop: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                            {t("page.login.reset.button")}
                            {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </Button>
                    </>
                }
            </Box>
        </form>
    );
}