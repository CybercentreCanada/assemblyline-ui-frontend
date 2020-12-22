import {
  Grid,
  IconButton,
  LinearProgress,
  Link as MaterialLink,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import ReplayOutlinedIcon from '@material-ui/icons/ReplayOutlined';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useAppContext from 'components/hooks/useAppContext';
import useDrawer from 'components/hooks/useDrawer';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import FileDetail from 'components/visual/FileDetail';
import VerdictBar from 'components/visual/VerdictBar';
import { getErrorIDFromKey, getServiceFromKey } from 'helpers/errors';
import getXSRFCookie from 'helpers/xsrf';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import AttackSection from './detail/attack';
import ErrorSection from './detail/errors';
import FileTreeSection from './detail/file_tree';
import HeuristicSection from './detail/heuristics';
import InfoSection from './detail/info';
import MetaSection from './detail/meta';
import TagSection from './detail/tags';

const NAMESPACE = '/live_submission';
const MESSAGE_TIMEOUT = 5000;

type ParamProps = {
  id: string;
  fid?: string;
};

const messageReducer = (messages: string[], receivedMessages: string[]) => {
  const newMessages = receivedMessages.filter(item => messages.indexOf(item) === -1);
  if (newMessages.length !== 0) {
    return [...messages, ...newMessages];
  }
  return messages;
};

export default function SubmissionDetail() {
  const { t } = useTranslation(['submissionDetail']);
  const { id, fid } = useParams<ParamProps>();
  const theme = useTheme();
  const [submission, setSubmission] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tree, setTree] = useState(null);
  const [watchQueue, setWatchQueue] = useState(null);
  const [liveResultKeys, setLiveResultKeys] = useReducer(messageReducer, []);
  const [liveErrorKeys, setLiveErrorKeys] = useReducer(messageReducer, []);
  const [processedKeys, setProcessedKeys] = useReducer(messageReducer, []);
  const [socket, setSocket] = useState(null);
  const [hasTimeout, setHasTimeout] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const apiCall = useMyAPI();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const { showSuccessMessage } = useMySnackbar();
  const history = useHistory();
  const { user: currentUser } = useAppContext();
  const { setHighlightMap } = useHighlighter();
  const { setGlobalDrawer, globalDrawer } = useDrawer();

  const parseSubmissionErrors = currentSubmission => {
    const relevantErrors = errors => {
      return errors.filter(error => {
        let eID = error.substr(65, error.length);

        if (eID.indexOf('.e') !== -1) {
          eID = eID.substr(eID.indexOf('.e') + 2, eID.length);
        }

        return ['20', '21', '12', '10', '11'].indexOf(eID) === -1;
      });
    };
    const futileErrors = errors => {
      const out = {
        depth: [],
        files: [],
        retry: [],
        down: [],
        busy: []
      };
      errors.forEach(error => {
        const srv = getServiceFromKey(error);
        const eID = getErrorIDFromKey(error);

        if (eID === '20') {
          if (out.busy.indexOf(srv) === -1) {
            out.busy.push(srv);
          }
        }
        if (eID === '21') {
          if (out.down.indexOf(srv) === -1) {
            out.down.push(srv);
          }
        } else if (eID === '12') {
          if (out.retry.indexOf(srv) === -1) {
            out.retry.push(srv);
          }
        } else if (eID === '10') {
          if (out.depth.indexOf(srv) === -1) {
            out.depth.push(srv);
          }
        } else if (eID === '11') {
          if (out.files.indexOf(srv) === -1) {
            out.files.push(srv);
          }
        }
      });

      out.busy.sort();
      out.down.sort();
      out.depth.sort();
      out.files.sort();
      out.retry.sort();

      return out;
    };

    return {
      ...currentSubmission,
      parsed_errors: {
        aggregated: futileErrors(currentSubmission.errors),
        listed: relevantErrors(currentSubmission.errors)
      }
    };
  };

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

  useEffect(() => {
    apiCall({
      url: `/api/v4/submission/${id}/`,
      onSuccess: api_data => {
        setSubmission(parseSubmissionErrors(api_data.api_response));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (submission) {
      if (submission.state === 'completed') {
        apiCall({
          url: `/api/v4/submission/summary/${id}/`,
          onSuccess: summ_data => {
            setHighlightMap(summ_data.api_response.map);
            setSummary(summ_data.api_response);
          }
        });
        apiCall({
          url: `/api/v4/submission/tree/${id}/`,
          onSuccess: tree_data => {
            setTree(tree_data.api_response);
          }
        });
      } else {
        if (!socket) {
          // eslint-disable-next-line no-console
          console.log('SocketIO :: Init => Create SocketIO client...');
          const tempSocket = io(NAMESPACE);
          tempSocket.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('SocketIO :: Conn => Connecting to socketIO server...');
          });
          tempSocket.on('disconnect', () => {
            // eslint-disable-next-line no-console
            console.log('SocketIO :: Conn => Disconnected from socketIO server...');
          });
          setSocket(tempSocket);
        }

        apiCall({
          url: `/api/v4/live/setup_watch_queue/${id}/`,
          onSuccess: summ_data => {
            setWatchQueue(summ_data.api_response.wq_id);
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  const handleErrorMessage = useCallback(
    data => {
      // eslint-disable-next-line no-console
      console.log(`SocketIO :: onError => ${data.msg}`);
      apiCall({
        url: `/api/v4/live/setup_watch_queue/${id}/`,
        onSuccess: summ_data => {
          setWatchQueue(summ_data.api_response.wq_id);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  const handleStartMessage = data => {
    // eslint-disable-next-line no-console
    console.log(`SocketIO :: onStart => ${data.msg}`);
  };

  const handleStopMessage = useCallback(
    data => {
      // eslint-disable-next-line no-console
      console.log(`SocketIO :: onStop => ${data.msg}`);

      setTimeout(() => {
        // Loading final submission
        apiCall({
          url: `/api/v4/submission/${id}/`,
          onSuccess: api_data => {
            setSubmission(parseSubmissionErrors(api_data.api_response));
          }
        });
      }, 2000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  const handleCacheKeyMessage = data => {
    // eslint-disable-next-line no-console
    console.log(`SocketIO :: onCacheKey => ${data.msg}`);
    setLiveResultKeys([data.msg]);
  };

  const handleCacheKeyErrrorMessage = data => {
    // eslint-disable-next-line no-console
    console.log(`SocketIO :: onCacheKeyError => ${data.msg}`);
    setLiveErrorKeys([data.msg]);
  };

  const loadMessageData = useCallback((newResults: string[], newErrors: string[]) => {
    console.log(`New Results: ${newResults.join(' | ')} - New Errors: ${newErrors.join(' | ')}`);

    apiCall({
      method: 'POST',
      url: '/api/v4/result/multiple_keys/',
      body: { errors: newErrors, results: newResults },
      onSuccess: api_data => {
        setProcessedKeys([...newResults, ...newErrors]);
        console.log(api_data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket) {
      // eslint-disable-next-line no-console
      console.log('SocketIO :: Init => Registering SocketIO Callbacks...');
      socket.on('error', handleErrorMessage);
      socket.on('start', handleStartMessage);
      socket.on('stop', handleStopMessage);
      socket.on('cachekey', handleCacheKeyMessage);
      socket.on('cachekeyerr', handleCacheKeyErrrorMessage);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket, handleErrorMessage, handleStopMessage]);

  useEffect(() => {
    if (watchQueue) {
      // eslint-disable-next-line no-console
      console.log(`SocketIO :: emitListen => Listening for messages on watch queue: ${watchQueue}`);
      socket.emit('listen', { wq_id: watchQueue, from_start: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchQueue, socket, handleErrorMessage]);

  useEffect(() => {
    if (submission !== null && globalDrawer === null && fid !== undefined) {
      history.push(`/submission/detail/${id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawer]);

  useEffect(() => {
    if (fid) {
      setGlobalDrawer(<FileDetail sha256={fid} sid={id} />);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fid]);

  useEffect(() => {
    // TODO: Do something with those messages
    const newResults = liveResultKeys.filter(msg => processedKeys.indexOf(msg) === -1);
    const newErrors = liveErrorKeys.filter(msg => processedKeys.indexOf(msg) === -1);
    if (newResults.length !== 0 || newErrors.length !== 0) {
      if (!hasTimeout) {
        setHasTimeout(true);
        setTimeout(() => {
          loadMessageData(newResults, newErrors);
          setHasTimeout(false);
        }, MESSAGE_TIMEOUT);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveResultKeys, liveErrorKeys]);

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
      <div style={{ textAlign: 'left' }}>
        {useMemo(
          () => (
            <>
              <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
                <Classification size="tiny" c12n={submission ? submission.classification : null} />
              </div>
              <div style={{ paddingBottom: sp4 }}>
                <Grid container>
                  <Grid item xs>
                    <div>
                      <Typography variant="h4">{t('title')}</Typography>
                      <Typography variant="caption">
                        {submission ? submission.sid : <Skeleton style={{ width: '10rem' }} />}
                      </Typography>
                    </div>
                    {socket && (
                      <div
                        style={{
                          paddingBottom: theme.spacing(3),
                          paddingTop: theme.spacing(2),
                          color:
                            theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
                        }}
                      >
                        <PlayCircleOutlineIcon
                          style={{
                            height: theme.spacing(2),
                            width: theme.spacing(2),
                            verticalAlign: 'sub',
                            marginRight: theme.spacing(1)
                          }}
                        />
                        {t('live_mode')}
                        <LinearProgress />
                      </div>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
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
                              <BugReportOutlinedIcon
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
                              <VerifiedUserOutlinedIcon
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
          [submission, id, socket]
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

        {submission && Object.keys(submission.errors).length !== 0 && (
          <ErrorSection sid={id} parsed_errors={submission.parsed_errors} />
        )}

        <FileTreeSection tree={tree ? tree.tree : null} sid={id} />
      </div>
    </PageCenter>
  );
}
