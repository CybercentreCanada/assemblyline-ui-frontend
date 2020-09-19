import { Box } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

type SearchProps = {
  index?: string | null;
};

type ParamProps = {
  id: string;
};

function Search({ index }: SearchProps) {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['search']);

  return (
    <PageCenter>
      <Box textAlign="Left">{t(`Search ${index || id || 'all'}`)}</Box>
    </PageCenter>
  );
}

Search.defaultProps = {
  index: null
};

export default Search;
