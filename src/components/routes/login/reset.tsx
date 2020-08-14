import React, {useState, useEffect} from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";

import { Button, TextField, Box,  CircularProgress, Typography, makeStyles, createStyles } from "@material-ui/core";

import useMyAPI from "components/hooks/useMyAPI";

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
    setButtonLoading: (value: boolean) => void
};
  
export function ResetPasswordNow(props: ResetPasswordNowProps){
    const location = useLocation();
    const history = useHistory();
    const { t } = useTranslation();
    const classes = useStyles();
    const apiCall = useMyAPI()
    const params = new URLSearchParams(location.search);
    const [resetID, setResetID] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [done, setDone] = useState(false);


    function onSubmit(event){
        apiCall({
            url: "/api/v4/auth/reset_pwd/",
            method: "POST",
            body: {
                reset_id: resetID,
                password: password, 
                password_confirm: passwordConfirm
            },
            onEnter: () => props.setButtonLoading(true),
            onExit: () => props.setButtonLoading(false),
            onSuccess: () => {
                setDone(true)
                setTimeout(() => window.location.reload(false), 7000) 
            }
        })
        event.preventDefault()
    }

    useEffect(() => {
        setResetID(params.get("reset_id"))
    
        if (params.get("reset_id")){
            history.push("/")
        }
        // eslint-disable-next-line
    }, [])

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
    setButtonLoading: (value: boolean) => void
};
  
export function ResetPassword(props: ResetPasswordProps){
    const { t } = useTranslation();
    const classes = useStyles();
    const apiCall = useMyAPI();
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    function onSubmit(event){
        apiCall({
            url: "/api/v4/auth/get_reset_link/",
            method: "POST",
            body: {email: email},
            onEnter: () => props.setButtonLoading(true),
            onExit: () => props.setButtonLoading(false),
            onSuccess: () => setDone(true)
        })
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