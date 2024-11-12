import { Button, CircularProgress, useTheme } from '@mui/material';
import { useForm } from 'components/routes/settings/contexts/form';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { useTranslation } from 'react-i18next';

export const SaveSettings = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        state.values.state.submitting,
        JSON.stringify(state.values.next) !== JSON.stringify(state.values.prev)
      ]}
      children={([loading, submitting, modified]) => (
        <>
          <RouterPrompt when={modified} />
          {!loading && modified && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: theme.zIndex.drawer - 1,
                backgroundColor: theme.palette.background.default,
                boxShadow: theme.shadows[4]
              }}
            >
              <Button
                variant="contained"
                color="primary"
                disabled={submitting || !modified}
                onClick={async () => {
                  await form.handleSubmit();
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
          )}
        </>
      )}
    />
  );
};
