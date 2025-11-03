import { useTheme } from '@mui/material';
import type { SandboxBody as SandboxData, SandboxProcessItem } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import { NetflowTable } from 'components/visual/ResultCard/Sandbox/components/NetflowTable';
import { ProcessGraph } from 'components/visual/ResultCard/Sandbox/components/ProcessGraph';
import { ProcessTable } from 'components/visual/ResultCard/Sandbox/components/ProcessTable';
import { ProcessTimeline } from 'components/visual/ResultCard/Sandbox/components/ProcessTimeline';
import { SignatureTable } from 'components/visual/ResultCard/Sandbox/components/SignatureTable';
import type { ProcessItem } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
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
  const [filterValue, setFilterValue] = useState<SandboxProcessItem | undefined>(undefined);
  const [quantities, setQuantities] = useState<{ processes: number; netflows: number; signatures: number }>({
    processes: null,
    netflows: null,
    signatures: null
  });

  const startTime = useMemo<number | undefined>(() => {
    const time = body?.analysis_metadata?.start_time;
    return time ? new Date(time).getTime() : undefined;
  }, [body]);

  const handleProcessGraphClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ProcessItem) =>
      setFilterValue(prev => (prev && prev.pid === item.pid ? undefined : item)),
    []
  );

  const handleQuantityChange = useCallback(
    (k: string) => (v: number) => setQuantities(q => ({ ...q, [k]: v || 0 })),
    []
  );

  try {
    return !body ? null : (
      <>
        <ProcessTimeline
          body={body}
          processes={body.processes}
          // startTime={body?.analysis_metadata?.start_time}
          // endTime={body?.analysis_metadata?.end_time}
        />

        <ProcessGraph
          body={body}
          processes={body.processes}
          filterValue={filterValue}
          onClick={handleProcessGraphClick}
        />

        <TabContainer
          allowRender
          paper
          selectionFollowsFocus
          value={tab}
          onChange={(e, v) => setTab(v)}
          tabs={{
            ...(body.processes.length && {
              processes: {
                label: <Label label={t('processes')} quantity={quantities.processes} total={body.processes.length} />,
                inner: (
                  <ProcessTable
                    data={body.processes}
                    startTime={startTime}
                    printable={printable}
                    filterValue={filterValue}
                    preventRender={tab !== 'processes'}
                    onQuantityChange={handleQuantityChange('processes')}
                  />
                )
              }
            }),
            ...(body.netflows.length && {
              netflows: {
                label: <Label label={t('netflows')} quantity={quantities.netflows} total={body.netflows.length} />,
                inner: (
                  <NetflowTable
                    data={body.netflows}
                    startTime={startTime}
                    printable={printable}
                    filterValue={filterValue}
                    preventRender={tab !== 'netflows'}
                    onQuantityChange={handleQuantityChange('netflows')}
                  />
                )
              }
            }),
            ...(body.signatures.length && {
              signatures: {
                label: (
                  <Label label={t('signatures')} quantity={quantities.signatures} total={body.signatures.length} />
                ),
                inner: (
                  <SignatureTable
                    data={body.signatures}
                    printable={printable}
                    filterValue={filterValue}
                    preventRender={tab !== 'signatures'}
                    onQuantityChange={handleQuantityChange('signatures')}
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
