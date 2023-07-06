import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { AlertTitle, Collapse, Divider, Grid, Paper, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'components/visual/DivTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import MonacoEditor from 'components/visual/MonacoEditor';
import { FileResult } from 'components/visual/SearchResult/files';
import 'moment/locale/fr';
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { Link, useLocation, useParams } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  title: {
    fontWeight: 500,
    marginRight: theme.spacing(0.5),
    display: 'flex'
  },
  value: {
    fontFamily: 'monospace',
    wordBreak: 'break-word'
  },
  collapse: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  circularProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    // maxHeight: `calc(${10} * 32.34px)`
    maxHeight: `50vh`
  },
  tableCell: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

type Phase = null | 'submitted' | 'error' | 'yara' | 'finished';

export type Retrohunt = {
  archive_only?: boolean;
  classification?: string;
  code?: string;
  created?: string;
  creator?: string;
  description?: any;
  errors?: any;
  finished?: any;
  hits?: any;
  id?: string;
  pending_candidates?: any;
  pending_indices?: any;
  phase?: Phase;
  progress?: [number, number];
  raw_query?: any;
  tags?: any;
  total_hits?: number;
  total_indices?: any;
  truncated?: boolean;
  yara_signature?: any;
};

type ParamProps = {
  code: string;
};

type Props = {
  code?: string;
  isDrawer?: boolean;
  retrohuntRef?: MutableRefObject<Retrohunt>;
  onClose?: () => void;
};

type Open = { [K in 'information' | 'signature' | 'results' | 'errors']: boolean };

const PAGE_SIZE = 10;

// const PHASE_MAP: { [K in Phase]: { color: PossibleColors; label: string; icon: React.ReactNode } } = {
//   submitted: { color: 'default', label: 'submitted', icon: <UpdateIcon color="action" /> },
//   error: { color: 'error', label: 'error', icon: <ClearIcon color="error" /> },
//   finished: { color: 'primary', label: 'completed', icon: <DoneIcon color="primary" /> }
// };

