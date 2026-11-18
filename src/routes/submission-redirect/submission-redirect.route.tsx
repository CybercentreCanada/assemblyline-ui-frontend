import useALContext from 'core/config/useALContext';
import { memo } from 'react';
import { Navigate, useParams } from 'react-router';

type ParamProps = {
  id: string;
};

export const SubmissionRedirectPage = memo(() => {
  const { id } = useParams<ParamProps>();

  const { settings } = useALContext();

  return settings.submission_view === 'details' ? (
    <Navigate to={`/submission/detail/${id}`} replace />
  ) : (
    <Navigate to={`/submission/report/${id}`} replace />
  );
});
