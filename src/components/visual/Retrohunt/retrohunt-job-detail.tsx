import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { Grid, IconButton, Paper, Skeleton, Tab, Tabs, Tooltip, Typography, useTheme } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import 'moment/locale/fr';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import { DEFAULT_RETROHUNT, Retrohunt, RetrohuntJobAddDetails, RetrohuntYara } from '.';

export type ParamProps = {
  code: string;
};

export type Props = {
  retrohuntCode: string;
  close?: () => void;
};

export const WrappedRetrohuntJobDetail = (props: Props) => {
  const { retrohuntCode = null, close = () => null } = props;

  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();

  const { code } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [type, setType] = useState<'loading' | 'forbidden' | 'view' | 'add'>('loading');
  const [tab, setTab] = useState<'details' | 'signature' | 'results'>('details');

  useEffect(() => {
    if ((retrohuntCode || code) && currentUser.roles.includes('retrohunt_view')) {
      apiCall({
        url: `/api/v4/retrohunt/${retrohuntCode || code}/`,
        onSuccess: api_data => {
          setRetrohunt({ ...api_data.api_response });
          setType('view');
        }
      });
    } else if (!(retrohuntCode || code) && currentUser.roles.includes('retrohunt_run')) {
      setRetrohunt({ ...DEFAULT_RETROHUNT });
      setType('add');
    } else {
      setType('forbidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrohuntCode, code]);

  if (type === 'forbidden') return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={!code ? 2 : 4}>
        <Grid container flexDirection="row" spacing={3} paddingBottom={theme.spacing(2)}>
          <Grid item flexGrow={1}>
            {type === 'loading' && (
              <>
                <Typography variant="h4">
                  <Skeleton style={{ width: '20rem' }} />
                </Typography>
                <Typography variant="caption">
                  <Skeleton style={{ width: '20rem' }} />
                </Typography>
              </>
            )}
            {type === 'add' && (
              <>
                <Typography variant="h4">{t('header.add')}</Typography>
              </>
            )}
            {type === 'view' && (
              <>
                <Typography variant="h4">{t('header.view')}</Typography>
                <Typography variant="caption">{retrohunt.code}</Typography>
              </>
            )}
          </Grid>

          <Grid item>
            <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
              {type === 'loading' && (
                <>
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                  <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
                </>
              )}
              {type === 'add' && (
                <>
                  <Tooltip title={t('tooltip.add')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                      }}
                      size="large"
                    >
                      <AddCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {type === 'view' && (
                <>
                  <Tooltip title={t('errors')}>
                    <IconButton style={{ color: theme.palette.action.active }} size="large">
                      <ErrorOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('compare')}>
                    <IconButton style={{ color: theme.palette.action.active }} size="large">
                      <CompareArrowsOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('remove')}>
                    <IconButton
                      style={{
                        color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                      size="large"
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
          </Grid>
        </Grid>

        {type === 'loading' ? (
          <Skeleton variant="rectangular" height="10rem" />
        ) : (
          <Paper
            square
            style={{
              backgroundColor: retrohunt ? theme.palette.background.default : theme.palette.background.paper
            }}
          >
            <Tabs
              value={tab}
              onChange={(event, value) => setTab(value)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('tab.details')} value="details" />
              <Tab label={t('tab.signature')} value="signature" />
              {type === 'view' && <Tab label={t('tab.results')} value="results" />}
            </Tabs>
          </Paper>
        )}

        <Grid
          item
          display={tab === 'details' ? 'flex' : 'none'}
          flex={1}
          height="100%"
          paddingTop={theme.spacing(4)}
          flexDirection="column"
          spacing={15}
        >
          {type === 'add' && <RetrohuntJobAddDetails retrohunt={retrohunt} setRetrohunt={setRetrohunt} />}
          {type === 'view' && <>view</>}
        </Grid>

        <Grid item display={tab === 'signature' ? 'flex' : 'none'} flex={1} height="100%" paddingTop={theme.spacing(2)}>
          <RetrohuntYara
            retrohunt={retrohunt}
            isReadyOnly={type === 'add' ? true : false}
            onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
          />
        </Grid>

        {/* {type === 'loading' ? (
          <Skeleton variant="rectangular" height="10rem" />
        ) : (
          <TabContext value={tab}>
            <Paper
              square
              style={{
                backgroundColor: retrohunt ? theme.palette.background.default : theme.palette.background.paper
              }}
            >
              <TabList onChange={(event, value) => setTab(value)} indicatorColor="primary" textColor="primary">
                <Tab label={t('tab.details')} value="details" />
                <Tab label={t('tab.signature')} value="signature" />
                {type === 'view' && <Tab label={t('tab.results')} value="results" />}
              </TabList>
            </Paper>
            <TabPanel value="details" style={{ paddingLeft: 0, paddingRight: 0 }}></TabPanel>
            <TabPanel value="signature" style={{ paddingLeft: 0, paddingRight: 0, flex: 1 }}>
              <RetrohuntYara retrohunt={retrohunt} />
            </TabPanel>
            {type === 'view' && (
              <TabPanel value="results" style={{ paddingLeft: 0, paddingRight: 0 }}>
                3
              </TabPanel>
            )}
          </TabContext>
        )} */}
      </PageFullSize>
    );
};

export const RetrohuntJobDetail = React.memo(WrappedRetrohuntJobDetail);

export type RetrohuntProps = {
  retrohunt: Retrohunt;
};

export const WrappedAddRetrohuntDetails = (props: RetrohuntProps) => {
  const { retrohunt = { ...DEFAULT_RETROHUNT } } = props;

  return <></>;
};

export const AddRetrohuntDetails = React.memo(WrappedAddRetrohuntDetails);
