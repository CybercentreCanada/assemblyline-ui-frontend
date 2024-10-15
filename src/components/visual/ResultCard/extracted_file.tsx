import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { IconButton, Link, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { File } from 'components/models/base/result';
import { DEFAULT_TAB, TAB_OPTIONS } from 'components/routes/file/viewer';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  file: {
    marginRight: theme.spacing(1)
  },
  description: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
    fontSize: 'smaller'
  },
  button: {
    marginTop: '-5px',
    marginBottom: '-5px'
  },
  line: {
    display: 'flex',
    justifyContent: 'space-between',
    minHeight: theme.spacing(3.25)
  },
  text: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    wordBreak: 'break-word'
  }
}));

type Props = {
  file: File;
  download?: boolean;
  sid?: string;
};

const WrappedExtractedFile: React.FC<Props> = ({ file, download = false, sid = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const location = useLocation();

  const fileViewerPath = useMemo<string>(() => {
    const tab = TAB_OPTIONS.find(option => location.pathname.indexOf(option) >= 0);
    if (!location.pathname.startsWith('/file/viewer') || !tab)
      return `/file/viewer/${file?.sha256}/${DEFAULT_TAB}/${location.search}${location.hash}`;
    else return `/file/viewer/${file?.sha256}/${tab}/${location.search}${location.hash}`;
  }, [file?.sha256, location.hash, location.pathname, location.search]);

  return (
    <div className={classes.line}>
      <div className={classes.text}>
        <div className={classes.file}>
          {download ? (
            <Link
              href={`/api/v4/file/download/${file.sha256}/?${sid ? `sid=${sid}&` : ''}name=${encodeURI(file.name)}`}
            >
              {file.name}
            </Link>
          ) : (
            <Link
              component={RouterLink}
              to={
                sid
                  ? `/submission/detail/${sid}/${file.sha256}?name=${encodeURI(file.name)}`
                  : `/file/detail/${file.sha256}?name=${encodeURI(file.name)}`
              }
            >
              {file.name}
            </Link>
          )}
        </div>
        <div className={classes.description}>{file.description}</div>
      </div>
      <div className={classes.button}>
        <Tooltip title={`${t('view_file')}: ${file.name}`} placement="left">
          <IconButton component={RouterLink} to={fileViewerPath} size="small" color="primary">
            <PageviewOutlinedIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

const ExtractedFile = React.memo(WrappedExtractedFile);
export default ExtractedFile;
