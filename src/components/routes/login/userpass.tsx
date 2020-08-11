import React from "react";
import { useTranslation } from "react-i18next";

import { Button, TextField, Box, CircularProgress, createStyles, makeStyles } from "@material-ui/core";

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

type UserPassLoginProps = {
    onSubmit: (event) => void,
    buttonLoading: boolean;
    setPassword: (value: string) => void, 
    setUsername: (value: string) => void
};
  
export function UserPassLogin(props: UserPassLoginProps){
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