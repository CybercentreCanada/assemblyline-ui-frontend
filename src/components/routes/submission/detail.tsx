import {
  Grid,
  IconButton,
  LinearProgress,
  Link as MaterialLink,
  Snackbar,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined';
import ChromeReaderModeOutlinedIcon from '@material-ui/icons/ChromeReaderModeOutlined';
import CloseIcon from '@material-ui/icons/Close';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';
import ReplayOutlinedIcon from '@material-ui/icons/ReplayOutlined';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import { Alert, Skeleton } from '@material-ui/lab';
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
const OUTSTANDING_TRIGGER_COUNT = 4;

type ParamProps = {
  id: string;
  fid?: string;
};

const resultReducer = (currentResults, newResults) => {
  if (currentResults === null) return newResults;

  return {
    result: { ...currentResults.result, ...newResults.result },
    error: { ...currentResults.error, ...newResults.error }
  };
};

const messageReducer = (messages: string[], receivedMessages: string[]) => {
  const newMessages = receivedMessages.filter(item => messages.indexOf(item) === -1);
  if (newMessages.length !== 0) {
    return [...messages, ...newMessages];
  }
  return messages;
};

const incrementReducer = (old: number, increment: number) => {
  return old + increment;
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
  const [liveResults, setLiveResults] = useReducer(resultReducer, null);
  const [configuration, setConfiguration] = useState(null);
  const [liveErrors, setLiveErrors] = useState(null);
  const [liveTagMap, setLiveTagMap] = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [loadTrigger, incrementLoadTrigger] = useReducer(incrementReducer, 0);
  const [socket, setSocket] = useState(null);
  const [loadInterval, setLoadInterval] = useState(null);
  const [lastSuccessfulTrigger, setLastSuccessfulTrigger] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const apiCall = useMyAPI();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();
  const history = useHistory();
  const { user: currentUser } = useAppContext();
  const { setHighlightMap } = useHighlighter();
  const { setGlobalDrawer, globalDrawer } = useDrawer();

  const updateLiveSumary = (results: object) => {
    const tempSummary = summary !== null ? summary : { tags: {}, heuristics: {}, attack_matrix: {} };
    const tempTagMap = liveTagMap !== null ? liveTagMap : {};

    Object.entries(results).forEach(([resultKey, result]) => {
      const key = resultKey.substr(0, 64);

      if (!Object.hasOwnProperty.call(tempTagMap, key)) {
        tempTagMap[key] = [];
      }

      // eslint-disable-next-line guard-for-in
      for (const sectionID in result.result.sections) {
        const section = result.result.sections[sectionID];
        let hType = 'info';
        if (section.heuristic !== null && section.heuristic !== undefined) {
          if (section.heuristic.score < 100) {
            hType = 'info';
          } else if (section.heuristic.score < 1000) {
            hType = 'suspicious';
          } else {
            hType = 'malicious';
          }
        }

        // TODO:
        // #1: Parse heuristics
        // #2: Parse Att&cks

        // eslint-disable-next-line guard-for-in
        for (const tagID in section.tags) {
          const tag = section.tags[tagID];
          let summaryType = null;
          if (configuration['submission.tag_types.attribution'].indexOf(tag.type) !== -1) {
            summaryType = 'attribution';
          } else if (configuration['submission.tag_types.behavior'].indexOf(tag.type) !== -1) {
            summaryType = 'behavior';
          } else if (configuration['submission.tag_types.ioc'].indexOf(tag.type) !== -1) {
            summaryType = 'ioc';
          }

          if (summaryType !== null) {
            if (!Object.hasOwnProperty.call(tempSummary.tags, summaryType)) {
              tempSummary.tags[summaryType] = {};
            }

            if (!Object.hasOwnProperty.call(tempSummary.tags[summaryType], tag.type)) {
              tempSummary.tags[summaryType][tag.type] = [];
            }

            let exists = false;
            const tagVal = [tag.value, hType];
            for (const i in tempSummary.tags[summaryType][tag.type]) {
              if (
                tempSummary.tags[summaryType][tag.type][i][0] === tagVal[0] &&
                tempSummary.tags[summaryType][tag.type][i][1] === tagVal[1]
              ) {
                exists = true;
                break;
              }
            }

            if (!exists) {
              tempSummary.tags[summaryType][tag.type].push(tagVal);
            }

            const tagKey = `${tag.type}__${tag.value}`;
            tempTagMap[key].push(tagKey);
            if (!Object.hasOwnProperty.call(tempTagMap, tagKey)) {
              tempTagMap[tagKey] = [];
            }
            tempTagMap[tagKey].push(key);
          }
        }
      }
    });
    setLiveTagMap(tempTagMap);
    setHighlightMap(tempTagMap);
    setSummary(tempSummary);
  };

  const updateLiveFileTree = (results: object) => {
    const tempTree = tree !== null ? tree : {};

    const searchFileTree = (sha256: string, currentTree: object) => {
      let output = [];
      Object.entries(currentTree).forEach(([key, val]) => {
        if (Object.keys(val.children).length !== 0) {
          output = [...output, ...searchFileTree(sha256, val.children)];
        }
        if (key === sha256) {
          output.push(val);
        }
      });
      return output;
    };

    const getFilenameFromSHA256 = sha256 => {
      if (submission !== null) {
        for (const i in submission.files) {
          if (submission.files[i].sha256 === sha256) {
            return submission.files[i].name;
          }
        }
      }

      return null;
    };
    Object.entries(results).forEach(([resultKey, result]) => {
      const key = resultKey.substr(0, 64);

      const toUpdate = searchFileTree(key, tempTree);

      if (toUpdate.length === 0) {
        const fname = getFilenameFromSHA256(key);

        if (fname != null) {
          tempTree[key] = { children: {}, name: [fname], score: 0, sha256: key, type: 'N/A' };
          toUpdate.push(tempTree[key]);
        } else {
          if (!Object.hasOwnProperty.call(tempTree, 'TBD')) {
            tempTree.TBD = { children: {}, name: ['Undetermined Parent'], score: 0, type: 'N/A' };
          }

          tempTree.TBD.children[key] = { children: {}, name: [key], score: 0, sha256: key, type: 'N/A' };
          toUpdate.push(tempTree.TBD.children[key]);
        }
      }
      const toDelTDB = [];
      for (const idx in toUpdate) {
        if (Object.hasOwnProperty.call(toUpdate, idx)) {
          const item = toUpdate[idx];
          if (result.result.score !== undefined) {
            item.score += result.result.score;
          }

          for (const i in result.response.extracted) {
            if (Object.hasOwnProperty.call(result.response.extracted, i)) {
              const { sha256, name } = result.response.extracted[i];

              if (!Object.hasOwnProperty.call(item.children, sha256)) {
                if (
                  Object.hasOwnProperty.call(tempTree, 'TBD') &&
                  Object.hasOwnProperty.call(tempTree.TBD.children, sha256)
                ) {
                  item.children[sha256] = tempTree.TBD.children[sha256];
                  item.children[sha256].name = [name];
                  if (toDelTDB.indexOf(sha256) === -1) toDelTDB.push(sha256);
                } else {
                  item.children[sha256] = { children: {}, name: [name], score: 0, sha256, type: 'N/A' };
                }
              } else {
                item.children[sha256].name.push(name);
              }
            }
          }
        }
      }

      for (const idxDel in toDelTDB) {
        if (Object.hasOwnProperty.call(toDelTDB, idxDel)) {
          delete tempTree.TBD.children[toDelTDB[idxDel]];
        }
      }
    });

    if (tempTree.TBD && Object.keys(tempTree.TBD.children).length === 0) delete tempTree.TBD;
    setTree(tempTree);
  };

  const getParsedErrors = errorList => {
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
      aggregated: futileErrors(errorList),
      listed: relevantErrors(errorList)
    };
  };

  const parseSubmissionErrors = currentSubmission => {
    return {
      ...currentSubmission,
      parsed_errors: getParsedErrors(currentSubmission.errors)
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
      url: '/api/v4/help/configuration/',
      onSuccess: api_data => {
        setConfiguration(api_data.api_response);
      }
    });
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
            setTree(tree_data.api_response.tree);
          }
        });
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
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
        setLoadInterval(setInterval(() => incrementLoadTrigger(1), MESSAGE_TIMEOUT));

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
      showErrorMessage(t('dispatcher.not_responding'), 15000);
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
    setTimeout(() => incrementLoadTrigger(1), 500);
  };

  const handleStopMessage = useCallback(
    data => {
      // eslint-disable-next-line no-console
      console.log(`SocketIO :: onStop => ${data.msg}`);

      setTimeout(() => {
        if (loadInterval) clearInterval(loadInterval);
        setLoadInterval(null);
        setOutstanding(null);
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

  const resetOutstanding = () => {
    setLastSuccessfulTrigger(loadTrigger);
    setOutstanding(null);
  };

  useEffect(() => {
    return () => {
      if (loadInterval) clearInterval(loadInterval);
    };
  }, [loadInterval]);

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
    if (watchQueue && socket) {
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
      if (liveResults) {
        const curFileLiveResults = [];
        const curFileLiveErrors = [];
        Object.entries(liveResults.result).forEach(([resultKey, result]) => {
          if (resultKey.startsWith(fid)) {
            curFileLiveResults.push(result);
          }
        });
        Object.entries(liveResults.error).forEach(([errorKey, error]) => {
          if (errorKey.startsWith(fid)) {
            curFileLiveErrors.push(error);
          }
        });
        setGlobalDrawer(
          <FileDetail sha256={fid} sid={id} liveResults={curFileLiveResults} liveErrors={curFileLiveErrors} />
        );
      } else {
        setGlobalDrawer(<FileDetail sha256={fid} sid={id} />);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fid]);

  useEffect(() => {
    if (loadTrigger === 0) return;

    // eslint-disable-next-line no-console
    console.log('LIVE :: Checking for new keys to load...');
    const newResults = liveResultKeys.filter(msg => processedKeys.indexOf(msg) === -1);
    const newErrors = liveErrorKeys.filter(msg => processedKeys.indexOf(msg) === -1);
    if (newResults.length !== 0 || newErrors.length !== 0) {
      // eslint-disable-next-line no-console
      console.log(`LIVE :: New Results: ${newResults.join(' | ')} - New Errors: ${newErrors.join(' | ')}`);
      setLiveErrors(getParsedErrors(liveErrorKeys));

      apiCall({
        method: 'POST',
        url: '/api/v4/result/multiple_keys/',
        body: { error: newErrors, result: newResults },
        onSuccess: api_data => {
          setLastSuccessfulTrigger(loadTrigger);
          setProcessedKeys([...newResults, ...newErrors]);
          setLiveResults(api_data.api_response);
          updateLiveFileTree(api_data.api_response.result);
          updateLiveSumary(api_data.api_response.result);
        }
      });
    } else if (
      loadTrigger >= lastSuccessfulTrigger + OUTSTANDING_TRIGGER_COUNT &&
      (!outstanding || loadTrigger % OUTSTANDING_TRIGGER_COUNT === 0)
    ) {
      // eslint-disable-next-line no-console
      console.log('LIVE :: Finding out oustanding services...');

      apiCall({
        url: `/api/v4/live/outstanding_services/${id}/`,
        onSuccess: api_data => {
          setOutstanding(api_data.api_response);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrigger]);

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
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={outstanding !== null}
        key="outstanding"
        style={{ top: theme.spacing(8), zIndex: 100 }}
      >
        {outstanding &&
          (Object.keys(outstanding).length > 0 ? (
            <Alert
              elevation={6}
              severity="info"
              style={{ textAlign: 'left' }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={resetOutstanding}
                  style={{ alignSelf: 'start', margin: '6px 6px 0 0' }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <span style={{ fontWeight: 500, textAlign: 'left' }}>{t('outstanding.title')}</span>
              <Grid container style={{ marginTop: theme.spacing(1) }}>
                <Grid item xs={6}>
                  <b>{t('outstanding.services')}</b>
                </Grid>
                <Grid item xs={6}>
                  <b>{t('outstanding.files')}</b>
                </Grid>
              </Grid>
              {Object.keys(outstanding).map(service => {
                return (
                  <Grid key={service} container>
                    <Grid item xs={6}>
                      <b>{service}</b>
                    </Grid>
                    <Grid item xs={6}>
                      {outstanding[service]}
                    </Grid>
                  </Grid>
                );
              })}
            </Alert>
          ) : (
            <Alert
              elevation={6}
              severity="error"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={resetOutstanding}
                  style={{ alignSelf: 'start', margin: '6px 6px 0 0' }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <div style={{ textAlign: 'left' }}>{t('outstanding.error')}</div>
            </Alert>
          ))}
      </Snackbar>
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
          [submission, id, socket, theme, t]
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

        {submission && submission.state === 'completed' && Object.keys(submission.errors).length !== 0 && (
          <ErrorSection sid={id} parsed_errors={submission.parsed_errors} />
        )}

        {submission && submission.state !== 'completed' && liveErrorKeys.length !== 0 && liveErrors !== null && (
          <ErrorSection sid={id} parsed_errors={liveErrors} />
        )}

        <FileTreeSection tree={tree} sid={id} />
      </div>
    </PageCenter>
  );
}