function WrappedRetrohuntDetail({
  code: propCode = null,
  isDrawer = false,
  retrohuntRef = null,
  onClose = () => null
}: Props) {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const { c12nDef } = useALContext();
  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);

  const [hits, setHits] = useState<FileResult[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<Open>({
    information: true,
    signature: false,
    results: true,
    errors: false
  });

  const offsetRef = useRef<number>(0);

  // const nbOfPages = useMemo(
  //   () => Math.ceil(Math.min(retrohunt?.total_hits, MAX_TRACKED_RECORDS) / PAGE_SIZE),
  //   [retrohunt?.total_hits]
  // );

  const DEFAULT_RETROHUNT = useMemo<Retrohunt>(
    () => ({
      archive_only: false,
      classification: c12nDef.UNRESTRICTED,
      code: null,
      created: '2020-01-01T00:00:00.000000Z',
      creator: null,
      description: '',
      errors: [],
      finished: false,
      hits: [],
      pending_candidates: 0,
      pending_indices: 0,
      phase: 'finished',
      progress: [1, 1],
      raw_query: null,
      tags: {},
      total_indices: 0,
      truncated: false,
      yara_signature: ''
    }),
    [c12nDef.UNRESTRICTED]
  );

  const phase = useMemo<Phase>(
    () => (retrohunt && 'phase' in retrohunt ? (retrohunt.phase as Phase) : null),
    [retrohunt]
  );

  const progress = useMemo<[number, number]>(
    () =>
      retrohunt && 'progress' in retrohunt && Array.isArray(retrohunt.progress) && retrohunt.progress.length === 2
        ? retrohunt.progress
        : [0, 0],
    [retrohunt]
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setOffset((value - 1) * PAGE_SIZE);
  };

  const handleIsOpenChange = useCallback(
    (openKey: keyof Open) => () => setIsOpen(o => ({ ...o, [openKey]: !o[openKey] })),
    []
  );

  const handleReload = useCallback(
    (code: string) => {
      apiCall({
        url: `/api/v4/retrohunt/${code}/?offset=${offset}&rows=${PAGE_SIZE}`,
        onSuccess: api_data => {
          const job: Retrohunt = api_data.api_response;
          setRetrohunt({ ...DEFAULT_RETROHUNT, ...job });
          setHits(job?.hits);
          setIsLoading(false);
        },
        onEnter: () => {
          setIsLoading(true);
          setIsError(false);
          setIsForbidden(false);
        },
        onExit: () => {
          setIsLoading(false);
        },
        onFailure: api_data => {
          showErrorMessage(api_data.api_error_message);
          setIsError(true);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, showErrorMessage]
  );

  useEffect(() => {
    if (!currentUser.roles.includes('retrohunt_view')) {
      setIsForbidden(true);
    } else if (!propCode && !paramCode) {
      showErrorMessage(t('error.no-code'));
      setIsError(true);
    } else if (isLoading) {
      apiCall({
        url: `/api/v4/retrohunt/${propCode || paramCode}/?offset=0&rows=${PAGE_SIZE}`,
        onSuccess: api_data => {
          setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response });
          setIsLoading(false);
          offsetRef.current = PAGE_SIZE;
        },
        onEnter: () => {
          setIsLoading(true);
          setIsError(false);
          setIsForbidden(false);
        },
        onExit: () => {
          setIsLoading(false);
        },
        onFailure: api_data => {
          showErrorMessage(api_data.api_error_message);
          setIsError(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DEFAULT_RETROHUNT, currentUser.roles, isLoading, paramCode, propCode, showErrorMessage, t]);

  useEffect(
    () => {
      if (!isLoading && retrohunt && 'code' in retrohunt && 'phase' in retrohunt && retrohunt.phase !== 'finished') {
        setTimeout(() => {
          apiCall({
            url: `/api/v4/retrohunt/${retrohunt.code}/?offset=0&rows=${PAGE_SIZE}`,
            onSuccess: api_data => {
              setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response });
              offsetRef.current = PAGE_SIZE;
            },
            onFailure: api_data => {
              showErrorMessage(api_data.api_error_message);
              setIsError(true);
            }
          });
        }, 5000);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, isLoading, retrohunt, showErrorMessage]
  );

  useEffect(() => {
    if (isLoading || !retrohunt) return;

    const tableEl = document.getElementById('hits-table');

    function handleFetchMoreHits() {
      apiCall({
        url: `/api/v4/retrohunt/${retrohunt.code}/?offset=${offsetRef.current}&rows=${PAGE_SIZE}`,
        onSuccess: api_data => {
          setHits(h => [...h, (api_data.api_response as Retrohunt).hits]);
          offsetRef.current = offsetRef.current + PAGE_SIZE;
        }
      });
    }

    function handleScrollEnd() {
      if (offset + PAGE_SIZE >= retrohunt.total_hits) return;

      const tableRect = tableEl.getBoundingClientRect();
      const lastEl = document.getElementById('hit-body').lastElementChild;
      if (lastEl === null) handleFetchMoreHits();

      const lastRect = lastEl.getBoundingClientRect();
      if (tableRect.bottom > lastRect.top && lastRect.bottom > tableRect.top) handleFetchMoreHits();
    }

    handleScrollEnd();
    tableEl.addEventListener('scrollend', handleScrollEnd);
    return () => {
      tableEl.removeEventListener('scrollend', handleScrollEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, offset, retrohunt]);

  if (isError) return <NotFoundPage />;
  else if (isForbidden) return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={isDrawer ? 2 : 4}>
        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={2}>
          {c12nDef.enforce && (
            <Grid item paddingBottom={theme.spacing(2)}>
              <Classification
                format="long"
                type="pill"
                c12n={!isLoading && retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
              />
            </Grid>
          )}

          <Grid item>
            <Grid container flexDirection="row">
              <Grid item flexGrow={1}>
                <Typography variant="h4" children={isLoading ? <Skeleton width="30rem" /> : t('header.view')} />
                <Typography variant="caption" children={isLoading ? <Skeleton width="20rem" /> : retrohunt.code} />
              </Grid>
              <Grid item>
                <CustomChip
                  icon={isLoading ? <Skeleton variant="circular" width="1rem" height="1rem" /> : null}
                  label={
                    isLoading ? <Skeleton width="5rem" /> : `${progress[0]} - ${progress[1]} : ${t(`phase.${phase}`)} `
                  }
                  color={isLoading ? 'default' : 'primary'}
                  variant="outlined"
                />
                {/* <CustomChip
                  icon={isLoading ? <Skeleton variant="circular" width="1rem" height="1rem" /> : PHASE_MAP[phase]?.icon}
                  label={isLoading ? <Skeleton width="5rem" /> : `${pourcentage}% ${t(`phase.${phase}`)} `}
                  color={isLoading ? 'default' : PHASE_MAP[phase]?.color}
                  variant="outlined"
                /> */}
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('information')}>
              <span>{t('information.header')}</span>
              {isOpen.information ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={isOpen.information} timeout="auto">
              <div className={classes.collapse}>
                <Grid container>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('information.creator')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {isLoading ? <Skeleton width="auto" /> : 'creator' in retrohunt ? retrohunt.creator : null}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('information.created')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {isLoading ? (
                      <Skeleton width="auto" />
                    ) : 'created' in retrohunt ? (
                      <Moment locale={i18n.language} format="YYYY-MM-DD HH:mm:ss.SSS">
                        {retrohunt.created}
                      </Moment>
                    ) : null}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('information.tags')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {isLoading ? (
                      <Skeleton width="auto" />
                    ) : 'tags' in retrohunt && Object.keys(retrohunt.tags).length > 0 ? (
                      Object.keys(retrohunt.tags).join(', ')
                    ) : (
                      t('details.none')
                    )}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('information.truncated')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {isLoading ? <Skeleton width="auto" /> : 'truncated' in retrohunt ? retrohunt.truncated : null}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('information.description')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {isLoading ? <Skeleton width="auto" /> : 'description' in retrohunt ? retrohunt.description : null}
                  </Grid>
                </Grid>
              </div>
            </Collapse>
          </Grid>

          <Grid item>
            <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('signature')}>
              <span>{t('signature.header')}</span>
              {isOpen.signature ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={isOpen.signature} timeout="auto">
              <div className={classes.collapse}>
                {isLoading ? (
                  <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
                ) : (
                  <Grid container flexDirection="column" height="100%" minHeight="500px">
                    <MonacoEditor
                      language="yara"
                      value={'yara_signature' in retrohunt ? retrohunt.yara_signature : ''}
                      options={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </div>
            </Collapse>
          </Grid>

          <Grid item>
            <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('results')}>
              <span>{t('results.header')}</span>
              {isOpen.results ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={isOpen.results} timeout="auto">
              <Grid container className={classes.collapse}>
                <Grid item xs={4} sm={3} lg={2}>
                  <span className={classes.title}>{t('results.total')}</span>
                </Grid>
                <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                  {isLoading ? <Skeleton width="auto" /> : 'total_hits' in retrohunt ? retrohunt.total_hits : null}
                </Grid>

                <Grid className={classes.value} item xs={12}>
                  {!isLoading && 'hits' in retrohunt && retrohunt?.hits !== 0 ? (
                    <TableContainer id="hits-table" className={classes.tableContainer} component={Paper}>
                      <DivTable stickyHeader>
                        <DivTableHead>
                          <DivTableRow>
                            <DivTableCell children={t('table.header.lasttimeseen')} />
                            <DivTableCell children={t('table.header.count')} />
                            <DivTableCell children={t('table.header.sha256')} />
                            <DivTableCell children={t('table.header.filetype')} />
                            <DivTableCell children={t('table.header.size')} />
                            {c12nDef.enforce && <DivTableCell children={t('table.header.classification')} />}
                            <DivTableCell />
                          </DivTableRow>
                        </DivTableHead>
                        <DivTableBody id="hit-body">
                          {retrohunt.hits.map((file, id) => (
                            <LinkRow
                              key={id}
                              component={Link}
                              to={`/file/detail/${file.sha256}`}
                              hover
                              style={{ textDecoration: 'none' }}
                            >
                              <DivTableCell>
                                <Tooltip title={file.seen.last}>
                                  <>
                                    <Moment fromNow locale={i18n.language}>
                                      {file.seen.last}
                                    </Moment>
                                  </>
                                </Tooltip>
                              </DivTableCell>
                              <DivTableCell>{file.seen.count}</DivTableCell>
                              <DivTableCell breakable>{file.sha256}</DivTableCell>
                              <DivTableCell>{file.type}</DivTableCell>
                              <DivTableCell>{file.size}</DivTableCell>
                              {c12nDef.enforce && (
                                <DivTableCell>
                                  <Classification type="text" size="tiny" c12n={file.classification} format="short" />
                                </DivTableCell>
                              )}
                              <DivTableCell style={{ textAlign: 'center' }}>
                                {file.from_archive && (
                                  <Tooltip title={t('archive')}>
                                    <ArchiveOutlinedIcon />
                                  </Tooltip>
                                )}
                              </DivTableCell>
                            </LinkRow>
                          ))}
                        </DivTableBody>
                      </DivTable>
                    </TableContainer>
                  ) : (
                    <div style={{ width: '100%' }}>
                      <InformativeAlert>
                        <AlertTitle>{t('no_files_title')}</AlertTitle>
                        {t('no_results_desc')}
                      </InformativeAlert>
                    </div>
                  )}
                </Grid>
              </Grid>
            </Collapse>
          </Grid>

          {!isLoading && 'errors' in retrohunt && Array.isArray(retrohunt.errors) && retrohunt.errors.length > 0 && (
            <Grid item>
              <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('errors')}>
                <span>{t('errors.header')}</span>
                {isOpen.errors ? <ExpandLess /> : <ExpandMore />}
              </Typography>
              <Divider />
              <Collapse in={isOpen.errors} timeout="auto">
                <Grid container className={classes.collapse}>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('errors.total')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {retrohunt.errors.length}
                  </Grid>

                  <Grid className={classes.value} item xs={12}>
                    <TableContainer className={classes.tableContainer} component={Paper}>
                      <DivTable>
                        <DivTableBody>
                          {retrohunt.errors.map((error, i) => (
                            <DivTableRow key={`${i}`}>
                              <DivTableCell className={classes.tableCell}>{error}</DivTableCell>
                            </DivTableRow>
                          ))}
                        </DivTableBody>
                      </DivTable>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          )}

          {/*
          <Grid item>
            <Typography className={classes.title} variant="h6" onClick={() => setOpen(!open)}>
              <span>{t('details.yara_signature')}</span>
              {open ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={open} timeout="auto">
              <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
                {isLoading ? (
                  <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
                ) : (
                  <Grid container flexDirection="column" height="100%" minHeight="500px">
                    <MonacoEditor
                      language="yara"
                      value={retrohunt.yara_signature}
                      onChange={data => onRetrohuntChange({ yara_signature: data })}
                      options={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </div>
            </Collapse>
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
                <Typography variant="h6" children={t('details.results')} />
                {nbOfPages > 1 && (
                  <Pagination
                    count={nbOfPages}
                    onChange={handlePageChange}
                    shape="rounded"
                    size="small"
                    sx={{ alignSelf: 'flex-end' }}
                  />
                )}
                <FilesTable
                  fileResults={{ items: retrohunt.hits, total: retrohunt.total_hits }}
                  component={props => (
                    <Paper
                      {...props}
                      variant="outlined"
                      sx={{
                        ...props.sx,
                        backgroundColor: theme.palette.background.default,
                        [`& .${tableCellClasses.head}`]: {
                          backgroundColor: theme.palette.background.default
                        }
                      }}
                    />
                  )}
                  allowSort={false}
                />
              </Grid>
            </Grid>
          )} */}
        </Grid>
      </PageFullSize>
      // <PageFullSize margin={isDrawer ? 2 : 4}>
      //   <RouterPrompt when={modified} />
      //   <ConfirmationDialog
      //     open={confirmationOpen}
      //     handleClose={_event => setConfirmationOpen(false)}
      //     handleCancel={onCancelRetrohuntConfirmation}
      //     handleAccept={onCreateRetrohunt}
      //     title={t('validate.title')}
      //     cancelText={t('validate.cancelText')}
      //     acceptText={t('validate.acceptText')}
      //     text={t('validate.text')}
      //   />

      //   <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={2}>
      //     {c12nDef.enforce && (
      //       <Grid item paddingBottom={theme.spacing(2)}>
      //         <Classification
      //           format="long"
      //           type={type === 'add' ? 'picker' : 'pill'}
      //           c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
      //           setClassification={(c12n: string) => onRetrohuntChange({ classification: c12n })}
      //           disabled={!currentUser.roles.includes('retrohunt_run')}
      //         />
      //       </Grid>
      //     )}

      //     <Grid item>
      //       <Grid container flexDirection="row">
      //         <Grid item flexGrow={1}>
      //           {type === 'loading' && (
      //             <Typography variant="h4" children={<Skeleton height="2.5rem" width="30rem" />} />
      //           )}
      //           {type === 'loading' && (
      //             <Typography variant="caption" children={<Skeleton height="2.5rem" width="20rem" />} />
      //           )}
      //           {type === 'add' && <Typography variant="h4" children={t('header.add')} />}
      //           {type === 'view' && <Typography variant="h4" children={t('header.view')} />}
      //           {type === 'view' && <Typography variant="caption" children={retrohunt.code} />}
      //           {['view'].includes(type) && status && (
      //             <div style={{ marginTop: theme.spacing(1) }}>
      //               <CustomChip
      //                 icon={STATUS_MAP[status].icon}
      //                 label={t(`status.${status}`)}
      //                 color={STATUS_MAP[status].color as PossibleColors}
      //                 variant="outlined"
      //               />
      //             </div>
      //           )}
      //         </Grid>

      //         <Grid item>
      //           <div style={{ display: 'flex', marginBottom: theme.spacing(1) }}>
      //             {type === 'loading' && (
      //               <Skeleton
      //                 variant="circular"
      //                 height="2.5rem"
      //                 width="2.5rem"
      //                 style={{ margin: theme.spacing(0.5) }}
      //               />
      //             )}
      //             {type === 'add' && (
      //               <Button
      //                 variant="contained"
      //                 color="primary"
      //                 disabled={buttonLoading || !retrohunt?.description || !retrohunt?.yara_signature}
      //                 onClick={() => setConfirmationOpen(true)}
      //               >
      //                 {t('add.button')}
      //                 {buttonLoading && (
      //                   <CircularProgress
      //                     size={24}
      //                     style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
      //                   />
      //                 )}
      //               </Button>
      //             )}
      //           </div>
      //         </Grid>
      //       </Grid>
      //     </Grid>

      //     {type === 'loading' && <Grid item children={<Skeleton height="2.5rem" />} />}
      //     {type === 'view' && 'creator' in retrohunt && 'created' in retrohunt && (
      //       <Grid item textAlign="center">
      //         <Typography variant="subtitle2" color="textSecondary">
      //           {`${t('created_by')} ${retrohunt.creator} `}
      //           <Moment fromNow locale={i18n.language}>
      //             {retrohunt.created}
      //           </Moment>
      //         </Typography>
      //       </Grid>
      //     )}

      //     {type === 'view' && retrohunt && 'tags' in retrohunt && (
      //       <Grid item>
      //         <Typography variant="subtitle2">{t('details.tags')}</Typography>
      //         <Paper
      //           component="pre"
      //           variant="outlined"
      //           style={{
      //             margin: 0,
      //             padding: theme.spacing(0.75, 1),
      //             whiteSpace: 'pre-wrap',
      //             wordBreak: 'break-word'
      //           }}
      //         >
      //           {Object.keys(retrohunt.tags).length > 0 ? Object.keys(retrohunt.tags).join(', ') : t('details.none')}
      //         </Paper>
      //       </Grid>
      //     )}

      //     <Grid item>
      //       <Typography variant="subtitle2">{t('details.description')}</Typography>
      //       {type === 'loading' || !retrohunt || !('description' in retrohunt) ? (
      //         <Skeleton style={{ height: '8rem', transform: 'none', marginTop: theme.spacing(1) }} />
      //       ) : (
      //         <>
      //           {type === 'add' && (
      //             <TextField
      //               fullWidth
      //               size="small"
      //               multiline
      //               rows={3}
      //               margin="dense"
      //               variant="outlined"
      //               value={retrohunt.description}
      //               onChange={event => onRetrohuntChange({ description: event.target.value })}
      //             />
      //           )}
      //           {type === 'view' && (
      //             <Paper
      //               component="pre"
      //               variant="outlined"
      //               children={retrohunt.description}
      //               style={{
      //                 margin: 0,
      //                 padding: theme.spacing(0.75, 1),
      //                 whiteSpace: 'pre-wrap',
      //                 wordBreak: 'break-word'
      //               }}
      //             />
      //           )}
      //         </>
      //       )}
      //     </Grid>

      //     {type === 'add' && retrohunt && 'archive_only' in retrohunt && (
      //       <Grid item>
      //         <Typography variant="subtitle2">{t('details.search')}</Typography>
      //         <RadioGroup
      //           row
      //           value={retrohunt.archive_only ? 'archive_only' : 'all'}
      //           onChange={(_, value) => onRetrohuntChange({ archive_only: value === 'archive_only' })}
      //         >
      //           <FormControlLabel value="all" control={<Radio />} label={t('details.all')} />
      //           <FormControlLabel value="archive_only" control={<Radio />} label={t('details.archive_only')} />
      //         </RadioGroup>
      //       </Grid>
      //     )}

      //     {type === 'view' && retrohunt && (
      //       <Grid item flex={1}>
      //         <Grid container flexDirection="column" height="100%" minHeight="500px">
      //           <Typography variant="h6" children={t('details.results')} />
      //           {nbOfPages > 1 && (
      //             <Pagination
      //               count={nbOfPages}
      //               onChange={handlePageChange}
      //               shape="rounded"
      //               size="small"
      //               sx={{ alignSelf: 'flex-end' }}
      //             />
      //           )}
      //           <FilesTable
      //             fileResults={{ items: retrohunt.hits, total: retrohunt.total_hits }}
      //             component={props => (
      //               <Paper
      //                 {...props}
      //                 variant="outlined"
      //                 sx={{
      //                   ...props.sx,
      //                   backgroundColor: theme.palette.background.default,
      //                   [`& .${tableCellClasses.head}`]: {
      //                     backgroundColor: theme.palette.background.default
      //                   }
      //                 }}
      //               />
      //             )}
      //             allowSort={false}
      //           />
      //         </Grid>
      //       </Grid>
      //     )}

      //     <Grid item flex={1}>
      //       <Grid container flexDirection="column" height="100%" minHeight="500px">
      //         <Typography variant="h6" children={t('details.yara_signature')} />
      //         {type === 'loading' || !retrohunt || !('yara_signature' in retrohunt) ? (
      //           <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
      //         ) : (
      //           <MonacoEditor
      //             language="yara"
      //             value={retrohunt.yara_signature}
      //             onChange={data => onRetrohuntChange({ yara_signature: data })}
      //             options={{ readOnly: type !== 'add' }}
      //           />
      //         )}
      //       </Grid>
      //     </Grid>
      //   </Grid>
      // </PageFullSize>
    );
}

export const RetrohuntDetail = React.memo(WrappedRetrohuntDetail);

WrappedRetrohuntDetail.defaultProps = {
  pageType: 'page',
  retrohuntCode: null,
  retrohuntRef: null
} as Props;

export default WrappedRetrohuntDetail;
