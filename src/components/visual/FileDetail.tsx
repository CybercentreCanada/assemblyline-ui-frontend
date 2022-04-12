import { Grid, IconButton, Link as MaterialLink, Tooltip, Typography, useTheme } from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import PageviewOutlinedIcon from '@material-ui/icons/PageviewOutlined';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import RotateLeftOutlinedIcon from '@material-ui/icons/RotateLeftOutlined';
import { Skeleton } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import { Error } from 'components/visual/ErrorCard';
import { AlternateResult, emptyResult, Result } from 'components/visual/ResultCard';
import getXSRFCookie from 'helpers/xsrf';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation } from 'react-router-dom';
import AttackSection from './FileDetail/attacks';
import ChildrenSection from './FileDetail/childrens';
import Detection from './FileDetail/detection';
import EmptySection from './FileDetail/emptys';
import ErrorSection from './FileDetail/errors';
import FrequencySection from './FileDetail/frequency';
import IdentificationSection from './FileDetail/ident';
import MetadataSection from './FileDetail/metadata';
import ParentSection from './FileDetail/parents';
import ResultSection from './FileDetail/results';
import TagSection from './FileDetail/tags';
import InputDialog from './InputDialog';

type FileInfo = {
  archive_ts: string;
  ascii: string;
  classification: string;
  entropy: number;
  expiry_ts: string | null;
  hex: string;
  magic: string;
  md5: string;
  mime: string;
  seen: {
    count: number;
    first: string;
    last: string;
  };
  sha1: string;
  sha256: string;
  size: number;
  ssdeep: string;
  type: string;
};

type File = {
  alternates: {
    [serviceName: string]: AlternateResult[];
  };
  attack_matrix: {
    [category: string]: string[][];
  };
  childrens: {
    name: string;
    sha256: string;
  }[];
  emptys: Result[];
  errors: Error[];
  file_info: FileInfo;
  heuristics: {
    [category: string]: string[][];
  };
  metadata: {
    [level: string]: {
      [key: string]: any;
    };
  };
  parents: string[];
  results: Result[];
  signatures: string[][];
  tags: {
    [type: string]: string[][];
  };
};

type FileDetailProps = {
  sha256: string;
  sid?: string;
  liveResultKeys?: string[];
  liveErrors?: Error[];
};

