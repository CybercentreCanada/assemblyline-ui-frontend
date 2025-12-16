import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { IconButton, Link, Tooltip, useTheme } from '@mui/material';
import type { File } from 'components/models/base/result';
import { DEFAULT_TAB, TAB_OPTIONS } from 'components/routes/file/viewer';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  file: File;
  download?: boolean;
  sid?: string;
};

const WrappedExtractedFile: React.FC<Props> = ({ file, download = false, sid = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const location = useLocation();

  const fileViewerPath = useMemo<string>(() => {
    const tab = TAB_OPTIONS.find(option => location.pathname.indexOf(option) >= 0);
    if (!location.pathname.startsWith('/file/viewer') || !tab)
      return `/file/viewer/${file?.sha256}/${DEFAULT_TAB}/${location.search}${location.hash}`;
    else return `/file/viewer/${file?.sha256}/${tab}/${location.search}${location.hash}`;
  }, [file?.sha256, location.hash, location.pathname, location.search]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', minHeight: theme.spacing(3.25) }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', wordBreak: 'break-word' }}>
        <div style={{ marginRight: theme.spacing(1) }}>
          {download ? (
            <Link
              href={`/api/v4/file/download/${file.sha256}/?${sid ? `sid=${sid}&` : ''}name=${encodeURIComponent(file.name)}`}
            >
              {file.name}
            </Link>
          ) : (
            <Link
              component={RouterLink}
              to={
                sid
                  ? `/submission/detail/${sid}/${file.sha256}?name=${encodeURIComponent(file.name)}`
                  : `/file/detail/${file.sha256}?name=${encodeURIComponent(file.name)}`
              }
            >
              {file.name}
            </Link>
          )}
        </div>
        <div style={{ color: theme.palette.text.secondary, marginRight: theme.spacing(1), fontSize: 'smaller' }}>
          {file.description}
        </div>
      </div>
      <div style={{ marginTop: '-5px', marginBottom: '-5px' }}>
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
