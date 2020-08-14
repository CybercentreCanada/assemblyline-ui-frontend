import { useSnackbar, OptionsObject } from "notistack";
import getXSRFCookie from "helpers/xsrf";
import { useTranslation } from "react-i18next";

export type APIResponseProps = {
    api_error_message: string,
    api_response: any,
    api_server_version: string,
    api_status_code: number,
}

export default function useMyAPI() {
    const {t} = useTranslation()
    const { enqueueSnackbar, closeSnackbar }  = useSnackbar();
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

    function apiCall(url: string, method: string = "GET", 
                     onSuccess: (api_data: APIResponseProps) => void = null, 
                     onFailure: (api_data: APIResponseProps) => void = null,
                     onEnter: () => void = null, 
                     onExit: () => void = null, 
                     onFinalize: (api_data: APIResponseProps) => void = null){
        const requestOptions: RequestInit = {
            method: method,
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": getXSRFCookie()
            }
        };

        // Run enter callback
        if (onEnter) onEnter()

        // Fetch the URL
        fetch(url, requestOptions)
            .then(res => {
                if (res.status === 401){
                    // Trigger a page reload, we're not logged in anymore
                    window.location.reload(false)
                }
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
                // Run finished Callback
                if (onExit) onExit()

                // Check Api response validity
                if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                    enqueueSnackbar(t("api.invalid"), snackBarOptions);
                }
                // Detect login request
                else if (api_data.api_status_code === 401){
                    // Do nothing... we are reloading the page
                    return    
                }
                // Handle errors
                else if (api_data.api_status_code !== 200){
                    // Run failure callback
                    if (onFailure){ 
                        onFailure(api_data)
                    }
                    else {
                        // Default failure handler, show toast error 
                        enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                    }
                }
                // Handle success
                else if (onSuccess){
                    // Run success callback
                    onSuccess(api_data)
                }
                if (onFinalize) onFinalize(api_data)
            });
    }

    return apiCall
}