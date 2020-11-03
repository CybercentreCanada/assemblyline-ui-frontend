import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

function FileViewer() {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['fileViewer']);

  return (
    <PageCenter>
      <div style={{ textAlign: 'left' }}>{t(`File Viewer ${id}`)}</div>
    </PageCenter>
  );
}

export default FileViewer;
