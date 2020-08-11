import React, {useState} from "react";
import { useTranslation } from "react-i18next";

import {  OptionsObject } from 'notistack';
import { Button, TextField, Box,  CircularProgress, Typography, makeStyles, createStyles } from "@material-ui/core";

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

type SignUpProps = {
    buttonLoading: boolean, 
    setButtonLoading: (value: boolean) => void,
    enqueueSnackbar: (message: string, options: OptionsObject) => void,
    snackBarOptions: OptionsObject
};
  
export function SignUp(props: SignUpProps){
    const { t } = useTranslation();
    const classes = useStyles();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
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
                user: username,
                password: password, 
                password_confirm: passwordConfirm,
                email: email
            })
        };
        
        props.setButtonLoading(true)
        fetch(`/api/v4/auth/signup/`, resetRequestOptions)
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
                    <>
                        <Typography align="center">{t("page.login.signup.done")}</Typography>
                    </> :
                    <>
                        <TextField autoFocus variant={"outlined"} size={"small"} label={t("page.login.signup.username")} onChange={(event) => setUsername(event.target.value)}/>
                        <TextField style={{marginTop: ".5rem"}} type="password" variant={"outlined"} size={"small"} label={t("page.login.signup.password")} onChange={(event) => setPassword(event.target.value)}/>
                        <TextField style={{marginTop: ".5rem"}} type="password" variant={"outlined"} size={"small"} label={t("page.login.signup.password_confirm")} onChange={(event) => setPasswordConfirm(event.target.value)}/>
                        <TextField style={{marginTop: ".5rem"}} variant={"outlined"} size={"small"} label={t("page.login.signup.email")} onChange={(event) => setEmail(event.target.value)}/>
                        <Button type="submit" style={{marginTop: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                            {t("page.login.signup.button")}
                            {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </Button>
                    </>
                }
            </Box>
        </form>
    );
}
