import useAppUser from 'commons/components/hooks/useAppUser';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { ClassificationDefinition } from 'helpers/classificationParser';
import React, { useEffect, useState } from 'react';

type ALField = {
  name: string;
  indexed: boolean;
  stored: boolean;
  type: string;
  default: boolean;
  list: boolean;
};

type IndexDefinition = {
  [propName: string]: ALField;
};

type IndexDefinitionMap = {
  alert: IndexDefinition;
  file: IndexDefinition;
  heuristic: IndexDefinition;
  result: IndexDefinition;
  signature: IndexDefinition;
  submission: IndexDefinition;
  workflow: IndexDefinition;
};

export type ALAppContextProps = {
  classification: ClassificationDefinition;
  index: IndexDefinitionMap;
};

export interface ALContextProps {}

export interface ALContextProviderProps extends ALContextProps {
  children: React.ReactNode;
}

export const ALAppContext = React.createContext<ALAppContextProps>(null);

function ALContextProvider({ children }: ALContextProviderProps) {
  const [classificationDefinition, setClassificationDefinition] = useState(null);
  const [indexDefinition, setIndexDefinition] = useState(null);

  const { user, isReady } = useAppUser<CustomUser>();
  const apiCall = useMyAPI();

  useEffect(() => {
    if (isReady()) {
      apiCall({
        url: '/api/v4/help/classification_definition/',
        onSuccess: api_data => {
          setClassificationDefinition(api_data.api_response);
        }
      });

      apiCall({
        url: '/api/v4/search/fields/ALL/',
        onSuccess: api_data => {
          setIndexDefinition(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line
  }, [user]);

  return (
    <ALAppContext.Provider value={{ classification: classificationDefinition, index: indexDefinition }}>
      {children}
    </ALAppContext.Provider>
  );
}

export default ALContextProvider;
