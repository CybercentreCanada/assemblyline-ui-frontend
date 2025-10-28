import { useTheme } from '@mui/material';
import type { SandboxBody as SandboxData, SandboxProcessItem } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import { NetflowTable } from 'components/visual/ResultCard/Sandbox/components/NetflowTable';
import type { ProcessItem } from 'components/visual/ResultCard/Sandbox/components/ProcessGraph';
import { ProcessGraph } from 'components/visual/ResultCard/Sandbox/components/ProcessGraph';
import { ProcessTable } from 'components/visual/ResultCard/Sandbox/components/ProcessTable';
import { SignatureTable } from 'components/visual/ResultCard/Sandbox/components/SignatureTable';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type SandboxBodyProps = {
  body: SandboxData;
  force?: boolean;
  printable?: boolean;
};

export const SandboxBody = React.memo(({ body, force = false, printable = false }: SandboxBodyProps) => {
  const theme = useTheme();
  const { t } = useTranslation('sandboxResult');

  const [filterValue, setFilterValue] = useState<SandboxProcessItem | undefined>(undefined);

  const startTime = useMemo<number | undefined>(() => {
    const time = body?.analysis_metadata?.start_time;
    return time ? new Date(time).getTime() : undefined;
  }, [body]);

  const handleProcessGraphClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ProcessItem) =>
      setFilterValue(prev => (prev && prev.pid === item.pid ? undefined : item)),
    []
  );

  if (!body) return null;
  return (
    <>
      <ProcessGraph
        body={body}
        processes={body.processes}
        filterValue={filterValue}
        onClick={handleProcessGraphClick}
      />

      <TabContainer
        paper
        selectionFollowsFocus
        tabs={{
          ...(body.processes.length && {
            process: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.process')}
                  <CustomChip label={body.processes.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: (
                <ProcessTable
                  data={body.processes}
                  startTime={startTime}
                  printable={printable}
                  filterValue={filterValue}
                />
              )
            }
          }),
          ...(body.netflows.length && {
            netflow: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.netflow')}
                  <CustomChip label={body.netflows.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: <NetflowTable data={body.netflows} startTime={startTime} printable={printable} />
            }
          }),
          ...(body.signatures.length && {
            signature: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.signature')}
                  <CustomChip label={body.signatures.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: (
                <SignatureTable
                  data={body.signatures}
                  heuristics={body.heuristics}
                  printable={printable}
                  filterValue={filterValue}
                />
              )
            }
          })
        }}
      />
    </>
  );
});
