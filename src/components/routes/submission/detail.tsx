import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

export default function SubmissionDetail() {
  const { t } = useTranslation(['submissionDetail']);
  const { id } = useParams<ParamProps>();

  return (
    <PageCenter>
      <Box textAlign="left">{`${t('Submission Detail')}: ${id}`}</Box>
    </PageCenter>
  );
}
