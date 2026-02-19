import { useLocation } from 'react-router';
import { Routes } from './Routes';

export const Router = () => {
  const location = useLocation();

  console.log(location);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '16px', height: '50vh' }}>
      <div style={{ border: '1px solid grey' }}>
        <Routes location={location.pathname} />
      </div>
      <div style={{ border: '1px solid grey' }}>
        <Routes location={location.hash.slice(1)} />
      </div>
      {/* {Array.from({ length: 3 }).map((_, i) => (
        <div style={{ border: '1px solid grey' }}>
          <Routes key={i} location={'/page2/asd'} />
        </div>
      ))} */}
    </div>
  );
};
