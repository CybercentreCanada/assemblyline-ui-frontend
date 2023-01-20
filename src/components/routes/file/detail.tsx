import PageCenter from 'commons_deprecated/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import FileDetail from 'components/visual/FileDetail';
import { useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

type ParamProps = {
  id: string;
};

function FileFullDetail() {
  const { id } = useParams<ParamProps>();
  const { user: currentUser } = useALContext();

  return currentUser.roles.includes('submission_view') ? (
    <PageCenter margin={4} width="100%">
      <FileDetail sha256={id} />
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}

export default FileFullDetail;
