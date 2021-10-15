import { Link, makeStyles, Tooltip } from '@material-ui/core';
import PageviewOutlinedIcon from '@material-ui/icons/PageviewOutlined';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

export type ExtractedFiles = {
  classification: string;
  description: string;
  name: string;
  sha256: string;
  is_section_image?: boolean;
};

type ExtractedFileProps = {
  file: ExtractedFiles;
  download?: boolean;
  sid?: string;
};

const useStyles = makeStyles(theme => ({
  muted: {
    color: theme.palette.text.secondary
  }
}));

const WrappedExtractedFile: React.FC<ExtractedFileProps> = ({ file, download = false, sid = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  return (
    <div>
      {download ? (
        <Link href={`/api/v4/file/download/${file.sha256}/?name=${encodeURI(file.name)}`}>{file.name}</Link>
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
      <small className={classes.muted}>{` :: ${file.description}`}</small>
      <Tooltip title={t('view_file')}>
        <Link component={RouterLink} to={`/file/viewer/${file.sha256}`}>
          <PageviewOutlinedIcon style={{ fontSize: '1.4em', marginLeft: '0.5rem', verticalAlign: 'bottom' }} />
        </Link>
      </Tooltip>
    </div>
  );
};

const ExtractedFile = React.memo(WrappedExtractedFile);
export default ExtractedFile;
