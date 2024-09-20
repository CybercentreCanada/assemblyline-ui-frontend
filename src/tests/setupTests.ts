import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

/**
 * tell React Testing Library to look for id as the testId.
 */
configure({ testIdAttribute: 'id' });

/**
 * Mock createObjectURL as it isn't a real function from the test stand-point.
 */
global.URL.createObjectURL = vi.fn();
