import React, { useState } from 'react';

export type SafeResultsContextProps = {
  showSafeResults: boolean;
  toggleShowSafeResults: () => void;
};

export interface SafeResultsProviderProps {
  children: React.ReactNode;
}

export const SafeResultsContext = React.createContext<SafeResultsContextProps>(null);

function SafeResultsProvider(props: SafeResultsProviderProps) {
  const { children } = props;

  // Load Safe Results Default State
  const storedShowSafeResutls = localStorage.getItem('showSafeResults');
  const initialShowSafeResutls = storedShowSafeResutls ? !!JSON.parse(storedShowSafeResutls) : true;

  const [showSafeResults, setShowSafeResults] = useState<boolean>(initialShowSafeResutls);

  const onToggleShowSafeResults = () => {
    localStorage.setItem('showSafeResults', JSON.stringify(!showSafeResults));
    setShowSafeResults(!showSafeResults);
  };

  return (
    <SafeResultsContext.Provider
      value={{
        showSafeResults,
        toggleShowSafeResults: onToggleShowSafeResults
      }}
    >
      {children}
    </SafeResultsContext.Provider>
  );
}

export default SafeResultsProvider;
