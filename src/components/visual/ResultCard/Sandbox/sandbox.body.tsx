import { useTheme } from '@mui/material';
import type { SandboxBody as SandboxData } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import { NetflowTable } from 'components/visual/ResultCard/Sandbox/components/NetflowTable';
import { ProcessGraph } from 'components/visual/ResultCard/Sandbox/components/ProcessGraph';
import { ProcessTable } from 'components/visual/ResultCard/Sandbox/components/ProcessTable';
import { SignatureTable } from 'components/visual/ResultCard/Sandbox/components/SignatureTable';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type LabelProps = {
  label?: string;
  quantity?: number;
  total?: number;
};

const Label = React.memo(({ label, quantity, total }: LabelProps) => {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
      {label}
      {!total ? null : (
        <CustomChip
          label={
            quantity != null && quantity !== total ? (
              <span>
                <span style={{ color: theme.palette.text.primary }}>{quantity}</span>
                <span style={{ color: theme.palette.text.disabled }}>{`/${total}`}</span>
              </span>
            ) : (
              <span style={{ color: theme.palette.text.primary }}>{total}</span>
            )
          }
          size="tiny"
        />
      )}
    </div>
  );
});

export type SandboxBodyProps = {
  body: SandboxData;
  force?: boolean;
  printable?: boolean;
};

export const SandboxBody = React.memo(({ body, printable = false }: SandboxBodyProps) => {
  const { t } = useTranslation('sandboxResult');

  const [tab, setTab] = useState<'processes' | 'netflows' | 'signatures'>('processes');
  const [activeValue, setActiveValue] = useState<SandboxFilter | undefined>(undefined);
  const [filterValue, setFilterValue] = useState<SandboxFilter | undefined>(undefined);
  const [rowCounts, setRowCounts] = useState<{ processes: number; netflows: number; signatures: number }>({
    processes: null,
    netflows: null,
    signatures: null
  });

  const startTime = useMemo<number | undefined>(() => {
    const time = body?.analysis_metadata?.start_time;
    return time ? new Date(time).getTime() : undefined;
  }, [body]);

  const handleRowCountChange = useCallback(
    (k: string) => (v: number) => setRowCounts(q => ({ ...q, [k]: v || 0 })),
    []
  );

  try {
    return !body ? null : (
      <>
        {/* <ProcessTimeline
          body={body}
          processes={body.processes}
          // startTime={body?.analysis_metadata?.start_time}
          // endTime={body?.analysis_metadata?.end_time}
        /> */}

        <ProcessGraph
          body={body}
          activeValue={activeValue}
          filterValue={filterValue}
          onActiveChange={setActiveValue}
          onFilterChange={setFilterValue}
        />

        <TabContainer
          allowRender
          paper
          selectionFollowsFocus
          value={tab}
          onChange={(e, v: 'processes' | 'netflows' | 'signatures') => setTab(v)}
          tabs={{
            ...(body.processes.length && {
              processes: {
                label: <Label label={t('processes')} quantity={rowCounts.processes} total={body.processes.length} />,
                inner: (
                  <ProcessTable
                    body={body}
                    preventRender={tab !== 'processes'}
                    printable={printable}
                    startTime={startTime}
                    activeValue={activeValue}
                    filterValue={filterValue}
                    getRowCount={handleRowCountChange('processes')}
                    onActiveChange={setActiveValue}
                    onFilterChange={setFilterValue}
                  />
                )
              }
            }),
            ...(body.netflows.length && {
              netflows: {
                label: <Label label={t('netflows')} quantity={rowCounts.netflows} total={body.netflows.length} />,
                inner: (
                  <NetflowTable
                    body={body}
                    preventRender={tab !== 'netflows'}
                    printable={printable}
                    startTime={startTime}
                    activeValue={activeValue}
                    filterValue={filterValue}
                    getRowCount={handleRowCountChange('netflows')}
                    onActiveChange={setActiveValue}
                    onFilterChange={setFilterValue}
                  />
                )
              }
            }),
            ...(body.signatures.length && {
              signatures: {
                label: <Label label={t('signatures')} quantity={rowCounts.signatures} total={body.signatures.length} />,
                inner: (
                  <SignatureTable
                    body={body}
                    preventRender={tab !== 'signatures'}
                    printable={printable}
                    activeValue={activeValue}
                    filterValue={filterValue}
                    getRowCount={handleRowCountChange('signatures')}
                    onActiveChange={setActiveValue}
                    onFilterChange={setFilterValue}
                  />
                )
              }
            })
          }}
        />
      </>
    );
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse Sandbox body. The section will be skipped...');
  }

  return null;
});
