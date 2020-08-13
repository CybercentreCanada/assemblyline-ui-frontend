import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar, OptionsObject } from "notistack";

import { makeStyles, useTheme, Button, CircularProgress, Box, Typography, Link } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import PageCenter from "commons/components/layout/pages/PageCenter";
import useAppLayout from "commons/components/hooks/useAppLayout";
import useMyUser from "components/hooks/useMyUser";
import getXSRFCookie from "helpers/xsrf";

const Markdown = require('react-markdown')


export default function Tos() {
    const {t} = useTranslation()
    const theme = useTheme();
    const [ tos, setTos ] = useState("")
    const [ buttonLoading, setButtonLoading ] = useState(false)
    const { getBanner } = useAppLayout();
    const { user: currentUser } = useMyUser();
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

    const useStyles = makeStyles((theme) => ({
        no_pad: {
            padding: 0
        },
        page: {
            maxWidth: "960px", 
            width: "100%",
            [theme.breakpoints.down("sm")]: {
                maxWidth: "100%",
            },
            [theme.breakpoints.only("md")]: {
                maxWidth: "630px",
            },
        },
        buttonProgress: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
        }
    }));
    const classes = useStyles();

    function acceptTos(){
        const acceptRequestOptions: RequestInit = {
            method: 'GET',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": getXSRFCookie()
            }
        };
        setButtonLoading(true);
        fetch(`/api/v4/user/tos/${currentUser.username}/`, acceptRequestOptions)
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
                setButtonLoading(false);
                if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                    enqueueSnackbar(t("api.invalid"), snackBarOptions);
                }
                else if (api_data.api_status_code !== 200){
                    enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                }
                else {
                    window.location.reload(false)
                }
            });
    }

    useEffect(() => {
        const requestOptions: RequestInit = {
            method: 'GET',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": getXSRFCookie()
            }
        };
        
        fetch('/api/v4/help/tos/', requestOptions)
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
                    enqueueSnackbar(t("api.invalid"), snackBarOptions);
                }
                else if (api_data.api_status_code !== 200){
                    enqueueSnackbar(api_data.api_error_message, snackBarOptions);
                }
                else {
                    setTos(api_data.api_response)
                }
            });
    // eslint-disable-next-line
    }, [])

    return (
        <PageCenter>
            <Box className={classes.page} display={'inline-block'} textAlign="center">
                <Box>
                    { getBanner(theme) }
                </Box>
                <Box textAlign="left">
                    <Typography variant={"h3"} gutterBottom={true}>{t("page.tos")}</Typography>
                </Box>
                {tos ? 
                    <>
                        <Box textAlign="left">
                            <Markdown source={tos} renderers={{link: Link}}/>
                        </Box>
                        { currentUser.agrees_with_tos ? 
                            <Box mt={6}>
                                <Typography variant={"subtitle1"} color={"secondary"}>{t('page.tos.agreed')}</Typography>
                            </Box> 
                        : 
                            <Button style={{marginTop: "3rem", marginBottom: "3rem"}} variant={"contained"} color={"primary"} disabled={buttonLoading} onClick={acceptTos}>
                                {t("page.tos.button")}
                                {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                            </Button>
                        }
                    </>
                : 
                    <>
                        <Skeleton style={{marginBottom: 12}}/>
                        <Skeleton style={{marginBottom: 12}}/>
                        <Skeleton style={{marginBottom: 12}}/>
                        <Skeleton style={{marginBottom: 12}}/>
                        <Skeleton style={{marginBottom: 12}}/>
                        <Skeleton/>
                    </>
                }
            </Box>
        </PageCenter>
    );
}
