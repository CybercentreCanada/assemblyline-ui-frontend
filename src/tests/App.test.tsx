import React from 'react';
import { render } from '@testing-library/react';
// import { Provider } from 'react-redux';
import App from '../components/app/app';
// import { store } from './app/store';
// import App from './App';

test('renders learn react link', () => {
  const { getByText } = render(
    // <Provider store={store}>
      <App name="Assemblyline" />
    // </Provider>
  );

  expect(getByText(/learn/i)).toBeInTheDocument();
});
