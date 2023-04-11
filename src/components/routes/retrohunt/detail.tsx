import { Button, CircularProgress, Grid, Paper, Skeleton, TextField, Typography, useTheme } from '@mui/material';
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
import JSONEditor from 'components/visual/Editor/JSONEditor';
import { YaraEditor } from 'components/visual/Editor/YaraEditor';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';

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

  const DEFAULT_RETROHUNT = useMemo<Retrohunt>(
    () => ({
      code: null,
      creator: null,
      tags: {},
      description: '',
      created: '2020-01-01T00:00:00.000000Z',
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

  if (type === 'error') return <NotFoundPage />;
  else if (type === 'forbidden') return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={pageType === 'page' ? 4 : 2}>
        <RouterPrompt when={modified} />
        <ConfirmationDialog
          open={confirmationOpen}
          handleClose={_event => setConfirmationOpen(false)}
          handleCancel={onCancelRetrohuntConfirmation}
          handleAccept={onCreateRetrohunt}
          title={t('validate.title')}
          cancelText={t('validate.cancelText')}
          acceptText={t('validate.acceptText')}
          text={t('validate.text')}
        />

        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={2}>
          {c12nDef.enforce && (
            <Grid item paddingBottom={theme.spacing(2)}>
              <Classification
                format="long"
                type={type === 'add' ? 'picker' : 'pill'}
                c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
                setClassification={(c12n: string) => onRetrohuntChange({ classification: c12n })}
                disabled={!currentUser.roles.includes('retrohunt_run')}
              />
            </Grid>
          )}

          <Grid item>
            <Grid container flexDirection="row">
              <Grid item flexGrow={1}>
                {type === 'loading' && (
                  <Typography variant="h4" children={<Skeleton height="2.5rem" width="30rem" />} />
                )}
                {type === 'loading' && (
                  <Typography variant="caption" children={<Skeleton height="2.5rem" width="20rem" />} />
                )}
                {type === 'add' && <Typography variant="h4" children={t('header.add')} />}
                {type === 'view' && <Typography variant="h4" children={t('header.view')} />}
                {type === 'view' && <Typography variant="caption" children={retrohunt.code} />}
              </Grid>

              <Grid item>
                <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
                  {type === 'loading' && (
                    <Skeleton
                      variant="circular"
                      height="2.5rem"
                      width="2.5rem"
                      style={{ margin: theme.spacing(0.5) }}
                    />
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
          </Grid>

          {type === 'loading' && <Grid item children={<Skeleton height="2.5rem" />} />}
          {type === 'view' && 'creator' in retrohunt && 'created' in retrohunt && (
            <Grid item textAlign="center">
              <Typography variant="subtitle2" color="textSecondary">
                {`${t('created_by')} ${retrohunt.creator} `}
                <Moment fromNow locale={i18n.language}>
                  {retrohunt.created}
                </Moment>
              </Typography>
            </Grid>
          )}

          {type === 'view' && retrohunt && 'tags' in retrohunt && (
            <Grid item>
              <Typography variant="subtitle2">{t('details.tags')}</Typography>
              <Paper
                component="pre"
                variant="outlined"
                style={{
                  margin: 0,
                  padding: theme.spacing(0.75, 1),
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {Object.keys(retrohunt.tags).length > 0 ? Object.keys(retrohunt.tags).join(', ') : t('details.none')}
              </Paper>
            </Grid>
          )}

          <Grid item>
            <Typography variant="subtitle2">{t('details.description')}</Typography>
            {type === 'loading' || !retrohunt || !('description' in retrohunt) ? (
              <Skeleton style={{ height: '8rem', transform: 'none', marginTop: theme.spacing(1) }} />
            ) : (
              <>
                {type === 'add' && (
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
                )}
                {type === 'view' && (
                  <Paper
                    component="pre"
                    variant="outlined"
                    children={retrohunt.description}
                    style={{
                      margin: 0,
                      padding: theme.spacing(0.75, 1),
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  />
                )}
              </>
            )}
          </Grid>

          {type === 'add' && retrohunt && 'archive_only' in retrohunt && (
            <Grid item>
              <Typography variant="subtitle2">{t('details.search')}</Typography>
              <RadioGroup
                row
                value={retrohunt.archive_only ? 'archive_only' : 'all'}
                onChange={(_, value) => onRetrohuntChange({ archive_only: value === 'archive_only' })}
              >
                <FormControlLabel value="all" control={<Radio />} label={t('details.all')} />
                <FormControlLabel value="archive_only" control={<Radio />} label={t('details.archive_only')} />
              </RadioGroup>
            </Grid>
          )}

          {type === 'view' && retrohunt && (
            <Grid item flex={1}>
              <Grid container flexDirection="column" height="100%" minHeight="500px">
                <Typography variant="subtitle2" children={t('details.results')} />
                <JSONEditor data={JSON.stringify(retrohunt ? retrohunt : {})} isEditable={false} beautify={true} />
              </Grid>
            </Grid>
          )}

          <Grid item flex={1}>
            <Grid container flexDirection="column" height="100%" minHeight="500px">
              <Typography variant="subtitle2" children={t('details.yara_signature')} />
              {type === 'loading' || !retrohunt || !('yara_signature' in retrohunt) ? (
                <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
              ) : (
                <YaraEditor
                  data={retrohunt.yara_signature}
                  isEditable={type === 'add' ? true : false}
                  onDataChange={data => setRetrohunt(r => ({ ...r, yara_signature: data }))}
                />
              )}
            </Grid>
          </Grid>
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
