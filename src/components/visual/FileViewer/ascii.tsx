import { Alert, LinearProgress } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React, { useEffect, useMemo, useState } from 'react';
import MonacoEditor, { LANGUAGE_SELECTOR } from '../MonacoEditor';

type Props = {
  sha256: string;
  type?: string;
};

const WrappedASCIISection: React.FC<Props> = ({ sha256, type: propType = null }) => {
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [data, setData] = useState<string>(null);
  const [error, setError] = useState<string>(null);

  const type = useMemo<string>(() => (propType && propType in LANGUAGE_SELECTOR ? propType : 'unknown'), [propType]);

  useEffect(() => {
    if (!sha256 || data) return;
    apiCall({
      url: `/api/v4/file/ascii/${sha256}/`,
      allowCache: true,
      onEnter: () => {
        setData(null);
        setError(null);
      },
      onSuccess: api_data => setData(api_data.api_response),
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
  else if (!data) return <LinearProgress />;
  else
    return (
      <MonacoEditor
        value={data}
        language={LANGUAGE_SELECTOR[type]}
        options={{ links: false, readOnly: true, beautify: true }}
      />
    );
};

export const ASCIISection = React.memo(WrappedASCIISection);
export default ASCIISection;
