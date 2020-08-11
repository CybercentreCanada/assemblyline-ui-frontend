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

type OTPProps = {
    onSubmit: (event) => void,
    buttonLoading: boolean;
    setOneTimePass: (value: string) => void
};
  
export function OneTimePassLogin(props: OTPProps){  
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