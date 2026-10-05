import { useAppUser } from 'deprecated/legacy/commons/components/app/hooks';
import PageCenter from 'deprecated/legacy/commons/components/pages/PageCenter';
import type { CustomUser } from 'models/api/user';
import ForbiddenPage from 'routes/forbidden/forbidden';
import FileDetail from 'routes/file-detail/file-detail.route';
import { useParams } from 'react-router';

type ParamProps = {
  id: string;
};

function FileFullDetail() {
  const { id } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  return currentUser.roles.includes('submission_view') ? (
    <PageCenter margin={4} width="100%">
      <FileDetail sha256={id} />
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}

export default FileFullDetail;
