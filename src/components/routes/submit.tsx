import React from "react";
import { useDropzone } from 'react-dropzone';
import { AiOutlineSecurityScan } from 'react-icons/ai'
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { makeStyles, useTheme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from '@material-ui/lab/TabPanel';
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import PageCenter from "../../commons/components/layout/pages/PageCenter";
import useAppLayout from "../../commons/components/hooks/useAppLayout";


function FileDropper(props) {
  const {t} = useTranslation()
  const {acceptedFiles, getRootProps, getInputProps, isDragActive} = useDropzone();
  const useStyles = makeStyles((theme) => ({
    drop_zone: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: theme.spacing(3),
      backgroundColor: theme.palette.action.hover,
      outline: "none",
      border: `2px ${theme.palette.action.disabled} dashed`,
      borderRadius: "6px",
      color: theme.palette.action.disabled,
      "&:hover": {
        border: `2px ${theme.palette.text.disabled} dashed`,
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.disabled,
        cursor: "pointer"
      }
    },
    "drag_enter": {
      border: `2px ${theme.palette.text.disabled} dashed`,
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.text.disabled
    }}));
  const classes = useStyles();

  let dropperText;
  if (acceptedFiles.length > 0 ){
    dropperText = <Box textAlign={'center'}>
                    <Typography variant={"body1"}><b>{acceptedFiles[0].name}</b></Typography>
                    <Typography variant={"body2"} align={"center"}>{acceptedFiles[0].size} {t('page.submit.file.dragzon.byte')}</Typography>
                  </Box>
  }
  else{
  dropperText = <Typography variant={"body1"}><b>{t("page.submit.file.dragzone")}</b></Typography>;
  }

  return (
    <Box>
      <div {...getRootProps()} className={acceptedFiles.length>0||isDragActive ? classes.drop_zone + ' ' + classes.drag_enter : classes.drop_zone}>
        <input {...getInputProps()} />
        <AiOutlineSecurityScan style={{fontSize: '140px'}}/>
        {dropperText}
      </div>
      <Box marginTop="2rem">
        {acceptedFiles.length === 0 ? "" : <Button color={"primary"} variant={"contained"}>{t("page.submit.file.button")}</Button>}
      </Box>
    </Box>
  );
}

function Submit() {
  const {t} = useTranslation()
  const theme = useTheme();
  const { getBanner } = useAppLayout();
  const [value, setValue] = React.useState('0');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
    }
  }));
  const classes = useStyles();
  return (
    <PageCenter>
      <Box className={classes.page} display={'inline-block'} textAlign="center">
        <Box display={'inline-block'} marginBottom="2rem">
          {getBanner(theme)}
        </Box>
        <TabContext value={value}>
          <Paper square>
            <TabList
                centered
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary">
              <Tab label={t("page.submit.file")} value={"0"}/>
              <Tab label={t("page.submit.url")} value={"1"}/>
              <Tab label={t("page.submit.options")} value={"2"}/>
            </TabList>
          </Paper>
          <TabPanel value="0" className={classes.no_pad}>
            <Box marginTop="30px">
              <FileDropper/>
              <Box mt={"50px"} textAlign={"center"}>
                <Typography variant={"body2"}>{t("page.submit.terms1")}<i>{t("page.submit.file.button")}</i>{t("page.submit.terms2")}<Link style={{textDecoration: "none", color: theme.palette.primary.main}} to="/tos">{t("page.submit.terms3")}</Link>.</Typography>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value="1" className={classes.no_pad}>
            <Box display="flex" flexDirection="row" marginTop="30px">
              <TextField label={t("page.submit.url.input")} size={"small"} variant={"outlined"} style={{flexGrow: 1, marginRight: "1rem"}}/>
              <Button color={"primary"} variant={"contained"}>{t("page.submit.url.button")}</Button>
            </Box>
            <Box mt={"50px"} textAlign={"center"}>
            <Typography variant={"body2"}>{t("page.submit.terms1")}<i>{t("page.submit.url.button")}</i>{t("page.submit.terms2")}<Link style={{textDecoration: "none", color: theme.palette.primary.main}} to="/tos">{t("page.submit.terms3")}</Link>.</Typography>
            </Box>
          </TabPanel>
          <TabPanel value="2" className={classes.no_pad}>
            <Box marginTop="30px">
              <p>{t("page.submit.options.desc")}</p>
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </PageCenter>
  );
}

export default Submit;
