import React, {useState} from "react";
import { useTranslation } from "react-i18next";

import { useSnackbar, OptionsObject } from 'notistack';
import { Button, TextField, Box, useTheme, CircularProgress, createStyles, makeStyles, Theme } from "@material-ui/core";

import CardCentered from 'commons/components/layout/pages/CardCentered';
import useAppLayout from "commons/components/hooks/useAppLayout";

const useStyles = makeStyles((theme: Theme) =>
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

type OTPProps = {
    onSubmit: (event) => void,
    buttonLoading: boolean;
    setOneTimePass: (value: string) => void
};
  
function OneTimePassLogin(props: OTPProps){  
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <form onSubmit={props.onSubmit}>
            <Box display={"flex"} flexDirection={"column"}>
                <TextField inputProps={{ maxLength: 6 }} autoFocus variant={"outlined"} size={"small"} label={t("page.login.otp")} onChange={(event) => props.setOneTimePass(event.target.value)}/>
                <Button type="submit" style={{marginTop: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                    {t("page.login.button")}
                    {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
                
            </Box>
        </form>
    );
}

type LoginProps = {
    onSubmit: (event) => void,
    buttonLoading: boolean;
    setPassword: (value: string) => void, 
    setUsername: (value: string) => void
};
  
function UserPassLogin(props: LoginProps){
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <form onSubmit={props.onSubmit}>
            <Box display={"flex"} flexDirection={"column"}>
                <TextField autoFocus variant={"outlined"} size={"small"} label={t("page.login.username")} onChange={(event) => props.setUsername(event.target.value)}/>
                <TextField style={{marginTop: ".5rem"}} variant={"outlined"} size={"small"} type="password" label={t("page.login.password")} onChange={event => props.setPassword(event.target.value)}/>
                <Button type="submit" style={{marginTop: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                    {t("page.login.button")}
                    {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
                
            </Box>
        </form>
    );
}

export default function LoginScreen(){
    const theme = useTheme();
    const { getBanner } = useAppLayout();
    const [shownControls, setShownControls] = useState("up");
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [oneTimePass, setOneTimePass] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false);
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
        login(event.target[0]);
        event.preventDefault();
    }

    function login(focusTarget){
        if (buttonLoading){
            return
        }

        const requestOptions: RequestInit = {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({user: username, password: password, otp: oneTimePass})
        };

        setButtonLoading(true);
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
                setButtonLoading(false)
                if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                    enqueueSnackbar("Invalid data returned by API server.", snackBarOptions);
                }
                else if (api_data.api_status_code !== 200){
                    if (api_data.api_error_message === "Wrong OTP token" && shownControls !== 'otp'){
                        setShownControls("otp")
                    }
                    else{
                        enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                        focusTarget.select()
                        focusTarget.focus()
                    }
                }
                else {
                    window.location.reload(false);
                }
            });
    }

    return (
        <CardCentered>
            <Box color={theme.palette.primary.main} fontSize="30pt">{ getBanner(theme) }</Box>
            {
                {
                    'up': <UserPassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setPassword={setPassword} setUsername={setUsername}/>,
                    'otp': <OneTimePassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setOneTimePass={setOneTimePass}/>
                }[shownControls]
            }
        </CardCentered>
    );
}