const WrappedFileDetail: React.FC<FileDetailProps> = ({
  sha256,
  sid = null,
  liveResultKeys = null,
  liveErrors = null
}) => {
  const { t } = useTranslation(['fileDetail']);
  const [file, setFile] = useState<File | null>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const { apiCall } = useMyAPI();
  const { c12nDef, user: currentUser } = useALContext();
  const theme = useTheme();
  const history = useHistory();
  const { showSuccessMessage } = useMySnackbar();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileName = file ? params.get('name') || sha256 : null;

  const elementInViewport = element => {
    const bounding = element.getBoundingClientRect();
    const myElementHeight = element.offsetHeight;
    const myElementWidth = element.offsetWidth;

    if (
      bounding.top >= -myElementHeight &&
      bounding.left >= -myElementWidth &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth) + myElementWidth &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) + myElementHeight
    ) {
      return true;
    }
    return false;
  };

  const scrollToTop = scrollToItem => {
    const element = document.getElementById(scrollToItem);
    if (element && !elementInViewport(element)) {
      element.scrollIntoView();
    }
  };

  const patchFileDetails = (data: File) => {
    const newData = { ...data };
    newData.results.sort((a, b) => (a.response.service_name > b.response.service_name ? 1 : -1));
    newData.emptys = data.results.filter(result => emptyResult(result));
    newData.results = data.results.filter(result => !emptyResult(result));
    newData.errors = liveErrors ? [...data.errors, ...liveErrors] : data.errors;
    return newData;
  };

  const resubmit = useCallback(() => {
    apiCall({
      url: `/api/v4/submit/dynamic/${sha256}/`,
      onSuccess: api_data => {
        showSuccessMessage(t('resubmit.success'));
        setTimeout(() => {
          history.push(`/submission/detail/${api_data.api_response.sid}`);
        }, 500);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  const prepareSafelist = useCallback(() => {
    setSafelistReason('');
    setSafelistDialog(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  const addToSafelist = useCallback(() => {
    const data = {
      hashes: {
        md5: file.file_info.md5,
        sha1: file.file_info.sha1,
        sha256: file.file_info.sha256
      },
      file: {
        name: [],
        size: file.file_info.size,
        type: file.file_info.type
      },
      sources: [
        {
          classification: file.file_info.classification,
          name: currentUser.username,
          reason: [safelistReason],
          type: 'user'
        }
      ],
      type: 'file'
    };

    if (fileName !== sha256) {
      data.file.name.push(fileName);
    }

    apiCall({
      url: `/api/v4/safelist/`,
      method: 'PUT',
      body: data,
      onSuccess: _ => {
        setSafelistDialog(false);
        showSuccessMessage(t('safelist.success'));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256, safelistReason, file]);

  useEffect(() => {
    setFile(null);

    if (sid && sha256) {
      apiCall({
        method: liveResultKeys ? 'POST' : 'GET',
        url: `/api/v4/submission/${sid}/file/${sha256}/`,
        body: liveResultKeys ? { extra_result_keys: liveResultKeys } : null,
        onSuccess: api_data => {
          scrollToTop('drawerTop');
          setFile(patchFileDetails(api_data.api_response));
        }
      });
    } else if (sha256) {
      apiCall({
        url: `/api/v4/file/result/${sha256}/`,
        onSuccess: api_data => {
          scrollToTop('fileDetailTop');
          setFile(patchFileDetails(api_data.api_response));
        }
      });
    }
    // eslint-disable-next-line
  }, [sha256, sid]);

  return (
    <div id="fileDetailTop" style={{ textAlign: 'left' }}>
      <InputDialog
        open={safelistDialog}
        handleClose={() => setSafelistDialog(false)}
        handleAccept={addToSafelist}
        handleInputChange={event => setSafelistReason(event.target.value)}
        inputValue={safelistReason}
        title={t('safelist.title')}
        cancelText={t('safelist.cancelText')}
        acceptText={t('safelist.acceptText')}
        inputLabel={t('safelist.input')}
        text={t('safelist.text')}
      />
      {useMemo(
        () => (
          <>
            {c12nDef.enforce && (
              <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
                <Classification size="tiny" c12n={file ? file.file_info.classification : null} />
              </div>
            )}
            <div style={{ paddingBottom: sp4 }}>
              <Grid container alignItems="center">
                <Grid item xs>
                  <div>
                    <Typography variant="h4">{t('title')}</Typography>
                    <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
                      {file ? fileName : <Skeleton style={{ width: '10rem' }} />}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm>
                  <div style={{ textAlign: 'right' }}>
                    {file ? (
                      <>
                        <Tooltip title={t('related')}>
                          <IconButton
                            component={Link}
                            to={`/search/submission?query=files.sha256:${file.file_info.sha256} OR results:${file.file_info.sha256}*`}
                          >
                            <AmpStoriesOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('download')}>
                          <IconButton
                            component={MaterialLink}
                            href={`/api/v4/file/download/${file.file_info.sha256}/?${
                              fileName && file.file_info.sha256 !== fileName ? `name=${fileName}&` : ''
                            }${sid ? `sid=${sid}&` : ''}XSRF_TOKEN=${getXSRFCookie()}`}
                          >
                            <GetAppOutlinedIcon color="action" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('file_viewer')}>
                          <IconButton component={Link} to={`/file/viewer/${file.file_info.sha256}`}>
                            <PageviewOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('resubmit_dynamic')}>
                          <IconButton onClick={resubmit}>
                            <RotateLeftOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('safelist')}>
                          <IconButton onClick={prepareSafelist}>
                            <PlaylistAddCheckIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <div style={{ display: 'inline-flex' }}>
                        {[...Array(5)].map((_, i) => (
                          <Skeleton
                            variant="circle"
                            height="2.5rem"
                            width="2.5rem"
                            style={{ margin: theme.spacing(0.5) }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>
            </div>
          </>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [file, fileName, resubmit]
      )}
      <div style={{ paddingBottom: sp2 }}>
        <IdentificationSection fileinfo={file ? file.file_info : null} />
        <FrequencySection fileinfo={file ? file.file_info : null} />
        {(!file || Object.keys(file.metadata).length !== 0) && (
          <MetadataSection metadata={file ? file.metadata : null} />
        )}
        {file && file.childrens && file.childrens.length !== 0 && <ChildrenSection childrens={file.childrens} />}
        {file && file.parents && file.parents.length !== 0 && <ParentSection parents={file.parents} />}
        {(!file || Object.keys(file.heuristics).length !== 0) && (
          <Detection results={file ? file.results : null} heuristics={file ? file.heuristics : null} />
        )}
        {(!file || Object.keys(file.attack_matrix).length !== 0) && (
          <AttackSection attacks={file ? file.attack_matrix : null} />
        )}
        {(!file || Object.keys(file.tags).length !== 0 || file.signatures.length !== 0) && (
          <TagSection signatures={file ? file.signatures : null} tags={file ? file.tags : null} />
        )}
        {(!file || file.results.length !== 0) && (
          <ResultSection results={file ? file.results : null} sid={sid} alternates={file ? file.alternates : null} />
        )}
        {(!file || file.emptys.length !== 0) && <EmptySection emptys={file ? file.emptys : null} sid={sid} />}
        {file && file.errors.length !== 0 && <ErrorSection errors={file.errors} />}
      </div>
    </div>
  );
};

const FileDetail = React.memo(WrappedFileDetail);

export default FileDetail;
