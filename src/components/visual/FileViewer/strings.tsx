import { Alert, LinearProgress } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import MonacoEditor, { LANGUAGE_SELECTOR } from '../MonacoEditor';
import SimpleSearchQuery from '../SearchBar/simple-search-query';

const DIFF_QUERY = 'diff';

type Props = {
  sha256: string;
  type?: string;
};

const WrappedStringsSection: React.FC<Props> = ({ sha256, type: propType = null }) => {
  const location = useLocation();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [data, setData] = useState<string>(null);
  const [error, setError] = useState<string>(null);
  const [diffData, setDiffData] = useState<string>(null);

  const type = useMemo<string>(() => (propType && propType in LANGUAGE_SELECTOR ? propType : 'unknown'), [propType]);
  const diffSha256 = useMemo<string>(() => {
    const query = new SimpleSearchQuery(location.search);
    return query.has(DIFF_QUERY) ? query.get(DIFF_QUERY) : null;
  }, [location.search]);

  useEffect(() => {
    if (!sha256 || data) return;
    apiCall({
      url: `/api/v4/file/strings/${sha256}/`,
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
    if (!diffSha256) return;
    apiCall({
      url: `/api/v4/file/strings/${diffSha256}/`,
      allowCache: true,
      onEnter: () => setDiffData(null),
      onSuccess: api_data => setDiffData(api_data.api_response),
      onFailure: api_data => setError(api_data.api_error_message)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sha256]);

  useEffect(() => {
    return () => {
      setData(null);
      setDiffData(null);
    };
  }, [sha256]);

  if (!currentUser.roles.includes('file_detail')) return <ForbiddenPage />;
  else if (error) return <Alert severity="error">{error}</Alert>;
  else if (!data) return <LinearProgress />;
  else
    return (
      <MonacoEditor
        diff={!!diffSha256}
        value={!diffSha256 ? data : null}
        modified={diffSha256 ? data : null}
        original={diffSha256 ? diffData : null}
        language={LANGUAGE_SELECTOR[type]}
        options={{ links: false, readOnly: true }}
      />
    );
};

export const StringsSection = React.memo(WrappedStringsSection);
export default StringsSection;