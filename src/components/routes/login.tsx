import React, {useState, useEffect} from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";

import { useSnackbar, OptionsObject } from 'notistack';
import { Button, Box, useTheme, CircularProgress, createStyles, makeStyles, Theme, Typography, Link } from "@material-ui/core";

import CardCentered from 'commons/components/layout/pages/CardCentered';
import useAppLayout from "commons/components/hooks/useAppLayout";
import { OAuthLogin } from "components/routes/login/oauth";
import { OneTimePassLogin } from "components/routes/login/otp";
import { ResetPassword, ResetPasswordNow } from "components/routes/login/reset"
import { SecurityTokenLogin } from "components/routes/login/sectoken";
import { SignUp } from "components/routes/login/signup";
import { UserPassLogin } from "components/routes/login/userpass";
import TextDivider from "components/visual/text_divider";
import useMyAPI from "components/hooks/useMyAPI";

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

type LoginScreenProps = {
    allowUserPass: boolean,
    allowSignup: boolean,
    allowPWReset: boolean,
    oAuthProviders: string[]
};

export default function LoginScreen(props: LoginScreenProps){
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(location.search);
    const { t } = useTranslation();
    const theme = useTheme();
    const classes = useStyles();
    const apiCall = useMyAPI();
    const { getBanner } = useAppLayout();
    const [shownControls, setShownControls] = useState(params.get("provider") ? "oauth" : params.get("reset_id") ? "reset_now" : "login");
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState("");
    const [oAuthToken, setOAuthToken] = useState("");
    const [oneTimePass, setOneTimePass] = useState("");
    const [webAuthNResponse, setWebAuthNResponse] = useState(null);
    const [buttonLoading, setButtonLoading] = useState(false);
    const pwPadding = props.allowSignup ? 1 : 2
    const snackBarOptions: OptionsObject = {
        variant: "error",
        autoHideDuration: 5000,
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        onClick: snack => {
            closeSnackbar()
        }
    }
    const snackBarSuccessOptions: OptionsObject = {
        variant: "success",
        autoHideDuration: 10000,
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

    function reset(event) {
        if ((shownControls === "oauth" && oAuthToken) || shownControls !== "oauth"){
            setWebAuthNResponse(null)
            setShownControls("login")
            setUsername("")
            setPassword("")
            setAvatar("")
            setOAuthToken("")
            setOneTimePass("")
        }
        event.preventDefault();
    }

    function resetPW(event) {
        setShownControls('reset')
        event.preventDefault();
    }

    function signup(event) {
        setShownControls('signup')
        event.preventDefault();
    }

    function login(focusTarget){
        if (buttonLoading){
            return
        }

        const data = {
            user: username, 
            password: password, 
            otp: oneTimePass,
            webauthn_auth_resp: webAuthNResponse,
            oauth_token: oAuthToken
        }

        apiCall({
            url: "/api/v4/auth/login/",
            method: "POST",
            body: data,
            reloadOnUnauthorize: false,
            onEnter: () => setButtonLoading(true), 
            onExit: () => setButtonLoading(false),
            onFailure: (api_data) => {
                if (api_data.api_error_message === "Wrong OTP token" && shownControls !== 'otp'){
                    setShownControls("otp")
                }
                else if (api_data.api_error_message === "Wrong Security Token" && shownControls === "sectoken"){
                    setShownControls("otp")
                    enqueueSnackbar(t("page.login.securitytoken.error"), snackBarOptions);
                }
                else if (api_data.api_error_message === "Wrong Security Token" && shownControls !== "sectoken"){
                    setShownControls("sectoken")
                }
                else{
                    enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                    if (focusTarget !== null){
                        if (focusTarget.hasOwnProperty('select')){
                            focusTarget.select()
                            focusTarget.focus()
                        }
                    }
                }
            }, 
            onSuccess: () => {
                window.location.reload(false)
            }
        })
    }

    useEffect(() => {
        if (webAuthNResponse !== null){
            login(null)
        }
        else if (shownControls === "oauth"){
            apiCall({
                url: `/api/v4/auth/oauth/${location.search}`,
                onSuccess: (api_data) => {
                    setAvatar(api_data.api_response.avatar)
                    setUsername(api_data.api_response.username)
                    setOAuthToken(api_data.api_response.oauth_token)
                },
                onFailure: (api_data) => {
                    enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                    setShownControls("login")
                },
                onFinalize: () => {
                    if (params.get("provider")){
                        history.push(localStorage.getItem('nextLocation') || "/")
                    }
                }
            })
        }
        else if (params.get("registration_key")){
            apiCall({
                url: "/api/v4/auth/signup_validate/",
                method: 'POST',
                body: {registration_key: params.get("registration_key")},
                onSuccess: () => enqueueSnackbar(t('page.login.signup.completed'), snackBarSuccessOptions),
                onFinalize: () => history.push("/")
            })
        }
    // eslint-disable-next-line
    }, [webAuthNResponse, shownControls])

    return (
        <CardCentered>
            <Box style={{cursor: "pointer"}} onClick={reset}>{ getBanner(theme) }</Box>
            {
                {
                    "login": 
                        <>
                            {props.allowUserPass ? <UserPassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setPassword={setPassword} setUsername={setUsername}/> : null}
                            {props.allowSignup ? <Typography align="center" variant="caption" style={{marginTop: theme.spacing(2)}}>{t('page.login.signup')}&nbsp;<Link href="#" onClick={signup}>{t('page.login.signup.link')}</Link></Typography> : null }
                            {props.allowPWReset ? <Typography align="center" variant="caption" style={{marginTop: theme.spacing(pwPadding)}}>{t('page.login.reset.desc')}&nbsp;<Link href="#" onClick={resetPW}>{t('page.login.reset.link')}</Link></Typography> : null }
                            {props.oAuthProviders !== undefined && props.oAuthProviders.length !== 0 ? 
                                <>
                                    {props.allowUserPass ? <TextDivider/> : null}
                                    <Box display="flex" flexDirection="column" justifyContent="space-between">
                                        {props.oAuthProviders.map((item, idx) => (
                                            <Button key={idx} style={idx !== 0 ? {marginTop: "1.5rem"} : null} variant={"contained"} color={"primary"} disabled={buttonLoading} onClick={() => localStorage.setItem(`nextLocation`, `${location.pathname}${location.search}`)} href={`/api/v4/auth/login/?oauth_provider=${item}`}>
                                                {`${t("page.login.button_oauth")} ${item}`}
                                                {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                                            </Button>
                                        ))}
                                    </Box>
                                </> : null }
                        </>,
                    'signup': <SignUp setButtonLoading={setButtonLoading} buttonLoading={buttonLoading}/>,
                    'reset': <ResetPassword setButtonLoading={setButtonLoading} buttonLoading={buttonLoading}/>,
                    'reset_now': <ResetPasswordNow setButtonLoading={setButtonLoading} buttonLoading={buttonLoading}/>,
                    'oauth': <OAuthLogin reset={reset} oAuthToken={oAuthToken} avatar={avatar} username={username} onSubmit={onSubmit} buttonLoading={buttonLoading}/>,
                    'otp': <OneTimePassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setOneTimePass={setOneTimePass}/>,
                    'sectoken': <SecurityTokenLogin setShownControls={setShownControls} enqueueSnackbar={enqueueSnackbar} snackBarOptions={snackBarOptions} setWebAuthNResponse={setWebAuthNResponse} username={username}/>
                }[shownControls]
            }
        </CardCentered>
    );
}
