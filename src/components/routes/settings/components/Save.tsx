import { Button, CircularProgress, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import { useForm } from 'components/routes/settings/contexts/form';
import { RouterPrompt } from 'components/visual/RouterPrompt';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const SaveSettings = () => {
  const { t } = useTranslation(['settings']);
  const theme = useTheme();
  const form = useForm();
  const { configuration } = useALContext();

  const handleSave = useCallback(() => {}, []);

  return (
    <form.Subscribe
      selector={state => [
        state.values.state.loading,
        JSON.stringify(state.values.next) !== JSON.stringify(state.values.prev)
      ]}
      children={([loading, modified]) => (
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
                disabled={loading || !modified}
                onClick={async () => {
                  await form.handleSubmit();
                }}
              >
                {t('save')}
                {loading && (
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
