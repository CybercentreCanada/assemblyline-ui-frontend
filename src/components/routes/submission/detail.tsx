import {
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
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import MoodIcon from '@material-ui/icons/Mood';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import ReplayOutlinedIcon from '@material-ui/icons/ReplayOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import FileDetail from 'components/visual/FileDetail';
import VerdictBar from 'components/visual/VerdictBar';
import getXSRFCookie from 'helpers/xsrf';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import AttackSection from './detail/attack';
import FileTreeSection from './detail/file_tree';
import HeuristicSection from './detail/heuristics';
import InfoSection from './detail/info';
import MetaSection from './detail/meta';
import TagSection from './detail/tags';

const useStyles = makeStyles(theme => ({
  drawerPaper: {
    width: '85%',
    maxWidth: '1200px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
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
  const [summary, setSummary] = useState(null);
  const [tree, setTree] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const apiCall = useMyAPI();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const { showSuccessMessage } = useMySnackbar();
  const history = useHistory();
  const classes = useStyles();
  const { user: currentUser } = useAppContext();
  const { setHighlightMap } = useHighlighter();

  const resubmit = useCallback(() => {
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
  }, [apiCall, history, showSuccessMessage, submission, t]);

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

  const setVerdict = useCallback(
    verdict => {
      if (submission != null && submission.verdict[verdict].indexOf(currentUser.username) === -1) {
        apiCall({
          method: 'PUT',
          url: `/api/v4/submission/verdict/${submission.sid}/${verdict}/`,
          onSuccess: api_data => {
            if (!api_data.api_response.success) {
              return;
            }
            const newSubmission = { ...submission };
            if (verdict === 'malicious') {
              if (newSubmission.verdict.malicious.indexOf(currentUser.username) === -1) {
                newSubmission.verdict.malicious.push(currentUser.username);
              }
              if (newSubmission.verdict.non_malicious.indexOf(currentUser.username) !== -1) {
                newSubmission.verdict.non_malicious.splice(
                  newSubmission.verdict.non_malicious.indexOf(currentUser.username),
                  1
                );
              }
            } else {
              if (newSubmission.verdict.non_malicious.indexOf(currentUser.username) === -1) {
                newSubmission.verdict.non_malicious.push(currentUser.username);
              }
              if (newSubmission.verdict.malicious.indexOf(currentUser.username) !== -1) {
                newSubmission.verdict.malicious.splice(submission.verdict.malicious.indexOf(currentUser.username), 1);
              }
            }
            setSubmission(newSubmission);
          }
        });
      }
    },
    [apiCall, currentUser.username, submission]
  );

  const closeDrawer = () => {
    history.push(`/submission/detail/${id}`);
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
        setHighlightMap(api_data.api_response.map);
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
    if (!drawer && fid) {
      setDrawer(true);
    } else if (drawer && !fid) {
      setDrawer(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fid]);

  return (
    <PageCenter ml={4} mr={4} width="100%">
      <ConfirmationDialog
        open={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleAccept={deleteSubmission}
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />

      <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={drawer} onClose={closeDrawer}>
        <div id="drawerTop" style={{ padding: sp1 }}>
          <IconButton onClick={closeDrawer}>
            <CloseOutlinedIcon />
          </IconButton>
        </div>
        {id && fid && (
          <div style={{ paddingLeft: sp2, paddingRight: sp2 }}>
            <FileDetail sha256={fid} sid={id} />
          </div>
        )}
      </Drawer>
      <div style={{ textAlign: 'left' }}>
        {useMemo(
          () => (
            <>
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
                        <IconButton
                          onClick={() => setDeleteDialog(true)}
                          style={{
                            color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                          }}
                        >
                          <RemoveCircleOutlineOutlinedIcon />
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
                    <div
                      style={{
                        textAlign: 'right',
                        width: '164px',
                        marginTop: '8px',
                        marginLeft: 'auto',
                        marginRight: '12px'
                      }}
                    >
                      {submission ? <VerdictBar verdicts={submission.verdict} /> : <Skeleton />}
                      <Grid container>
                        <Grid item xs={5} style={{ textAlign: 'left' }}>
                          <Tooltip
                            title={t(
                              `verdict.${
                                submission && submission.verdict.malicious.indexOf(currentUser.username) !== -1
                                  ? 'is'
                                  : 'set'
                              }.malicious`
                            )}
                          >
                            <IconButton size="small" onClick={() => setVerdict('malicious')}>
                              <MoodBadIcon
                                style={{
                                  color:
                                    submission && submission.verdict.malicious.indexOf(currentUser.username) !== -1
                                      ? theme.palette.error.dark
                                      : null
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={2} />
                        <Grid item xs={5} style={{ textAlign: 'right' }}>
                          <Tooltip
                            title={t(
                              `verdict.${
                                submission && submission.verdict.non_malicious.indexOf(currentUser.username) !== -1
                                  ? 'is'
                                  : 'set'
                              }.non_malicious`
                            )}
                          >
                            <IconButton size="small" onClick={() => setVerdict('non_malicious')}>
                              <MoodIcon
                                style={{
                                  color:
                                    submission && submission.verdict.non_malicious.indexOf(currentUser.username) !== -1
                                      ? theme.palette.success.dark
                                      : null
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [submission, id]
        )}

        <InfoSection submission={submission} />

        {(!submission || Object.keys(submission.metadata).length !== 0) && (
          <MetaSection metadata={submission ? submission.metadata : null} />
        )}

        {(!summary || Object.keys(summary.attack_matrix).length !== 0) && (
          <AttackSection attack_matrix={summary ? summary.attack_matrix : null} />
        )}

        {(!summary || Object.keys(summary.heuristics).length !== 0) && (
          <HeuristicSection heuristics={summary ? summary.heuristics : null} />
        )}

        {summary &&
          Object.keys(summary.tags).length !== 0 &&
          Object.keys(summary.tags).map((tag_group, group_idx) => {
            return (
              Object.keys(summary.tags[tag_group]).length !== 0 && (
                <TagSection key={group_idx} tag_group={tag_group} tags={summary.tags[tag_group]} />
              )
            );
          })}

        <FileTreeSection tree={tree ? tree.tree : null} sid={id} />
      </div>
    </PageCenter>
  );
}
