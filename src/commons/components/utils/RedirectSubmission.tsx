import useALContext from 'components/hooks/useALContext';
import React from 'react';
import { Navigate, useParams } from 'react-router';

type ParamProps = {
  id: string;
};

export const RedirectSubmission: React.FC = () => {
  const { id } = useParams<ParamProps>();

  const { settings } = useALContext();

  return settings.submission_view === 'details' ? (
    <Navigate to={`/submission/detail/${id}`} replace />
  ) : (
    <Navigate to={`/submission/report/${id}`} replace />
  );
};

export default RedirectSubmission;
