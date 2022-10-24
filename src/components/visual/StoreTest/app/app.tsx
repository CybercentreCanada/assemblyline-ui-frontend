import React from 'react';
import { useDispatch, useStore } from './root';

type Props = {
  children?: React.ReactNode;
};

export const WrappedApp = ({ children }: Props) => {
  const { dispatch } = useDispatch();
  const { store } = useStore();

  const timer1 = React.useRef(null);
  const timer2 = React.useRef(null);

  React.useLayoutEffect(() => {
    timer1.current = setInterval(() => {
      dispatch.increase(1);
    }, 1000);

    return () => {
      clearInterval(timer1.current);
    };
  }, [dispatch]);

  React.useLayoutEffect(() => {
    timer2.current = setInterval(() => {
      dispatch.decrease(3);
    }, 3000);

    return () => {
      clearInterval(timer2.current);
    };
  }, [dispatch]);

  return <h1>{store.value}</h1>;
};

export const App = React.memo(WrappedApp);
export default App;
