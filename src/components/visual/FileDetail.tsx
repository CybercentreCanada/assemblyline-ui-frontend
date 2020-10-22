import {
  Box,
  Divider,
  Grid,
  IconButton,
  Link as MaterialLink,
  makeStyles,
  Tooltip,
  Typography,
  useTheme
} from '@material-ui/core';
import AmpStoriesOutlinedIcon from '@material-ui/icons/AmpStoriesOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import PageviewOutlinedIcon from '@material-ui/icons/PageviewOutlined';
import RotateLeftOutlinedIcon from '@material-ui/icons/RotateLeftOutlined';
import { Skeleton } from '@material-ui/lab';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Attack from 'components/visual/Attack';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import Heuristic from 'components/visual/Heuristic';
import ResultCard, { Result } from 'components/visual/ResultCard';
import Tag from 'components/visual/Tag';
import { BreakableStr } from 'helpers/breakableStr';
import { bytesToSize } from 'helpers/utils';
import getXSRFCookie from 'helpers/xsrf';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useHistory } from 'react-router-dom';

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
  attack_matrix: {
    [category: string]: string[][];
  };
  childrens: {
    name: string;
    sha256: string;
  }[];
  errors: any;
  file_info: FileInfo;
  heuristics: {
    [category: string]: string[][];
  };
  metadata: {
    [level: string]: {
      [key: string]: any;
    };
  };
  results: Result[];
  signatures: string[][];
  tags: {
    [type: string]: string[][];
  };
};

type FileDetailProps = {
  sha256: string;
  sid?: string;
  name?: string;
};

