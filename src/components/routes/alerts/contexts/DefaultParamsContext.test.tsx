import { renderHook } from '@testing-library/react';
import { DefaultParamsProvider, useDefaultParams } from './DefaultParamsContext';

const storageKey = 'testing.defaultsearchparameters';

beforeEach(() => {
  localStorage.removeItem(storageKey);
});

afterEach(() => {
  localStorage.removeItem(storageKey);
});

type TestingDefaultSearchParamsProps = {
  value: string;
  defaultValue: string;
  expectedValue: string;
  expectedObject: any;
  format: Record<string, 'boolean' | 'number' | 'string' | 'string[]'>;
  testName?: string;
};

const testingValues = ({
  value,
  defaultValue,
  expectedValue,
  expectedObject,
  format,
  testName = 'Testing Values'
}: TestingDefaultSearchParamsProps) => {
  test(testName, () => {
    localStorage.setItem(storageKey, value);

    const wrapper = ({ children }) => (
      <DefaultParamsProvider defaultValue={defaultValue} format={format} storageKey={storageKey}>
        {children}
      </DefaultParamsProvider>
    );

    const { result } = renderHook(() => useDefaultParams(), { wrapper });

    expect(result.current.defaultParams.toString()).toBe(expectedValue);
    expect(result.current.defaultObj).toStrictEqual(expectedObject);
  });
};

describe('<DefaultSearchParamsProvider />', () => {
  testingValues({
    testName: 'Testing Values',
    value: 'query=*',
    defaultValue: 'query=*',
    expectedValue: 'query=*',
    expectedObject: { query: '*' },
    format: { query: 'string' }
  });

  testingValues({
    testName: 'Testing Values',
    value: 'query=*',
    defaultValue: 'query=*',
    expectedValue: 'query=*',
    expectedObject: { query: '*' },
    format: { query: 'string' }
  });

  testingValues({
    testName: 'Testing Values',
    value: 'query=*',
    defaultValue: 'query=*',
    expectedValue: 'query=*',
    expectedObject: { query: '*' },
    format: { query: 'string' }
  });
});
