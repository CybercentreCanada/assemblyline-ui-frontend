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
import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import FileDropper from 'components/visual/FileDropper';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Submit() {
  const { getBanner } = useAppLayout();
  const apiCall = useMyAPI();
  const { t } = useTranslation(['submit']);
  const theme = useTheme();
  const { user: currentUser } = useUser<CustomUser>();
  const [settings, setSettings] = useState(null);
  const [value, setValue] = useState('0');
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

  function setClassification(c12n) {
    if (settings) {
      setSettings({ ...settings, classification: c12n });
    }
  }

  useEffect(() => {
    // Load user on start
    apiCall({
      url: `/api/v4/user/settings/${currentUser.username}/`,
      onSuccess: api_data => {
        setSettings(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter maxWidth={md ? '630px' : downSM ? '100%' : '960px'}>
      <Box display="inline-block" textAlign="center" width="100%">
        <Box display="inline-block" marginBottom="2rem">
          {getBanner(theme)}
        </Box>
        {currentUser.c12n_enforcing ? (
          <Box pb={8}>
            <Box p={1} fontSize={16}>
              {t('classification')}
            </Box>
            <Classification
              format="long"
              type="picker"
              c12n={settings ? settings.classification : null}
              setClassification={setClassification}
            />
          </Box>
        ) : null}
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
              {currentUser.has_tos ? (
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
              ) : null}
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
            {currentUser.has_tos ? (
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
            ) : null}
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