const useStyles = makeStyles(theme => ({
  file_item: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

const FileDetail: React.FC<FileDetailProps> = ({ sha256, sid = null, name = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const [file, setFile] = useState<File | null>(null);
  const apiCall = useMyAPI();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { showSuccessMessage } = useMySnackbar();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  const resubmit = () => {
    apiCall({
      url: `/api/v4/submit/dynamic/${sha256}/`,
      onSuccess: api_data => {
        showSuccessMessage(t('resubmit.success'));
        setTimeout(() => {
          history.push(`/submission/detail/${api_data.api_response.sid}`);
        }, 500);
      }
    });
  };

  useEffect(() => {
    if (sid && sha256) {
      apiCall({
        url: `/api/v4/submission/${sid}/file/${sha256}/`,
        onSuccess: api_data => {
          setFile(api_data.api_response);
        }
      });
    } else if (sha256) {
      apiCall({
        url: `/api/v4/file/result/${sha256}/`,
        onSuccess: api_data => {
          setFile(api_data.api_response);
        }
      });
    } else {
      setFile(null);
    }
    // eslint-disable-next-line
  }, [sha256, sid]);

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
        <Classification size="tiny" c12n={file ? file.file_info.classification : null} />
      </div>
      <div style={{ paddingBottom: sp4 }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <div>
              <Typography variant="h4">{t('title')}</Typography>
              <Typography variant="caption">
                {file ? new BreakableStr(name || file.file_info.sha256) : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm>
            <div style={{ textAlign: 'right' }}>
              <Tooltip title={t('related')}>
                <IconButton
                  component={Link}
                  to={`/search/submission?q=files.sha256:${file && file.file_info.sha256} OR results:${
                    file && file.file_info.sha256
                  }*`}
                >
                  <AmpStoriesOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('download')}>
                <IconButton
                  component={MaterialLink}
                  href={`/api/v4/file/download/${file && file.file_info.sha256}/?XSRF_TOKEN=${getXSRFCookie()}`}
                >
                  <GetAppOutlinedIcon color="action" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('file_viewer')}>
                <IconButton component={Link} to={`/file/viewer/${file && file.file_info.sha256}`}>
                  <PageviewOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('resubmit_dynamic')}>
                <IconButton onClick={resubmit}>
                  <RotateLeftOutlinedIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Grid>
        </Grid>
      </div>

      <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
        <Typography variant="h6">{t('identification')}</Typography>
        <Divider />
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Grid container>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>MD5</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontSize: '110%', fontFamily: 'monospace' }}>
              {file ? new BreakableStr(file.file_info.md5) : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>SHA1</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontSize: '110%', fontFamily: 'monospace' }}>
              {file ? new BreakableStr(file.file_info.sha1) : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>SHA256</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontSize: '110%', fontFamily: 'monospace' }}>
              {file ? new BreakableStr(file.file_info.sha256) : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>SSDEEP</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10} style={{ fontSize: '110%', fontFamily: 'monospace' }}>
              {file ? new BreakableStr(file.file_info.ssdeep) : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('size')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? (
                <span>
                  {file.file_info.size}
                  <span style={{ fontWeight: 300 }}> ({bytesToSize(file.file_info.size)})</span>
                </span>
              ) : (
                <Skeleton />
              )}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('mime')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? new BreakableStr(file.file_info.mime) : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('magic')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? new BreakableStr(file.file_info.magic) : <Skeleton />}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('entropy')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? file.file_info.entropy : <Skeleton />}
            </Grid>
          </Grid>
        </div>
      </div>

      <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
        <Typography variant="h6">{t('frequency')}</Typography>
        <Divider />
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Grid container>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('seen.first')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? (
                <div>
                  <Moment fromNow>{file.file_info.seen.first}</Moment> (
                  <Moment format="YYYY-MM-DD HH:mm:ss">{file.file_info.seen.first}</Moment>)
                </div>
              ) : (
                <Skeleton />
              )}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('seen.last')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? (
                <div>
                  <Moment fromNow>{file.file_info.seen.last}</Moment> (
                  <Moment format="YYYY-MM-DD HH:mm:ss">{file.file_info.seen.last}</Moment>)
                </div>
              ) : (
                <Skeleton />
              )}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('seen.count')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {file ? file.file_info.seen.count : <Skeleton />}
            </Grid>
          </Grid>
        </div>
      </div>

      {(!file || Object.keys(file.metadata).length !== 0) && (
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('metadata')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {file
              ? Object.keys(file.metadata).map((meta, i) => {
                  return (
                    <Grid container key={i}>
                      <Grid item xs={12} sm={3} lg={2}>
                        <span style={{ fontWeight: 500 }}>{new BreakableStr(meta)}</span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10}>
                        {Object.keys(file.metadata[meta]).map((item, key) => {
                          return <CustomChip size="tiny" key={key} label={`${file.metadata[meta][item]}x ${item}`} />;
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

      {file && file.childrens && file.childrens.length !== 0 && (
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('childrens')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {file.childrens.map((fileItem, i) => {
              return (
                <Box
                  key={i}
                  className={classes.file_item}
                  onClick={() => {
                    history.push(`/file/detail/${fileItem.sha256}`);
                  }}
                >
                  <span>{new BreakableStr(fileItem.name)}</span>
                  <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>
                    {new BreakableStr(` :: ${fileItem.sha256}`)}
                  </span>
                </Box>
              );
            })}
          </div>
        </div>
      )}

      {(!file || Object.keys(file.attack_matrix).length !== 0) && (
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('attack_matrix')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {file
              ? Object.keys(file.attack_matrix).map((cat, i) => {
                  return (
                    <Grid container key={i}>
                      <Grid item xs={12} sm={3} lg={2}>
                        <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10}>
                        {file.attack_matrix[cat].map(([cid, mat, lvl], idx) => {
                          return <Attack key={`${cid}_${idx}`} text={mat} lvl={lvl} />;
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

      {(!file || Object.keys(file.heuristics).length !== 0) && (
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('heuristics')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {file
              ? Object.keys(file.heuristics).map((lvl, i) => {
                  return (
                    <Grid container key={i}>
                      <Grid item xs={12} sm={3} lg={2}>
                        <span style={{ fontWeight: 500 }}>{new BreakableStr(t(`verdict.${lvl}`))}</span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10}>
                        {file.heuristics[lvl].map(([cid, hname], idx) => {
                          return <Heuristic key={`${cid}_${idx}`} text={hname} lvl={lvl} />;
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

      {(!file || Object.keys(file.tags).length !== 0 || file.signatures.length !== 0) && (
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('generated_tags')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {file && file.signatures.length !== 0 && (
              <Grid container>
                <Grid item xs={12} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>heuristic.signature</span>
                </Grid>
                <Grid item xs={12} sm={9} lg={10}>
                  {file.signatures.map(([value, lvl], idx) => {
                    return <Heuristic key={idx} signature text={value} lvl={lvl} />;
                  })}
                </Grid>
              </Grid>
            )}
            {file
              ? Object.keys(file.tags).map((tag_type, i) => {
                  return (
                    <Grid container key={i}>
                      <Grid item xs={12} sm={3} lg={2}>
                        <span style={{ fontWeight: 500 }}>{tag_type}</span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10}>
                        {file.tags[tag_type].map(([value, lvl], idx) => {
                          return <Tag key={idx} value={value} type={tag_type} lvl={lvl} />;
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

      {(!file || file.results.length !== 0) && (
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('results')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {file
              ? file.results.map((result, i) => {
                  return <ResultCard key={i} result={result} />;
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
    </div>
  );
};

export default FileDetail;
