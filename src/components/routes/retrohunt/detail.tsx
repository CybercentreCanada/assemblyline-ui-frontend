import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { Grid, IconButton, Paper, Skeleton, Tab, Tabs, Tooltip, Typography, useTheme } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import {
  DEFAULT_RETROHUNT,
  Retrohunt,
  RetrohuntAdd,
  RetrohuntResults,
  RetrohuntView,
  RetrohuntYara
} from './components';

type ParamProps = {
  code: string;
};

type RetrohuntTab = 'details' | 'signature' | 'results';
type RetrohuntPageType = 'page' | 'drawer';
type RetrohuntPageState = 'loading' | 'forbidden' | 'view' | 'add';

type Props = {
  pageType?: RetrohuntPageType;
  retrohuntCode: string;
  close?: () => void;
};

function WrappedRetrohuntDetail({ retrohuntCode = null, close = () => null, pageType = 'drawer' }: Props) {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const location = useLocation();
  const { showErrorMessage } = useMySnackbar();

  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [code, setCode] = useState<string>(null);
  const [type, setType] = useState<RetrohuntPageState>('loading');
  const [tab, setTab] = useState<RetrohuntTab>('details');
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  useEffect(() => {
    if (retrohuntCode) setCode(retrohuntCode);
    else if (paramCode) setCode(paramCode);
    else setCode(null);
  }, [paramCode, retrohuntCode]);

  useEffect(() => {
    if (code && currentUser.roles.includes('retrohunt_view')) {
      apiCall({
        url: `/api/v4/retrohunt/${code}/`,
        onSuccess: api_data => {
          setRetrohunt({ ...api_data.api_response });
          setType('view');
        }
      });
    } else if (!code && currentUser.roles.includes('retrohunt_run')) {
      setRetrohunt({ ...DEFAULT_RETROHUNT });
      setType('add');
    } else {
      setType('forbidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrohuntCode, code]);

  const currentHash = useMemo(
    () => (location.hash && location.hash !== '' ? location.hash.substring(1) : null),
    [location.hash]
  );

  useEffect(() => {
    const tabOptions: RetrohuntTab[] = ['details', 'results', 'signature'];
    if (!tabOptions.includes(currentHash as RetrohuntTab)) return;
    setTab(currentHash as RetrohuntTab);
  }, [currentHash]);

  const onTabChange = useCallback(
    (value: RetrohuntTab) => {
      setTab(value);
      navigate(`${location.pathname}#${value}`, { replace: true });
    },
    [location.pathname, navigate]
  );

  const onViewDetailedPage = useCallback(() => {
    navigate(`/retrohunt/${code}#${tab}`);
  }, [code, navigate, tab]);

  const onCancelRetrohuntConfirmation = useCallback(() => {
    setConfirmationOpen(false);
  }, []);

  const onCreateRetrohunt = useCallback(() => {
    if (!currentUser.roles.includes('retrohunt_run')) return;

    apiCall({
      url: `/api/v4/retrohunt/`,
      method: 'POST',
      body: {
        classification: retrohunt.classification,
        description: retrohunt.description,
        archive_only: retrohunt.archive_only ? retrohunt.archive_only : false,
        yara_signature: retrohunt.yara_signature
      },
      onSuccess: api_data => {
        setRetrohunt({ ...api_data.api_response });
        setConfirmationOpen(false);
        setType('view');
        setCode((api_data.api_response as Retrohunt)?.code);
      },
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, retrohunt, showErrorMessage]);

  if (type === 'forbidden') return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={!code ? 2 : 4}>
        <ConfirmationDialog
          open={confirmationOpen}
          handleClose={event => setConfirmationOpen(false)}
          handleCancel={onCancelRetrohuntConfirmation}
          handleAccept={onCreateRetrohunt}
          title={t('validate.title')}
          cancelText={t('validate.cancelText')}
          acceptText={t('validate.acceptText')}
          text={t('validate.text')}
        />
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
                <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              )}
              {type === 'add' && (
                <Tooltip title={t('tooltip.add')}>
                  <IconButton
                    onClick={() => setConfirmationOpen(true)}
                    style={{
                      color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                    }}
                    size="large"
                  >
                    <AddCircleOutlineOutlinedIcon />
                  </IconButton>
                </Tooltip>
              )}
              {type === 'view' && pageType === 'drawer' && (
                <Tooltip title={t('tooltip.view')}>
                  <IconButton
                    onClick={() => onViewDetailedPage()}
                    style={{ color: theme.palette.action.active }}
                    size="large"
                  >
                    <ListAltOutlinedIcon />
                  </IconButton>
                </Tooltip>
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
              backgroundColor: pageType === 'drawer' ? theme.palette.background.default : theme.palette.background.paper
            }}
          >
            <Tabs
              value={tab}
              onChange={(event, value) => onTabChange(value)}
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
          container
          display={tab === 'details' ? 'flex' : 'none'}
          flex={1}
          height="100%"
          paddingTop={theme.spacing(4)}
          flexDirection="column"
        >
          {type === 'add' && <RetrohuntAdd retrohunt={retrohunt} setRetrohunt={setRetrohunt} />}
          {type === 'view' && <RetrohuntView retrohunt={retrohunt} />}
        </Grid>

        <Grid item display={tab === 'signature' ? 'flex' : 'none'} flex={1} height="100%" paddingTop={theme.spacing(2)}>
          <RetrohuntYara
            retrohunt={retrohunt}
            isReadyOnly={type === 'add' ? false : true}
            onYaraSignatureChange={ys => setRetrohunt(r => ({ ...r, yara_signature: ys }))}
          />
        </Grid>

        {type === 'view' && (
          <Grid item display={tab === 'results' ? 'flex' : 'none'} flex={1} height="100%" paddingTop={theme.spacing(2)}>
            <RetrohuntResults retrohunt={retrohunt} />
          </Grid>
        )}
      </PageFullSize>
    );
}

export const RetrohuntDetail = React.memo(WrappedRetrohuntDetail);

WrappedRetrohuntDetail.defaultProps = {
  pageType: 'page',
  retrohuntCode: null,
  close: null
} as Props;

export default WrappedRetrohuntDetail;