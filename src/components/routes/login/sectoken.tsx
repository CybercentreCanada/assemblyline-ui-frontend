import React, {useEffect} from "react";
import { useTranslation } from "react-i18next";

import { OptionsObject } from 'notistack';
import { Box, Typography } from "@material-ui/core";
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import toArrayBuffer from "helpers/toArrayBuffer";

const CBOR = require('helpers/cbor.js')

type SecTokenProps = {
    enqueueSnackbar: (message: string, options: OptionsObject) => void,
    setShownControls: (value: string) => void,
    setWebAuthNResponse: (value) => void,
    snackBarOptions: OptionsObject,
    username: string
};
  
export function SecurityTokenLogin(props: SecTokenProps){  
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
                    api_error_message: t("api.unreachable"),
                    api_response: "",
                    api_server_version: "4.0.0",
                    api_status_code: 400
                }
        })
        .then(api_data => {
            if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                props.enqueueSnackbar(t("api.invalid"), props.snackBarOptions);
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