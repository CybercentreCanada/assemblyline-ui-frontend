import { Alert, LinearProgress } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import MonacoEditor, { LANGUAGE_SELECTOR } from 'components/visual/MonacoEditor';
import type { editor } from 'monaco-editor';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  sha256: string;
  type?: string;
  options?: editor.IStandaloneEditorConstructionOptions;
  onDataTruncated?: (truncated: boolean) => void;
};

const WrappedStringsSection: React.FC<Props> = ({
  sha256,
  type: propType = null,
  options = null,
  onDataTruncated = () => null
}) => {
  const { t } = useTranslation(['fileViewer']);
  const { apiCall } = useMyAPI();
  const { showErrorMessage, closeSnackbar } = useMySnackbar();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [data, setData] = useState<string>(null);
  const [error, setError] = useState<string>(null);

  const type = useMemo<string>(() => (propType && propType in LANGUAGE_SELECTOR ? propType : 'unknown'), [propType]);

  useEffect(() => {
    if (!sha256 || data) return;
    apiCall<{ content: string; truncated: boolean }>({
      url: `/api/v4/file/strings/${sha256}/`,
      allowCache: true,
      onEnter: () => {
        setData(null);
        setError(null);
        closeSnackbar();
      },
      onSuccess: ({ api_response }) => {
        setData(api_response?.content || '');
        onDataTruncated(api_response?.truncated || false);
        if (api_response?.truncated) showErrorMessage(t('error.truncated'));
      },
      onFailure: api_data => setError(api_data.api_error_message)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sha256]);

  useEffect(() => {
    return () => {
      setData(null);
    };
  }, [sha256]);

  if (!currentUser.roles.includes('file_detail')) return <ForbiddenPage />;
  else if (error) return <Alert severity="error">{error}</Alert>;
  else if (data === null) return <LinearProgress />;
  else
    return (
      <MonacoEditor
        value={data}
        language={LANGUAGE_SELECTOR[type]}
        options={{ links: false, readOnly: true, ...options }}
      />
    );
};

export const StringsSection = React.memo(WrappedStringsSection);
export default StringsSection;
