import React, { useState } from 'react';

export type QuotaContextProps = {
  apiQuotaRemaining: number;
  submissionQuotaRemaining: number;
  setApiQuotaremaining: (quota: number) => void;
  setSubmissionQuotaremaining: (quota: number) => void;
};

export interface QuotaProviderProps {
  children: React.ReactNode;
}

export const QuotaContext = React.createContext<QuotaContextProps>(null);

function QuotaProvider(props: QuotaProviderProps) {
  const { children } = props;

  const [apiQuotaRemaining, setApiQuotaremaining] = useState<number>(null);
  const [submissionQuotaRemaining, setSubmissionQuotaremaining] = useState<number>(null);

  return (
    <QuotaContext.Provider
      value={{
        apiQuotaRemaining,
        submissionQuotaRemaining,
        setApiQuotaremaining,
        setSubmissionQuotaremaining
      }}
    >
      {children}
    </QuotaContext.Provider>
  );
}

export default QuotaProvider;
