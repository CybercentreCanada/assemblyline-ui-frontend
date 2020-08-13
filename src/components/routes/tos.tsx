import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { makeStyles, useTheme, Button, CircularProgress, Box, Typography, Link } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import PageCenter from "commons/components/layout/pages/PageCenter";
import useAppLayout from "commons/components/hooks/useAppLayout";
import useUser from "commons/components/hooks/useUser";
import { CustomUser } from "components/hooks/useMyUser";
import useMyAPI from "components/hooks/useMyAPI";

const Markdown = require('react-markdown')


export default function Tos() {
    const {t} = useTranslation()
    const theme = useTheme();
    const [ tos, setTos ] = useState("")
    const [ buttonLoading, setButtonLoading ] = useState(false)
    const { getBanner } = useAppLayout();
    const { user: currentUser } = useUser<CustomUser>();
    const apiCall = useMyAPI()
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

    function acceptTOS(){
        apiCall(`/api/v4/user/tos/${currentUser.username}/`, () => window.location.reload(false),
                "GET", true, true, () => setButtonLoading(true), () => setButtonLoading(false))
    }

    function cancelTOS(){
        apiCall('/api/v4/auth/logout/', () => window.location.reload(false),
                "GET", true, true, () => setButtonLoading(true), () => setButtonLoading(false))
    }

    useEffect(() => {
        apiCall('/api/v4/help/tos/', (api_data) => setTos(api_data.api_response))
    // eslint-disable-next-line
    }, [])

    return (
        <PageCenter>
            <Box className={classes.page} display={'inline-block'} textAlign="center">
                <Box>
                    { getBanner(theme) }
                </Box>
                <Box mb={6} textAlign="left">
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
                            <Box>
                                <Button style={{marginTop: "3rem", marginBottom: "3rem"}} variant={"contained"} color={"primary"} disabled={buttonLoading} onClick={acceptTOS}>
                                    {t("page.tos.button")}
                                    {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                                </Button>
                                <Button style={{marginLeft:"1rem", marginTop: "3rem", marginBottom: "3rem"}} variant={"contained"} color={"secondary"} disabled={buttonLoading} onClick={cancelTOS}>
                                    {t("page.tos.logout")}
                                    {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                                </Button>
                            </Box>
                            
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
