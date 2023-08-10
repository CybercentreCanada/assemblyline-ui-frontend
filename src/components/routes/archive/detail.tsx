import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import FileDetail from 'components/visual/FileDetail';
import { useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

type ParamProps = {
  id: string;
};

function ArchiveFullDetail() {
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

export default ArchiveFullDetail;
