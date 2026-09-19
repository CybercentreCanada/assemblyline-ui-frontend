import { PublishOutlined } from '@mui/icons-material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  Popover,
  Tooltip,
  useTheme
} from '@mui/material';
import { AppLink, useAppNavigate } from 'core/router';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { File } from 'models/base/result';
import type { Submission } from 'models/base/submission';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

export type ExtractedFileProps = {
  file: File;
  download?: boolean;
  sid?: string;
};

export const ExtractedFile: React.FC<ExtractedFileProps> = React.memo(({ file, download = false, sid = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const navigate = useAppNavigate();
  const { apiCall } = useMyAPI();
  const { configuration } = useALContext();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [submitAnchor, setSubmitAnchor] = useState<HTMLElement | null>(null);

  const submitPopoverOpen = Boolean(submitAnchor);

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
            navigate.to().create({ route: '/submission/detail/:id', path: { id: api_data.api_response.sid } });
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
            <MuiLink
              href={`/api/v4/file/download/${file.sha256}/?${sid ? `sid=${sid}&` : ''}name=${encodeURIComponent(file.name)}`}
            >
              {file.name}
            </MuiLink>
          ) : (
            <AppLink
              nav={nav =>
                nav.to().create({ route: '/file/detail/:id', path: { id: file.sha256 }, search: { name: file.name } })
              }
              navDeps={[file.sha256, file.name]}
            >
              {file.name}
            </AppLink>
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
                  component={AppLink}
                  nav={nav =>
                    nav.to().create({
                      route: '/submit',
                      search: {
                        hash: file.sha256,
                        description: `Inspection of file: ${file.name}`,
                        classification: file.classification
                      }
                    })
                  }
                  navDeps={[file.sha256, file.name, file.classification]}
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
          <IconButton
            nav={nav =>
              nav.to<'/file/viewer/:id/:tab'>().create(prev => ({
                route: '/file/viewer/:id/:tab',
                path: { id: file?.sha256, tab: prev.route === '/file/viewer/:id/:tab' ? prev.path.tab : null }
              }))
            }
            navDeps={[file?.sha256]}
            size="small"
            color="primary"
            sx={{ padding: 0 }}
          >
            <PageviewOutlinedIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
});

ExtractedFile.displayName = 'ExtractedFile';

export default ExtractedFile;
