import React from "react";
import { useTranslation } from "react-i18next";

import { Button, Box, useTheme, CircularProgress, createStyles, makeStyles, Typography, Avatar, Link } from "@material-ui/core";

import Skeleton from '@material-ui/lab/Skeleton';

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

type OAuthProps = {
    avatar: string,
    username: string,
    oAuthToken: string,
    buttonLoading: boolean,
    onSubmit: (event) => void,
    reset: (event) => void
};
  
export function OAuthLogin(props: OAuthProps){
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme()

    return (        
        <form onSubmit={props.onSubmit}>
            <Box display={"flex"} flexDirection={"column"} textAlign="center" justifyContent="center">
                {!props.oAuthToken ? <Skeleton variant="circle" style={{alignSelf: "center"}} width={144} height={144} /> :<Avatar style={{alignSelf: "center", width: theme.spacing(18), height: theme.spacing(18)}} src={props.avatar}/>}
                <Typography color="textPrimary" gutterBottom={true}>{!props.oAuthToken ? <Skeleton /> :props.username }</Typography>
                {!props.oAuthToken ? 
                    <Skeleton style={{height: "56px", marginTop: "1.5rem", marginBottom: "1.5rem"}} /> : 
                    <Button type="submit" style={{marginTop: "1.5rem", marginBottom: "1.5rem"}} variant={"contained"} color={"primary"} disabled={props.buttonLoading}>
                        {t("page.login.button")}
                        {props.buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </Button>}
                {!props.oAuthToken ?
                    <Skeleton /> :
                    <Link variant="body2" href="#" onClick={props.reset}>{t('page.login.other')}</Link>}
            </Box>
        </form>
    );
}