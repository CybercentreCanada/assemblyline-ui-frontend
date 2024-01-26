import React, { useState } from 'react';

export type HybridReportsContextProps = {
  showHybridReports: boolean;
  toggleShowHybridReports: () => void;
};

export interface ReportProviderProps {
  children: React.ReactNode;
}

export const HybridReportsContext = React.createContext<HybridReportsContextProps>(null);

function ReportProvider(props: ReportProviderProps) {
  const { children } = props;

  // Load Safe Results Default State
  const storedShowSafeResutls = localStorage.getItem('showHybridReports');
  const initialShowSafeResutls = storedShowSafeResutls ? !!JSON.parse(storedShowSafeResutls) : true;

  const [showHybridReports, setShowHybridReports] = useState<boolean>(initialShowSafeResutls);

  const onToggleShowHybridReports = () => {
    localStorage.setItem('showHybridReports', JSON.stringify(!showHybridReports));
    setShowHybridReports(!showHybridReports);
  };

  return (
    <HybridReportsContext.Provider
      value={{
        showHybridReports,
        toggleShowHybridReports: onToggleShowHybridReports
      }}
    >
      {children}
    </HybridReportsContext.Provider>
  );
}

export default ReportProvider;
