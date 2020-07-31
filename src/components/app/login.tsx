import React, {useState} from "react";
import { useSnackbar, OptionsObject } from 'notistack';

import {Button, TextField, Link, Box, makeStyles, useTheme} from "@material-ui/core";

import TextDivider from "../visual/text_divider";
import useAppLayout from "../../commons/components/hooks/useAppLayout";


function AuthProvider(props){
    return <Button variant={"contained"} color={"primary"}>Sign in with {props.name}</Button>;
}

function UserPassLogin(){
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
        <Box display={"flex"}
             flexDirection={"column"}>
            <TextField variant={"outlined"} size={"small"} label="username" onChange={(event) => setUsername(event.target.value)}/>
            <TextField style={{marginTop: ".5rem"}} variant={"outlined"} size={"small"} type="password" label="password" onChange={event => setPassword(event.target.value)}/>
            <Button style={{marginTop: ".5rem"}} variant={"contained"} color={"primary"} onClick={() => login(username, password)}>Sign in</Button>
            <div style={{marginTop: "1rem", display: "block", textAlign: "center", fontSize: "0.75rem"}}>
                Do not have an account? <Link href="#">Sign up!</Link>
            </div>
            <div style={{marginTop: ".5rem", display: "block", textAlign: "center", fontSize: "0.75rem"}}>
                Forgot password? <Link href="#">Reset it!</Link>
            </div>
        </Box>
    );
}

function LoginScreen(){
    const theme = useTheme();
    const { getBanner } = useAppLayout();
    const useStyles = makeStyles((theme) => ({
      card: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: "4px",
        [theme.breakpoints.down('sm')]: {
            width: "100%",
            maxWidth: "22rem",
            padding: "1rem"
        },
        [theme.breakpoints.up('sm')]: {
            boxShadow: "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
            width: "22rem",
            padding: "0 2rem 3rem"
        }
      },
    }));
    const classes = useStyles();

    return (
        <div
            className={classes.card}
            style={{
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: '50%',
                left: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: "22rem"}}>
                {getBanner(theme)}
                <UserPassLogin/>
                <TextDivider/>
                <AuthProvider name={"Azure AD"}/>
        </div>
    );
}

export default LoginScreen