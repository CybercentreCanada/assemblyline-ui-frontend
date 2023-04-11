import { Button, CircularProgress, Divider, Grid, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { YaraEditor } from 'components/visual/Editor/YaraEditor';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { RetrohuntResults } from './components';

export type Retrohunt = {
  code: any;
  creator: any;
  tags: any;
  description: any;
  created: any;
  classification: any;
  yara_signature: any;
  raw_query: any;
  total_indices: any;
  pending_indices: any;
  pending_candidates: any;
  errors: any;
  hits: any;
  finished: any;
  truncated: any;
  archive_only?: boolean;
};

type ParamProps = {
  code: string;
};

type RetrohuntPageType = 'drawer' | 'page';

type RetrohuntPageState = 'loading' | 'view' | 'add' | 'error' | 'forbidden';

type ItemProps = {
  children?: React.ReactNode;
  text?: string;
  isLoading?: boolean;
  title?: string;
};

type Props = {
  pageType?: RetrohuntPageType;
  retrohuntCode: string;
  close?: () => void;
};

function WrappedRetrohuntDetail({ retrohuntCode = null, pageType = 'page', close = () => null }: Props) {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const { c12nDef } = useALContext();
  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [code, setCode] = useState<string>(paramCode || retrohuntCode);
  const [type, setType] = useState<RetrohuntPageState>('loading');
  const [modified, setModified] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const [isMDUp, setIsMDUp] = useState<boolean>(false);

  const DEFAULT_RETROHUNT = useMemo<Retrohunt>(
    () => ({
      code: null,
      creator: null,
      tags: {},
      description: '',
      created: '',
      classification: c12nDef.UNRESTRICTED,
      yara_signature: '',
      raw_query: null,
      total_indices: 0,
      pending_indices: 0,
      pending_candidates: 0,
      errors: [],
      hits: [],
      finished: false,
      truncated: false,
      archive_only: false
    }),
    [c12nDef.UNRESTRICTED]
  );

  useEffect(() => {
    retrohuntCode ? setCode(retrohuntCode) : paramCode ? setCode(paramCode) : setCode(null);
  }, [paramCode, retrohuntCode]);

  useEffect(() => {
    function handleResize(data) {
      if (!pageRef || !pageRef.current) return;
      startTransition(() => {
        const { width } = pageRef.current.getBoundingClientRect();
        setIsMDUp(width > theme.breakpoints.values.md);
      });
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [theme.breakpoints.values]);

  useEffect(() => {
    if (code === 'new' && currentUser.roles.includes('retrohunt_run')) {
      setRetrohunt({ ...DEFAULT_RETROHUNT });
      setType('add');
    } else if (code && currentUser.roles.includes('retrohunt_view')) {
      apiCall({
        url: `/api/v4/retrohunt/${code}/`,
        onSuccess: api_data => {
          setRetrohunt({ ...api_data.api_response });
          setType('view');
        },
        onFailure: () => {
          setType('error');
        }
      });
    } else {
      setType('forbidden');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEFAULT_RETROHUNT, code, currentUser.roles]);

  const onRetrohuntChange = useCallback((newRetrohunt: Partial<Retrohunt>) => {
    setRetrohunt(rh => ({ ...rh, ...newRetrohunt }));
    setModified(true);
  }, []);

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
        const newCode: string = api_data.api_response?.code ? api_data.api_response?.code : 'new';
        setRetrohunt({ ...api_data.api_response });
        setConfirmationOpen(false);
        setType('view');
        setModified(false);
        setCode(newCode);
        setTimeout(() => {
          navigate(`${location.pathname}${location.search ? location.search : ''}#${newCode}`);
          window.dispatchEvent(new CustomEvent('reloadRetrohunts'));
        }, 1000);
      },
      onFailure: api_data => {
        showErrorMessage(api_data.api_error_message);
        setConfirmationOpen(false);
      },
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.roles, location, navigate, retrohunt, showErrorMessage]);

  const Item = useCallback(
    ({ children = null, title = '', isLoading = true }: ItemProps) => (
      <>
        <Grid item xs={12} sm={3} md={3} children={<span style={{ fontWeight: 500 }}>{t(`${title}`)}</span>} />
        <Grid item xs={12} sm={9} md={9} children={isLoading ? <Skeleton /> : children} />
      </>
    ),
    [t]
  );

  if (type === 'error') return <NotFoundPage />;
  else if (type === 'forbidden') return <ForbiddenPage />;
  else
    return (
      <PageFullSize innerRef={pageRef} margin={pageType === 'page' ? 4 : 2}>
        <RouterPrompt when={modified} />
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

        {c12nDef.enforce && ['loading', 'add', 'view'].includes(type) && (
          <Grid container flexDirection="column" paddingBottom={theme.spacing(4)}>
            <Classification
              format="long"
              type={type === 'add' ? 'picker' : 'pill'}
              c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
              setClassification={(c12n: string) => onRetrohuntChange({ classification: c12n })}
              disabled={!currentUser.roles.includes('retrohunt_run')}
            />
          </Grid>
        )}

        <Grid container flexDirection="row" spacing={0} paddingBottom={theme.spacing(0)}>
          <Grid item flexGrow={1}>
            {type === 'loading' && <Typography variant="h4" children={<Skeleton width="30rem" />} />}
            {type === 'loading' && <Typography variant="caption" children={<Skeleton width="20rem" />} />}
            {type === 'add' && <Typography variant="h4" children={t('header.add')} />}
            {type === 'view' && <Typography variant="h4" children={t('header.view')} />}
            {type === 'view' && <Typography variant="caption" children={retrohunt.code} />}
          </Grid>

          <Grid item>
            <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
              {type === 'loading' && (
                <Skeleton variant="circular" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              )}
              {type === 'add' && (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={buttonLoading || !retrohunt?.description || !retrohunt?.yara_signature}
                  onClick={() => setConfirmationOpen(true)}
                >
                  {t('add.button')}
                  {buttonLoading && (
                    <CircularProgress
                      size={24}
                      style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
                    />
                  )}
                </Button>
              )}
            </div>
          </Grid>
        </Grid>

        {['loading', 'add'].includes(type) && (
          <Grid container paddingTop={theme.spacing(2)} spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('details.description')}</Typography>
              {retrohunt && 'description' in retrohunt ? (
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  margin="dense"
                  variant="outlined"
                  value={retrohunt.description}
                  onChange={event => onRetrohuntChange({ description: event.target.value })}
                />
              ) : (
                <Skeleton style={{ height: '8rem', transform: 'none', marginTop: theme.spacing(1) }} />
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('details.search')}</Typography>
              {retrohunt && 'archive_only' in retrohunt ? (
                <RadioGroup
                  row
                  value={retrohunt.archive_only ? 'archive_only' : 'all'}
                  onChange={(event, value) => onRetrohuntChange({ archive_only: value === 'archive_only' })}
                >
                  <FormControlLabel value="all" control={<Radio />} label={t('details.all')} />
                  <FormControlLabel value="archive_only" control={<Radio />} label={t('details.archive_only')} />
                </RadioGroup>
              ) : (
                <Skeleton style={{ height: '2rem', transform: 'none', marginTop: theme.spacing(1) }} />
              )}
            </Grid>
          </Grid>
        )}

        {true && retrohunt && (
          <>
            <Grid item xs={12} paddingTop={theme.spacing(2)} paddingBottom={theme.spacing(2)}>
              <Typography variant="h6">{t('details.general')}</Typography>
              <Divider sx={{ '@media print': { backgroundColor: '#0000001f !important' } }} />
            </Grid>
            <Grid container>
              <Grid item xs={isMDUp ? 4 : 12}>
                <Grid container spacing={2}>
                  <Item
                    title="details.created"
                    isLoading={!('created' in retrohunt)}
                    children={<Moment fromNow locale={i18n.language} children={retrohunt.created} />}
                  />
                  <Item title="details.creator" isLoading={!('creator' in retrohunt)} children={retrohunt.creator} />
                </Grid>
              </Grid>
              <Grid item xs={isMDUp ? 8 : 12}>
                <Grid container spacing={2}>
                  <Item
                    title="details.tags"
                    isLoading={!('tags' in retrohunt)}
                    children={
                      Object.keys(retrohunt.tags).length > 0
                        ? Object.keys(retrohunt.tags).join(', ')
                        : t('details.none')
                    }
                  />
                  <Item
                    title="details.description"
                    isLoading={!('description' in retrohunt)}
                    children={retrohunt.description}
                  />
                </Grid>
              </Grid>
            </Grid>
          </>
        )}

        {type === 'view' && (
          <Grid container flex={1} paddingTop={theme.spacing(2)} flexDirection="column" minHeight="500px">
            <Typography variant="subtitle2" children={t('details.results')} />
            <RetrohuntResults data={JSON.stringify(retrohunt ? retrohunt : {})} isEditable={false} beautify={true} />
          </Grid>
        )}

        <Grid
          container
          flex={1}
          paddingTop={theme.spacing(2)}
          paddingBottom={theme.spacing(2)}
          flexDirection="column"
          minHeight="500px"
        >
          <Typography variant="subtitle2" children={t('details.yara_signature')} />
          {type !== 'loading' && retrohunt && 'yara_signature' in retrohunt ? (
            <YaraEditor
              data={retrohunt.yara_signature}
              isEditable={type === 'add' ? true : false}
              onDataChange={data => setRetrohunt(r => ({ ...r, yara_signature: data }))}
            />
          ) : (
            <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
          )}
        </Grid>
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
