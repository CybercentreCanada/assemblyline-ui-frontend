import { useAppUser } from 'core/template/components/app/hooks';
import PageCenter from 'core/template/components/pages/PageCenter';
import type { CustomUser } from 'models/api/user';
import { useParams } from 'react-router';
import FileDetail from 'routes/file-detail/file-detail.route';
import ForbiddenPage from 'routes/forbidden/forbidden.route';

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
