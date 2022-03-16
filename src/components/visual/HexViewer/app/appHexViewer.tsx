import React from 'react';
// import { AppHookInit, AppStoreInit, StoreProvider } from '..';
import { DispatchProvider, ReducerProvider, StoreProvider, useStore } from '../stores/useNewStore';
import AppHexRoot from './appHexRoot';

export type DataProps = {
  data: string;
};

// export default React.memo(({ data }: DataProps) =>
//   data != null && data.length > 0 ? (
//     <StoreProvider>
//       <AppHookInit>
//         <AppStoreInit data={data} />
//       </AppHookInit>
//     </StoreProvider>
//   ) : null
// );

export const Display = React.memo(() => {
  const { store } = useStore();

  console.log('Display component');
  console.log('');

  return (
    <>
      <h1>{store.count}</h1>
    </>
  );
});

export const Button = React.memo(() => {
  // const { onHoverMouseEnter } = useDispatch();

  console.log('Button component');

  return (
    <>
      <button>increment</button>
    </>
  );
});

export const Container = React.memo(() => {
  const { store } = useStore();

  console.log('Container component');

  return (
    <>
      <ChildContainer store={store} />
    </>
  );
});

export const ChildContainer = React.memo(
  ({ store }: any) => {
    console.log('Child component');

    return (
      <>
        <h2>{store.another}</h2>
      </>
    );
  },
  (prevProps: Readonly<any>, nextProps: Readonly<any>) => prevProps.another === nextProps.another
);

export default React.memo(({ data }: DataProps) => {
  console.log('Hex Viewer');

  return (
    <ReducerProvider>
      <DispatchProvider>
        <StoreProvider>
          <AppHexRoot data={data} />
        </StoreProvider>
      </DispatchProvider>
    </ReducerProvider>
  );
});
