import { PublishOutlined } from '@mui/icons-material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { List, ListItemButton, ListItemIcon, ListItemText, Popover, Tooltip, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { File } from 'components/models/base/result';
import type { Submission } from 'components/models/base/submission';
import { DEFAULT_TAB, TAB_OPTIONS } from 'components/routes/file/viewer';
import { IconButton } from 'components/visual/Buttons/IconButton';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

export type ExtractedFileProps = {
  file: File;
  download?: boolean;
  sid?: string;
};

export const ExtractedFile: React.FC<ExtractedFileProps> = React.memo(({ file, download = false, sid = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [submitAnchor, setSubmitAnchor] = useState<HTMLElement | null>(null);

  const submitPopoverOpen = Boolean(submitAnchor);

  const fileViewerPath = useMemo<string>(() => {
    const tab = TAB_OPTIONS.find(option => location.pathname.indexOf(option) >= 0);
    if (!location.pathname.startsWith('/file/viewer') || !tab)
      return `/file/viewer/${file?.sha256}/${DEFAULT_TAB}/${location.search}${location.hash}`;
    else return `/file/viewer/${file?.sha256}/${tab}/${location.search}${location.hash}`;
  }, [file?.sha256, location.hash, location.pathname, location.search]);

  const submissionProfiles = useMemo<Record<string, string>>(() => {
    const profiles = configuration?.submission?.profiles ?? {};
    const map: Record<string, string> = {};
    for (const [name, config] of Object.entries(profiles) as [string, { display_name?: unknown }][]) {
      if (typeof config.display_name === 'string') {
        map[name] = config.display_name;
      }
    }
    return map;
  }, [configuration?.submission?.profiles]);

  const submit = useCallback(
    (submitType: string, isProfile: boolean) => {
      apiCall<Submission>({
        method: isProfile ? 'PUT' : 'GET',
        url: `/api/v4/submit/${submitType}/${file.sha256}/`,
        onSuccess: api_data => {
          showSuccessMessage(t('submit.success'));
          setTimeout(() => {
            navigate(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        }
      });
      setSubmitAnchor(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [file.sha256, t]
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', minHeight: theme.spacing(3.25) }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', wordBreak: 'break-word' }}>
        <div style={{ marginRight: theme.spacing(1) }}>
          {download ? (
            <Link
              to={`/api/v4/file/download/${file.sha256}/?${sid ? `sid=${sid}&` : ''}name=${encodeURIComponent(file.name)}`}
            >
              {file.name}
            </Link>
          ) : (
            <Link
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

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
        {!file || !currentUser.roles.includes('submission_create') ? null : (
          <>
            <IconButton
              size="small"
              color="primary"
              tooltip={`${t('submit_file')}: ${file.name}`}
              preventRender={!file || !currentUser.roles.includes('submission_create')}
              onClick={event => setSubmitAnchor(event.currentTarget)}
              sx={{ padding: 0 }}
            >
              <PublishOutlined />
              {submitPopoverOpen ? (
                <ExpandLessIcon style={{ position: 'absolute', right: -5, bottom: -5, fontSize: 'medium' }} />
              ) : (
                <ExpandMoreIcon style={{ position: 'absolute', right: -5, bottom: -5, fontSize: 'medium' }} />
              )}
            </IconButton>

            <Popover
              open={submitPopoverOpen}
              anchorEl={submitAnchor}
              onClose={() => setSubmitAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <List disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/submit?hash=${file.sha256}&description=${encodeURIComponent(`Inspection of file: ${file.name}`)}`}
                  state={{ c12n: file.classification }}
                  dense
                  onClick={() => setSubmitAnchor(null)}
                >
                  <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                    <TuneOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('submit.modify')} />
                </ListItemButton>
                <ListItemButton dense onClick={() => submit('dynamic', false)}>
                  <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                    <OndemandVideoOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('submit.dynamic')} />
                </ListItemButton>
                {submissionProfiles &&
                  Object.entries(submissionProfiles).map(([name, display]) => (
                    <ListItemButton key={name} dense onClick={() => submit(name, true)}>
                      <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                        <OndemandVideoOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText primary={`${t('submit.with')} "${display}"`} />
                    </ListItemButton>
                  ))}
              </List>
            </Popover>
          </>
        )}

        <Tooltip title={`${t('view_file')}: ${file.name}`} placement="left">
          <IconButton to={fileViewerPath} size="small" color="primary" sx={{ padding: 0 }}>
            <PageviewOutlinedIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
});

ExtractedFile.displayName = 'ExtractedFile';

export default ExtractedFile;
