import PageCenter from 'commons/components/layout/pages/PageCenter';
import useNavHighlighter from 'components/hooks/useNavHighlighter';
import FileDetail from 'components/visual/FileDetail';
import React from 'react';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

function FileFullDetail() {
  const { id } = useParams<ParamProps>();
  const navHighlighter = useNavHighlighter();

  return (
    <PageCenter>
      <FileDetail sha256={id} navHighlighter={navHighlighter} />
    </PageCenter>
  );
}

export default FileFullDetail;
