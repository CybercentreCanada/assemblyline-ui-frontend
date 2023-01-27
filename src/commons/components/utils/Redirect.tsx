import { Navigate, useParams } from 'react-router';

type Props = {
  to: string;
};

// TODO: Add this to commons
export const Redirect: React.FC<Props> = ({ to = '' }: Props) => {
  const params = useParams();

  let newTo = to;
  Object.entries(params).forEach(p => {
    newTo = newTo.replace(`/:${p[0]}`, `/${p[1]}`);
  });

  return <Navigate to={newTo} />;
};

export default Redirect;
