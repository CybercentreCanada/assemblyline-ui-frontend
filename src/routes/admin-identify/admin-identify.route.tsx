import { loader } from '@monaco-editor/react';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import { Alert, Box, Grid, Paper, styled, Tab, Tabs, Typography, useTheme } from '@mui/material';
import { useAppBlocker } from 'core/router';
import { createAppRoute } from 'core/routes';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibMagic } from 'routes/admin-identify/components/libmagic';
import { Mimes } from 'routes/admin-identify/components/mimes';
import { Patterns } from 'routes/admin-identify/components/patterns';
import { Yara } from 'routes/admin-identify/components/yara';
import { PageFullSizeLayout } from 'ui/pages/PageFullSize';

loader.config({
  paths: { vs: '/cdn/monaco_0.35.0/vs' }
});

const TabContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(2)
}));

export const AdminIdentifyPage = memo(() => {
  const { t, i18n } = useTranslation(['adminIdentify']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();

  const [value, setValue] = useState('magic');
  const [magicFile, setMagicFile] = useState<string | null>(null);
  const [originalMagicFile, setOriginalMagicFile] = useState<string | null>(null);
  const [yaraFile, setYaraFile] = useState<string | null>(null);
  const [originalYaraFile, setOriginalYaraFile] = useState<string | null>(null);
  const [mimesFile, setMimesFile] = useState<string | null>(null);
  const [originalMimesFile, setOriginalMimesFile] = useState<string | null>(null);
  const [patternsFile, setPatternsFile] = useState<string | null>(null);
  const [originalPatternsFile, setOriginalPatternsFile] = useState<string | null>(null);

  useAppBlocker(() =>
    magicFile !== originalMagicFile ||
    mimesFile !== originalMimesFile ||
    patternsFile !== originalPatternsFile ||
    yaraFile !== originalYaraFile
      ? 'unsaved_changes'
      : null
  );

  useEffect(() => {
    // I cannot find a way to hot switch monaco editor's locale but at least I can load
    // the right language on first load...
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const loadMagic = (defValue?: boolean, autoOpen?: (open: boolean) => void) => {
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

  const loadYara = (defValue?: boolean, autoOpen?: (open: boolean) => void) => {
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

  const loadMimes = (defValue?: boolean, autoOpen?: (open: boolean) => void) => {
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

  const loadPatterns = (defValue?: boolean, autoOpen?: (open: boolean) => void) => {
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

  return (
    <PageFullSizeLayout margin={4}>
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
            allowScrollButtonsMobile
            indicatorColor="primary"
            scrollButtons="auto"
            textColor="primary"
            variant="scrollable"
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
    </PageFullSizeLayout>
  );
});

export const AdminIdentifyRoute = createAppRoute({
  component: AdminIdentifyPage,

  path: '/admin/identify',

  ancestor: '/admin',
  shortname: () => ({ i18nKey: 'adminmenu.identify', ns: 'app' }),
  fullname: () => ({ i18nKey: 'adminmenu.identify', ns: 'app' }),
  shorticon: () => <FindInPageOutlinedIcon />,
  fullicon: () => <FindInPageOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
