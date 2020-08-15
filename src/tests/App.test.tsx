import { render } from '@testing-library/react';
import React from 'react';
import App from '../components/app/app';

test('renders learn react link', () => {
  const { getByText } = render(<App />);

  expect(getByText(/Username/i)).toBeInTheDocument();
});
