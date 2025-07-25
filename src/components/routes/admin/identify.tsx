import { loader } from '@monaco-editor/react';
import { Alert, Box, Grid, Paper, styled, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageFullSize from 'commons/components/pages/PageFullSize';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import useMyAPI from 'components/hooks/useMyAPI';
import type { CustomUser } from 'components/models/ui/user';
import LibMagic from 'components/routes/admin/identify/libmagic';
import Mimes from 'components/routes/admin/identify/mimes';
import Patterns from 'components/routes/admin/identify/patterns';
import Yara from 'components/routes/admin/identify/yara';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const TabContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(2)
}));

export default function AdminIdentify() {
  const { t, i18n } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { apiCall } = useMyAPI();

  const [value, setValue] = useState('magic');
  const [magicFile, setMagicFile] = useState(null);
  const [originalMagicFile, setOriginalMagicFile] = useState(null);
  const [yaraFile, setYaraFile] = useState(null);
  const [originalYaraFile, setOriginalYaraFile] = useState(null);
  const [mimesFile, setMimesFile] = useState(null);
  const [originalMimesFile, setOriginalMimesFile] = useState(null);
  const [patternsFile, setPatternsFile] = useState(null);
  const [originalPatternsFile, setOriginalPatternsFile] = useState(null);

  useEffectOnce(() => {
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const loadMagic = (defValue, autoOpen) => {
    apiCall({
      method: 'GET',
      url: `/api/v4/system/identify/magic/${defValue ? '?default' : ''}`,
      onSuccess: api_data => {
        setMagicFile(api_data.api_response);
        if (!defValue) setOriginalMagicFile(api_data.api_response);
        if (autoOpen && api_data.api_response !== originalMagicFile) autoOpen(true);
      }
    });
  };

  const loadYara = (defValue, autoOpen) => {
    apiCall({
      method: 'GET',
      url: `/api/v4/system/identify/yara/${defValue ? '?default' : ''}`,
      onSuccess: api_data => {
        setYaraFile(api_data.api_response);
        if (!defValue) setOriginalYaraFile(api_data.api_response);
        if (autoOpen && api_data.api_response !== originalYaraFile) autoOpen(true);
      }
    });
  };

  const loadMimes = (defValue, autoOpen) => {
    apiCall({
      method: 'GET',
      url: `/api/v4/system/identify/mimes/${defValue ? '?default' : ''}`,
      onSuccess: api_data => {
        setMimesFile(api_data.api_response);
        if (!defValue) setOriginalMimesFile(api_data.api_response);
        if (autoOpen && api_data.api_response !== originalMimesFile) autoOpen(true);
      }
    });
  };

  const loadPatterns = (defValue, autoOpen) => {
    apiCall({
      method: 'GET',
      url: `/api/v4/system/identify/patterns/${defValue ? '?default' : ''}`,
      onSuccess: api_data => {
        setPatternsFile(api_data.api_response);
        if (!defValue) setOriginalPatternsFile(api_data.api_response);
        if (autoOpen && api_data.api_response !== originalPatternsFile) autoOpen(true);
      }
    });
  };

  return currentUser.is_admin ? (
    <PageFullSize margin={4}>
      <RouterPrompt
        when={
          magicFile !== originalMagicFile ||
          mimesFile !== originalMimesFile ||
          patternsFile !== originalPatternsFile ||
          yaraFile !== originalYaraFile
        }
      />
      <div style={{ marginBottom: theme.spacing(2), textAlign: 'left' }}>
        <Grid container alignItems="center" spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Alert severity="warning">{t('warning')}</Alert>
            </Box>
          </Grid>
        </Grid>
      </div>
      <div
        style={{
          marginTop: theme.spacing(1),
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Paper square>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('magic')} value="magic" />
            <Tab label={t('mimes')} value="mimes" />
            <Tab label={t('patterns')} value="patterns" />
            <Tab label={t('yara')} value="yara" />
          </Tabs>
        </Paper>
        {value === 'magic' && (
          <TabContent>
            <LibMagic
              reload={loadMagic}
              magicFile={magicFile}
              originalMagicFile={originalMagicFile}
              setMagicFile={setMagicFile}
            />
          </TabContent>
        )}
        {value === 'mimes' && (
          <TabContent>
            <Mimes
              reload={loadMimes}
              mimesFile={mimesFile}
              originalMimesFile={originalMimesFile}
              setMimesFile={setMimesFile}
            />
          </TabContent>
        )}
        {value === 'patterns' && (
          <TabContent>
            <Patterns
              reload={loadPatterns}
              patternsFile={patternsFile}
              originalPatternsFile={originalPatternsFile}
              setPatternsFile={setPatternsFile}
            />
          </TabContent>
        )}
        {value === 'yara' && (
          <TabContent>
            <Yara reload={loadYara} yaraFile={yaraFile} originalYaraFile={originalYaraFile} setYaraFile={setYaraFile} />
          </TabContent>
        )}
      </div>
    </PageFullSize>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}
