import useALContext from 'components/hooks/useALContext';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUserContextProps } from 'components/hooks/useMyUser';
import ConfirmationDialog from 'components/visual/ConfirmationDialog';
import 'moment-timezone';
import 'moment/locale/fr';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, SystemMessageEditDialog, useNotificationDispatch } from '..';

type Props = {
  store: Store;
  alContext: CustomUserContextProps;
};

const WrappedSystemMessageMain: React.FC<Props> = ({ store, alContext }: Props) => {
  const { t } = useTranslation(['notification']);
  const { showSuccessMessage } = useMySnackbar();
  const { setSystemMessage } = useALContext();

  const { setStoreRef, dispatchAsync } = useNotificationDispatch();

  return (
    <>
      <SystemMessageEditDialog store={store} alContext={alContext} />
      <ConfirmationDialog
        open={store.open.saveConfirmation}
        handleClose={() => setStoreRef.current(s => ({ ...s, open: { ...s.open, saveConfirmation: false } }))}
        handleAccept={() =>
          dispatchAsync.saveSystemMessage(store).then(s => {
            showSuccessMessage(t('save.success'));
            setSystemMessage({ ...s.systemMessage });
          })
        }
        title={t('save.title')}
        cancelText={t('save.cancelText')}
        acceptText={t('save.acceptText')}
        text={t('save.text')}
      />
      <ConfirmationDialog
        open={store.open.deleteConfirmation}
        handleClose={() => setStoreRef.current(s => ({ ...s, open: { ...s.open, deleteConfirmation: false } }))}
        handleAccept={() =>
          dispatchAsync.deleteSystemMessage(store).then(s => {
            showSuccessMessage(t('delete.success'));
            setSystemMessage(null);
          })
        }
        title={t('delete.title')}
        cancelText={t('delete.cancelText')}
        acceptText={t('delete.acceptText')}
        text={t('delete.text')}
      />
    </>
  );
};

export const SystemMessageMain = React.memo(WrappedSystemMessageMain);
export default SystemMessageMain;
