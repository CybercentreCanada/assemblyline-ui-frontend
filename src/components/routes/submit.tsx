import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { AiOutlineSecurityScan } from 'react-icons/ai';
import { Link } from 'react-router-dom';

function FileDropper(props) {
  const { t } = useTranslation(['submit']);
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone();
  const useStyles = makeStyles(theme => ({
    drop_zone: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(3),
      backgroundColor: theme.palette.action.hover,
      outline: 'none',
      border: `2px ${theme.palette.action.disabled} dashed`,
      borderRadius: '6px',
      color: theme.palette.action.disabled,
      '&:hover': {
        border: `2px ${theme.palette.text.disabled} dashed`,
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.disabled,
        cursor: 'pointer'
      }
    },
    drag_enter: {
      border: `2px ${theme.palette.text.disabled} dashed`,
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.text.disabled
    }
  }));
  const classes = useStyles();

  let dropperText;
  if (acceptedFiles.length > 0) {
    dropperText = (
      <Box textAlign="center">
        <Typography variant="body1">
          <b>{acceptedFiles[0].name}</b>
        </Typography>
        <Typography variant="body2" align="center">
          {acceptedFiles[0].size} {t('file.dragzon.byte')}
        </Typography>
      </Box>
    );
  } else {
    dropperText = (
      <Typography variant="body1">
        <b>{t('file.dragzone')}</b>
      </Typography>
    );
  }

  return (
    <Box>
      <div
        {...getRootProps()}
        className={
          acceptedFiles.length > 0 || isDragActive ? `${classes.drop_zone} ${classes.drag_enter}` : classes.drop_zone
        }
      >
        <input {...getInputProps()} />
        <AiOutlineSecurityScan style={{ fontSize: '140px' }} />
        {dropperText}
      </div>
      <Box marginTop="2rem">
        {acceptedFiles.length === 0 ? (
          ''
        ) : (
          <Button color="primary" variant="contained">
            {t('file.button')}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function Submit() {
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { getBanner } = useAppLayout();
  const [value, setValue] = React.useState('0');
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const useStyles = makeStyles(curTheme => ({
    no_pad: {
      padding: 0
    }
  }));
  const classes = useStyles();
  return (
    <PageCenter maxWidth={md ? '630px' : downSM ? '100%' : '960px'}>
      <Box display="inline-block" textAlign="center" width="100%">
        <Box display="inline-block" marginBottom="2rem">
          {getBanner(theme)}
        </Box>
        <TabContext value={value}>
          <Paper square>
            <TabList centered onChange={handleChange} indicatorColor="primary" textColor="primary">
              <Tab label={t('file')} value="0" />
              <Tab label={t('url')} value="1" />
              <Tab label={t('options')} value="2" />
            </TabList>
          </Paper>
          <TabPanel value="0" className={classes.no_pad}>
            <Box marginTop="30px">
              <FileDropper />
              <Box mt="50px" textAlign="center">
                <Typography variant="body2">
                  {t('terms1')}
                  <i>{t('file.button')}</i>
                  {t('terms2')}
                  <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                    {t('terms3')}
                  </Link>
                  .
                </Typography>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value="1" className={classes.no_pad}>
            <Box display="flex" flexDirection="row" marginTop="30px">
              <TextField
                label={t('url.input')}
                size="small"
                variant="outlined"
                style={{ flexGrow: 1, marginRight: '1rem' }}
              />
              <Button color="primary" variant="contained">
                {t('url.button')}
              </Button>
            </Box>
            <Box mt="50px" textAlign="center">
              <Typography variant="body2">
                {t('terms1')}
                <i>{t('url.button')}</i>
                {t('terms2')}
                <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
                  {t('terms3')}
                </Link>
                .
              </Typography>
            </Box>
          </TabPanel>
          <TabPanel value="2" className={classes.no_pad}>
            <Box marginTop="30px">
              <p>{t('options.desc')}</p>
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </PageCenter>
  );
}

export default Submit;
