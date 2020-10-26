import {
  Box,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Link as MaterialLink,
  makeStyles,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import DoneOutlinedIcon from '@material-ui/icons/DoneOutlined';
import ReplayOutlinedIcon from '@material-ui/icons/ReplayOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Attack from 'components/visual/Attack';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import FileDetail from 'components/visual/FileDetail';
import Heuristic from 'components/visual/Heuristic';
import Tag from 'components/visual/Tag';
import Verdict from 'components/visual/Verdict';
import getXSRFCookie from 'helpers/xsrf';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useHistory, useParams } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  file_item: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  },
  drawerPaper: {
    width: '85%',
    maxWidth: '1200px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

type ParamProps = {
  id: string;
  fid?: string;
};

export default function SubmissionDetail() {
  const { t } = useTranslation(['submissionDetail']);
  const { id, fid } = useParams<ParamProps>();
  const theme = useTheme();
  const [submission, setSubmission] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [summary, setSummary] = useState(null);
  const [tree, setTree] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const apiCall = useMyAPI();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const { showSuccessMessage } = useMySnackbar();
  const history = useHistory();
  const classes = useStyles();

  const resubmit = () => {
    if (submission != null) {
      apiCall({
        url: `/api/v4/submit/resubmit/${submission.sid}/`,
        onSuccess: api_data => {
          showSuccessMessage(t('submit.success'));
          setSubmission(null);
          setSummary(null);
          setTree(null);
          setTimeout(() => {
            history.push(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        }
      });
    }
  };

  const deleteSubmission = () => {
    if (submission != null) {
      apiCall({
        method: 'DELETE',
        url: `/api/v4/submission/${submission.sid}/`,
        onSuccess: api_data => {
          showSuccessMessage(t('delete.success'));
          setDeleteDialog(false);
          setTimeout(() => {
            history.push('/submissions');
          }, 500);
        }
      });
    }
  };

  useEffect(() => {
    apiCall({
      url: `/api/v4/submission/${id}/`,
      onSuccess: api_data => {
        setSubmission(api_data.api_response);
      }
    });
    apiCall({
      url: `/api/v4/submission/summary/${id}/`,
      onSuccess: api_data => {
        setSummary(api_data.api_response);
      }
    });
    apiCall({
      url: `/api/v4/submission/tree/${id}/`,
      onSuccess: api_data => {
        setTree(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    setDrawer(fid !== undefined);
  }, [fid]);

  return (
    <PageCenter>
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={deleteSubmission}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />

      <Drawer
        anchor="right"
        classes={{ paper: classes.drawerPaper }}
        open={drawer}
        onClose={() => history.push(`/submission/detail/${id}`)}
      >
        <div id="drawerTop" style={{ padding: sp1 }}>
          <IconButton onClick={() => history.push(`/submission/detail/${id}`)}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        {drawer && (
          <div style={{ paddingLeft: sp2, paddingRight: sp2 }}>
            <FileDetail sha256={fid} sid={id} />
          </div>
        )}
      </Drawer>
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
          <Classification size="tiny" c12n={submission ? submission.classification : null} />
        </div>
        <div style={{ paddingBottom: sp4 }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <div>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="caption">
                  {submission ? submission.sid : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm>
              <div style={{ textAlign: 'right' }}>
                <Tooltip title={t('delete')}>
                  <IconButton onClick={() => setDeleteDialog(true)}>
                    <ClearOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('download')}>
                  <IconButton
                    component={MaterialLink}
                    href={`/api/v4/bundle/${submission ? submission.sid : id}/?XSRF_TOKEN=${getXSRFCookie()}`}
                  >
                    <CloudDownloadOutlinedIcon color="action" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('resubmit')}>
                  <IconButton onClick={resubmit}>
                    <ReplayOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('report_view')}>
                  <IconButton component={Link} to={`/submission/report/${submission ? submission.sid : id}`}>
                    <ChromeReaderModeOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>
          </Grid>
        </div>

        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('information')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            <Grid container>
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('params.description')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {submission ? submission.params.description : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('params.groups')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {submission ? submission.params.groups.join(' | ') : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('params.services.selected')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {submission ? submission.params.services.selected.join(' | ') : <Skeleton />}
              </Grid>

              {['deep_scan', 'ignore_cache', 'ignore_dynamic_recursion_prevention', 'ignore_filtering'].map((k, i) => {
                return (
                  <div key={i} style={{ display: 'contents' }}>
                    <Grid item xs={4} sm={3} lg={2}>
                      <span style={{ fontWeight: 500 }}>{t(`params.${k}`)}</span>
                    </Grid>
                    <Grid item xs={8} sm={9} lg={10}>
                      {submission ? (
                        submission.params[k] ? (
                          <DoneOutlinedIcon color="primary" />
                        ) : (
                          <ClearOutlinedIcon color="error" />
                        )
                      ) : (
                        <Skeleton />
                      )}
                    </Grid>
                  </div>
                );
              })}

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('params.submitter')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {submission ? submission.params.submitter : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('max_score')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {submission ? <Verdict score={submission.max_score} /> : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('times.submitted')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {submission ? <Moment format="YYYY-MM-DD HH:mm:ss">{submission.times.submitted}</Moment> : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('times.completed')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {submission ? <Moment format="YYYY-MM-DD HH:mm:ss">{submission.times.completed}</Moment> : <Skeleton />}
              </Grid>
            </Grid>
          </div>

          {(!submission || Object.keys(submission.metadata).length !== 0) && (
            <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
              <Typography variant="h6">{t('metadata')}</Typography>
              <Divider />
              <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
                {submission
                  ? Object.keys(submission.metadata).map((meta, i) => {
                      return (
                        <Grid container key={i}>
                          <Grid item xs={12} sm={3} lg={2}>
                            <span style={{ fontWeight: 500 }}>{meta}</span>
                          </Grid>
                          <Grid item xs={12} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                            {submission.metadata[meta]}
                          </Grid>
                        </Grid>
                      );
                    })
                  : [...Array(3)].map((_, i) => {
                      return (
                        <Grid container key={i} spacing={1}>
                          <Grid item xs={12} sm={3} lg={2}>
                            <Skeleton style={{ height: '2rem' }} />
                          </Grid>
                          <Grid item xs={12} sm={9} lg={10}>
                            <Skeleton style={{ height: '2rem' }} />
                          </Grid>
                        </Grid>
                      );
                    })}
              </div>
            </div>
          )}

          {(!summary || Object.keys(summary.attack_matrix).length !== 0) && (
            <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
              <Typography variant="h6">{t('attack_matrix')}</Typography>
              <Divider />
              <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
                {summary
                  ? Object.keys(summary.attack_matrix).map((cat, i) => {
                      return (
                        <Grid container key={i}>
                          <Grid item xs={12} sm={3} lg={2}>
                            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              {cat.replace(/-/g, ' ')}
                            </span>
                          </Grid>
                          <Grid item xs={12} sm={9} lg={10}>
                            {summary.attack_matrix[cat].map(([cid, name, lvl], idx) => {
                              return <Attack key={`${cid}_${idx}`} text={name} lvl={lvl} />;
                            })}
                          </Grid>
                        </Grid>
                      );
                    })
                  : [...Array(3)].map((_, i) => {
                      return (
                        <Grid container key={i} spacing={1}>
                          <Grid item xs={12} sm={3} lg={2}>
                            <Skeleton style={{ height: '2rem' }} />
                          </Grid>
                          <Grid item xs={12} sm={9} lg={10}>
                            <Skeleton style={{ height: '2rem' }} />
                          </Grid>
                        </Grid>
                      );
                    })}
              </div>
            </div>
          )}

          {(!summary || Object.keys(summary.heuristics).length !== 0) && (
            <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
              <Typography variant="h6">{t('heuristics')}</Typography>
              <Divider />
              <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
                {summary
                  ? Object.keys(summary.heuristics).map((lvl, i) => {
                      return (
                        <Grid container key={i}>
                          <Grid item xs={12} sm={3} lg={2}>
                            <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{t(`verdict.${lvl}`)}</span>
                          </Grid>
                          <Grid item xs={12} sm={9} lg={10}>
                            {summary.heuristics[lvl].map(([cid, name], idx) => {
                              return <Heuristic key={`${cid}_${idx}`} text={name} lvl={lvl} />;
                            })}
                          </Grid>
                        </Grid>
                      );
                    })
                  : [...Array(3)].map((_, i) => {
                      return (
                        <Grid container key={i} spacing={1}>
                          <Grid item xs={12} sm={3} lg={2}>
                            <Skeleton style={{ height: '2rem' }} />
                          </Grid>
                          <Grid item xs={12} sm={9} lg={10}>
                            <Skeleton style={{ height: '2rem' }} />
                          </Grid>
                        </Grid>
                      );
                    })}
              </div>
            </div>
          )}

          {summary &&
            Object.keys(summary.tags).length !== 0 &&
            Object.keys(summary.tags).map((tag_group, group_idx) => {
              return (
                Object.keys(summary.tags[tag_group]).length !== 0 && (
                  <div key={group_idx} style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
                    <Typography variant="h6">{t(tag_group)}</Typography>
                    <Divider />
                    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
                      {Object.keys(summary.tags[tag_group]).map((tag_type, i) => {
                        return (
                          <Grid container key={i}>
                            <Grid item xs={12} sm={3} lg={2}>
                              <span style={{ fontWeight: 500 }}>{tag_type}</span>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={10}>
                              {summary.tags[tag_group][tag_type].map(([value, lvl], idx) => {
                                return <Tag key={idx} value={value} type={tag_type} lvl={lvl} />;
                              })}
                            </Grid>
                          </Grid>
                        );
                      })}
                    </div>
                  </div>
                )
              );
            })}

          <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
            <Typography variant="h6">{t('tree')}</Typography>
            <Divider />
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {tree ? (
                <FileTree tree={tree.tree} sid={id} />
              ) : (
                [...Array(3)].map((_, i) => {
                  return (
                    <div style={{ display: 'flex' }} key={i}>
                      <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '0.5rem' }} />
                      <Skeleton style={{ flexGrow: 1 }} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PageCenter>
  );
}

type FileItemProps = {
  children: {
    [key: string]: FileItemProps;
  };
  name: string[];
  score: number;
  sha256: string;
  size: number;
  truncated: boolean;
  type: string;
};

type FileTreeProps = {
  tree: {
    [key: string]: FileItemProps;
  };
  sid: string;
};

const FileTree = ({ tree, sid }: FileTreeProps) => {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();

  return (
    <>
      {Object.keys(tree).map((sha256, i) => {
        const item = tree[sha256];
        return (
          <div key={i}>
            <Box
              className={classes.file_item}
              onClick={() => {
                history.push(`/submission/detail/${sid}/${item.sha256}?name=${encodeURI(item.name[0])}`);
              }}
              style={{ wordBreak: 'break-word' }}
            >
              <Verdict score={item.score} mono short />
              {`:: ${item.name.join(' | ')} `}
              <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{`[${item.type}]`}</span>
            </Box>
            <div style={{ marginLeft: theme.spacing(3) }}>
              <FileTree tree={item.children} sid={sid} />
            </div>
          </div>
        );
      })}
    </>
  );
};
