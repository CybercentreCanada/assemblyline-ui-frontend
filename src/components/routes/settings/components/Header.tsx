import {
  Button,
  CircularProgress,
  FormControlLabel,
  LinearProgress,
  Skeleton,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import type { SettingsStore } from 'components/routes/settings/contexts/form';
import { useForm } from 'components/routes/settings/contexts/form';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

type Props = {
  hidden: boolean;
  loading: boolean;
  profile: SettingsStore['state']['tab'];
};

export const HeaderSection = ({ hidden = false, loading = false, profile = 'interface' }: Props) => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.submitting,
        state.values.state.confirm,
        !_.isEqual(state.values.next, state.values.prev)
      ]}
      children={([submitting, confirm, modified]) => {
        return (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              backgroundColor: theme.palette.background.default
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                columnGap: theme.spacing(2)
              }}
            >
              {!modified ? null : (
                <RouterPrompt
                  when={modified}
                  onAccept={() => {
                    form.setStore(s => {
                      s.next = structuredClone(s.prev);
                      return s;
                    });
                    return true;
                  }}
                />
              )}

              <ConfirmationDialog
                open={confirm}
                handleClose={() => {
                  form.setStore(s => {
                    s.state.confirm = false;
                    return s;
                  });
                }}
                handleAccept={async () => {
                  await form.handleSubmit();
                }}
                title={t('save.title')}
                cancelText={t('save.cancelText')}
                acceptText={t('save.acceptText')}
                text={t('save.text')}
                waiting={submitting}
              />

              <div style={{ flex: 1 }}>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography color="textSecondary" variant="caption">
                  {loading ? <Skeleton style={{ width: '10rem' }} /> : !profile ? null : t(`profile.${profile}`)}
                </Typography>
              </div>

              <FormControlLabel
                control={<Switch checked={hidden} />}
                label={t('hidden')}
                onClick={() => {
                  form.setStore(s => {
                    s.state.hidden = !s.state.hidden;
                    return s;
                  });
                }}
              />

              <Button
                variant="outlined"
                color="primary"
                disabled={submitting || !modified}
                onClick={() => {
                  form.setStore(s => {
                    s.next = structuredClone(s.prev);
                    return s;
                  });
                }}
              >
                {t('reset')}
                {submitting && (
                  <CircularProgress
                    size={24}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: -12,
                      marginLeft: -12
                    }}
                  />
                )}
              </Button>

              <Button
                variant="contained"
                color="primary"
                disabled={submitting || !modified}
                onClick={() => {
                  form.setStore(s => {
                    s.state.confirm = true;
                    return s;
                  });
                }}
              >
                {t('save')}
                {submitting && (
                  <CircularProgress
                    size={24}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: -12,
                      marginLeft: -12
                    }}
                  />
                )}
              </Button>
            </div>
            {!loading ? null : <LinearProgress />}
          </div>
        );
      }}
    />
  );
};
