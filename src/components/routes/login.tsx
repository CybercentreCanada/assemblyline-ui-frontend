import React, {useState, useEffect} from "react";
import { useTranslation } from "react-i18next";

import { useSnackbar, OptionsObject } from 'notistack';
import { Button, TextField, Box, useTheme, CircularProgress, createStyles, makeStyles, Theme, Typography, Avatar, Link } from "@material-ui/core";
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import CardCentered from 'commons/components/layout/pages/CardCentered';
import useAppLayout from "commons/components/hooks/useAppLayout";
import toArrayBuffer from "helpers/toArrayBuffer";
import TextDivider from "components/visual/text_divider";
import { useLocation, useHistory } from "react-router-dom";
import Skeleton from '@material-ui/lab/Skeleton';


const CBOR = require('helpers/cbor.js')

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

type SecTokenProps = {
    enqueueSnackbar: (message, options) => void,
    setShownControls: (value: string) => void,
    setWebAuthNResponse: (value) => void,
    snackBarOptions: OptionsObject,
    username: string
};
  
function SecurityTokenLogin(props: SecTokenProps){  
    const { t } = useTranslation();
    const stRequestOptions: RequestInit = {
        method: 'GET',
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }
    };

    useEffect( () => {
        fetch(`/api/v4/webauthn/authenticate/begin/${props.username}/`, stRequestOptions)
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
                props.enqueueSnackbar("Invalid data returned by API server.", props.snackBarOptions);
            }
            else if (api_data.api_status_code !== 200){
                props.enqueueSnackbar(api_data.api_error_message, props.snackBarOptions);
            }
            else {
                let arrayData = toArrayBuffer(api_data.api_response);
                const options = CBOR.decode(arrayData.buffer);
                const credentialHelper = navigator.credentials;
                if (credentialHelper !== undefined){
                    credentialHelper.get(options).then(
                        function(assertion: PublicKeyCredential) {
                            let response = assertion.response as AuthenticatorAssertionResponse;
                            let assertion_data = CBOR.encode({
                                "credentialId": new Uint8Array(assertion.rawId),
                                "authenticatorData": new Uint8Array(response.authenticatorData),
                                "clientDataJSON": new Uint8Array(response.clientDataJSON),
                                "signature": new Uint8Array(response.signature)
                            });
                            
                            props.setWebAuthNResponse(Array.from(new Uint8Array(assertion_data)))
                        }).catch(
                            function(ex) {
                                console.log(`${ex.name}: ${ex.message}`)
                                props.setShownControls("otp")
                                props.enqueueSnackbar(t("page.login.securitytoken.error"), props.snackBarOptions);
                        });
                }
                else{
                    props.setShownControls("otp")
                    props.enqueueSnackbar(t("page.login.securitytoken.unavailable"), props.snackBarOptions);
                }
            }
        });
    // eslint-disable-next-line
    }, [])

    return (
        <Box display={"flex"} flexDirection={"column"} textAlign="center">
            <Box>
                <LockOutlinedIcon style={{fontSize: "108pt"}} color="action"/>
            </Box>
            <Typography variant="h6" color="textSecondary">{t("page.login.securitytoken")}</Typography>
        </Box>
    );
}

type OAuthProps = {
    avatar: string,
    username: string,
    oAuthToken: string,
    buttonLoading: boolean,
    onSubmit: (event) => void,
    reset: (event) => void
};
  
function OAuthLogin(props: OAuthProps){
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme()

    return (        
        <form onSubmit={props.onSubmit}>
            <Box display={"flex"} flexDirection={"column"} textAlign="center" justifyContent="center">
                {!props.oAuthToken ? <Skeleton variant="circle" style={{alignSelf: "center"}} width={144} height={144} /> :<Avatar style={{alignSelf: "center", width: theme.spacing(18), height: theme.spacing(18)}} src={props.avatar}/>}
                <Typography color="textPrimary" gutterBottom={true}>{!props.oAuthToken ? <Skeleton /> :props.username }</Typography>
                <Button type="submit" style={{marginTop: "1.5rem", marginBottom: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                    {t("page.login.button")}
                    {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
                <Link variant="body2" href="#" onClick={props.reset}>{t('page.login.other')}</Link>
            </Box>
        </form>
    );
}

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

type LoginScreenProps = {
    oAuthProviders: string[]
};

export default function LoginScreen(props){
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(location.search);
    const { t } = useTranslation();
    const theme = useTheme();
    const classes = useStyles();
    const { getBanner } = useAppLayout();
    const [shownControls, setShownControls] = useState(params.get("provider") ? "oauth" : "up");
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState("");
    const [oAuthToken, setOAuthToken] = useState("");
    const [oneTimePass, setOneTimePass] = useState("");
    const [webAuthNResponse, setWebAuthNResponse] = useState(null);
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

    function reset(event) {
        setWebAuthNResponse(null)
        setShownControls('up')
        setUsername("")
        setPassword("")
        setAvatar("")
        setOAuthToken("")
        setOneTimePass("")
        
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
        const loginRequestOptions: RequestInit = {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

        setButtonLoading(true);
        fetch('/api/v4/auth/login/', loginRequestOptions)
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
                }
                else {
                    window.location.reload(false);
                }
            });
    }

    useEffect(() => {
        console.log("useEffect called ! ")
        if (webAuthNResponse !== null){
            login(null)
        }
        if (shownControls === "oauth"){
            console.log('oauth')

            const oauthRequestOptions: RequestInit = {
                method: 'GET',
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                }
            };
            
            setButtonLoading(true);
            fetch(`/api/v4/auth/oauth/${location.search}`, oauthRequestOptions)
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
                        enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                        setShownControls("up")
                    }
                    else {
                        setAvatar(api_data.api_response.avatar)
                        setUsername(api_data.api_response.username)
                        setOAuthToken(api_data.api_response.oauth_token)
                        if (params.get("provider")){
                            history.push("/")
                        }
                    }
                });

        }
    // eslint-disable-next-line
    }, [webAuthNResponse, shownControls])

    return (
        <CardCentered>
            <Box style={{cursor: "pointer"}} onClick={() => setShownControls('up')}>{ getBanner(theme) }</Box>
            {
                {
                    'up': 
                        <>
                            <UserPassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setPassword={setPassword} setUsername={setUsername}/>
                            {props.oAuthProviders !== undefined && props.oAuthProviders.length !== 0 ? 
                                <>
                                    <TextDivider/>
                                    <Box display="flex" flexDirection="column" justifyContent="space-between">
                                        {props.oAuthProviders.map((item, idx) => (
                                            <Button key={idx} style={idx !== 0 ? {marginTop: "1.5rem"} : null} variant={"contained"} color={"primary"} disabled={props.buttonLoading} href={`/api/v4/auth/login/?redirect_to_login=false&oauth_provider=${item}`}>
                                                {`${t("page.login.button_oauth")} ${item}`}
                                                {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                                            </Button>
                                        ))}
                                    </Box>
                                </> : null }
                        </>,
                    'oauth': <OAuthLogin reset={reset} oAuthToken={oAuthToken} avatar={avatar} username={username} onSubmit={onSubmit} buttonLoading={buttonLoading}/>,
                    'otp': <OneTimePassLogin onSubmit={onSubmit} buttonLoading={buttonLoading} setOneTimePass={setOneTimePass}/>,
                    'sectoken': <SecurityTokenLogin setShownControls={setShownControls} enqueueSnackbar={enqueueSnackbar} snackBarOptions={snackBarOptions} setWebAuthNResponse={setWebAuthNResponse} username={username}/>
                }[shownControls]
            }
        </CardCentered>
    );
}
