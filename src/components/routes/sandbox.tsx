import PageCenter from 'commons/components/pages/PageCenter';
import { useAPIQuery } from 'components/core/Query/API/useAPIQuery';
import type { ResultOntology } from 'components/models/ontology/ontology';
import { SandboxBody } from 'components/visual/ResultCard/sandbox_body';
import React, { useMemo } from 'react';
import { useParams } from 'react-router';

type ParamProps = {
  id: string;
};

export const Sandbox = React.memo(() => {
  const { id } = useParams<ParamProps>();

  const file = useAPIQuery<{ content: string; truncated: boolean }>({
    url: `/api/v4/file/ascii/${id}/`
  });

  const ontology = useMemo(() => (!file?.data ? null : JSON.parse(file.data.content)) as ResultOntology, [file.data]);

  return !ontology ? null : (
    <PageCenter margin={4} width="100%">
      <div style={{ textAlign: 'left' }}>
        <SandboxBody body={ontology.results} />
      </div>
    </PageCenter>
  );
});

export default Sandbox;
