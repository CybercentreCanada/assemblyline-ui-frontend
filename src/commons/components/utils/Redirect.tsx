import { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';

type Props = {
  from: string;
  to: string;
};

// TODO: Add this to commons
export const Redirect: React.FC<Props> = ({ from = '', to = '' }: Props) => {
  const params = useParams();
  const { pathname } = useLocation();

  useEffect(() => {
    const from1 = from.split('/');
    const to1 = to.split('/');
    const pathname1 = pathname.split('/');

    console.log(from1, to1, pathname1);
  }, [from, pathname, to]);

  // const [{ route }] = matchRoutes(routes, location);
  console.log('navigate', from, to, pathname, params);

  return <Navigate to={to} />;
};

export default Redirect;
