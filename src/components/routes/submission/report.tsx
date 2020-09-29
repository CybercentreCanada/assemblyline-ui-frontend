import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

export default function SubmissionReport() {
  const { t } = useTranslation(['submissionReport']);
  const { id } = useParams<ParamProps>();

  return (
    <PageCenter>
      <Box textAlign="left">{`${t('Submission Report')}: ${id}`}</Box>
    </PageCenter>
  );
}
