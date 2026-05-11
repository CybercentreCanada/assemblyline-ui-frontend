import { useTheme } from '@mui/material';
import type { SandboxBody as SandboxData } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import { NetflowTable } from 'components/visual/ResultCard/Sandbox/components/NetflowTable';
import { ProcessGraph } from 'components/visual/ResultCard/Sandbox/components/ProcessGraph';
import { ProcessTable } from 'components/visual/ResultCard/Sandbox/components/ProcessTable';
import { SignatureTable } from 'components/visual/ResultCard/Sandbox/components/SignatureTable';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import { TabContainer } from 'components/visual/TabContainer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type LabelProps = {
  label?: string;
  quantity?: number | null;
  total?: number;
};

const Label = React.memo(({ label, quantity, total }: LabelProps) => {
  const theme = useTheme();

  if (!label) return null;

  const showCount = total && total > 0;
  const hasPartial = quantity != null && quantity !== total;

  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
      {label}
      {showCount && (
        <CustomChip
          size="tiny"
          label={
            hasPartial ? (
              <>
                <span style={{ color: theme.palette.text.primary }}>{quantity}</span>
                <span style={{ color: theme.palette.text.disabled }}>{`/${total}`}</span>
              </>
            ) : (
              <span style={{ color: theme.palette.text.primary }}>{total}</span>
            )
          }
          sx={{ backgroundColor: theme.palette.action.selected }}
        />
      )}
    </div>
  );
});

type TabKey = 'processes' | 'netflows' | 'signatures';

type RowCounts = Record<TabKey, number>;

export type SandboxBodyProps = {
  body: SandboxData;
  force?: boolean;
  printable?: boolean;
};

export const SandboxBody = React.memo(({ body, printable = false }: SandboxBodyProps) => {
  const { t } = useTranslation('sandboxResult');

  const [tab, setTab] = useState<TabKey | undefined>();
  const [filterValue, setFilterValue] = useState<SandboxFilter>();
  const [rowCounts, setRowCounts] = useState<RowCounts>({ processes: 0, netflows: 0, signatures: 0 });

  const startTime = useMemo(() => {
    const time = body?.analysis_information?.analysis_metadata?.start_time;
    return time ? new Date(time).getTime() : undefined;
  }, [body]);

  const handleRowCountChange = useCallback(
    (key: TabKey) => (count: number) => setRowCounts(prev => ({ ...prev, [key]: count || 0 })),
    []
  );

  const availableTabs = useMemo(() => {
    const tabs: TabKey[] = [];

    if (body.processes.length) tabs.push('processes');
    if (body.network_connections.length) tabs.push('netflows');
    if (body.signatures.length) tabs.push('signatures');

    return tabs;
  }, [body]);

  useEffect(() => {
    setTab(availableTabs[0]);
  }, [availableTabs]);

  if (!body || !tab) return null;

  try {
    return (
      <>
        {/* <ProcessTimeline
          body={body}
          processes={body.processes}
          // startTime={body?.analysis_metadata?.start_time}
          // endTime={body?.analysis_metadata?.end_time}
        /> */}

        <ProcessGraph body={body} activeValue={filterValue} onActiveChange={setFilterValue} />

        <TabContainer
          allowRender
          paper
          selectionFollowsFocus
          value={tab}
          onChange={(_, v: TabKey) => setTab(v)}
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
                    filterValue={filterValue}
                    getRowCount={handleRowCountChange('processes')}
                  />
                )
              }
            }),
            ...(body.network_connections.length && {
              netflows: {
                label: (
                  <Label label={t('netflows')} quantity={rowCounts.netflows} total={body.network_connections.length} />
                ),
                inner: (
                  <NetflowTable
                    body={body}
                    preventRender={tab !== 'netflows'}
                    printable={printable}
                    startTime={startTime}
                    filterValue={filterValue}
                    getRowCount={handleRowCountChange('netflows')}
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
                    filterValue={filterValue}
                    getRowCount={handleRowCountChange('signatures')}
                  />
                )
              }
            })
          }}
        />
      </>
    );
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse Sandbox body. The section will be skipped...');
  }

  return null;
});
