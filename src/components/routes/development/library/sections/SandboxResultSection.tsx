import type { FileResult } from 'components/models/base/result';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { useForm } from 'components/routes/development/library/contexts/form';
import { SANDBOX_EXAMPLE } from 'components/routes/development/library/sections/sandbox-data';
import ResultCard from 'components/visual/ResultCard';
import React from 'react';

export type SandboxResultLibraryState = {
  sandbox_result: {
    name: string;
    values: {
      example1: FileResult;
    };
  };
};
export const SANDBOX_RESULT_LIBRARY_STATE: SandboxResultLibraryState = {
  sandbox_result: {
    name: 'Sandbox Result',
    values: {
      example1: SANDBOX_EXAMPLE
    }
  }
} as const;

export const SandboxResultSection = React.memo(() => {
  const form = useForm();

  return (
    <DemoContainer>
      <form.Subscribe
        selector={state => state.values.components.sandbox_result.values.example1}
        children={result => (
          <>
            <ResultCard result={result} sid={'Asd'} alternates={null} force={false} />
          </>
        )}
      />
    </DemoContainer>
  );
});
