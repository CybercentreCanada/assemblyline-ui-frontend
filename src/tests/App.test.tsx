import { render } from '@testing-library/react';
import App from 'components/app/app';
import { expect } from 'vitest';

test('renders learn react link', () => {
  const { getAllByAltText } = render(<App />);

  getAllByAltText(/Assemblyline Banner/i).forEach(element => {
    expect(element).toBeInTheDocument();
  });
});
