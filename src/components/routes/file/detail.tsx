import PageCenter from 'commons/components/layout/pages/PageCenter';
import FileDetail from 'components/visual/FileDetail';
import { useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

function FileFullDetail() {
  const { id } = useParams<ParamProps>();

  return (
    <PageCenter margin={4} width="100%">
      <FileDetail sha256={id} />
    </PageCenter>
  );
}

export default FileFullDetail;
