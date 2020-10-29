import PageCenter from 'commons/components/layout/pages/PageCenter';
import FileDetail from 'components/visual/FileDetail';
import React from 'react';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

function FileFullDetail() {
  const { id } = useParams<ParamProps>();

  return (
    <PageCenter>
      <FileDetail sha256={id} />
    </PageCenter>
  );
}

export default FileFullDetail;
