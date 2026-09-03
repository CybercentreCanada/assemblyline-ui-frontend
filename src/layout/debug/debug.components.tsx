import { List, ListItemButton, ListItemText, ListSubheader, useTheme } from '@mui/material';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import type { AppDebugStoreName, AppDebugStoreSnapshot } from 'layout/debug';
import { APP_DEBUG_STORE_NAMES, formatAppDebugTimestamp, useAppDebugStoreHistory } from 'layout/debug';
import { memo, useCallback, useMemo } from 'react';
import { MonacoEditor } from 'ui/MonacoEditor';

const EMPTY_SNAPSHOTS: AppDebugStoreSnapshot[] = [];

const MONACO_OPTIONS = { readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false };

//*****************************************************************************************
// Store List
//*****************************************************************************************

type AppDebugStoreListProps = {
  counts: Record<AppDebugStoreName, number>;
  selected: AppDebugStoreName;
  onSelect: (name: AppDebugStoreName) => void;
};

const AppDebugStoreList = memo(({ counts, selected, onSelect }: AppDebugStoreListProps) => (
  <List dense disablePadding subheader={<ListSubheader disableSticky>Stores</ListSubheader>}>
    {APP_DEBUG_STORE_NAMES.map(name => (
      <ListItemButton key={name} selected={name === selected} onClick={() => onSelect(name)}>
        <ListItemText
          primary={name}
          secondary={`${counts[name] ?? 0} snapshots`}
          sx={{ marginTop: '2px', marginBottom: '2px' }}
        />
      </ListItemButton>
    ))}
  </List>
));

AppDebugStoreList.displayName = 'AppDebugStoreList';

//*****************************************************************************************
// History List
//*****************************************************************************************

type AppDebugHistoryListProps = {
  snapshots: AppDebugStoreSnapshot[];
  selectedId: number;
  onSelect: (id: number) => void;
};

const AppDebugHistoryList = memo(({ snapshots, selectedId, onSelect }: AppDebugHistoryListProps) => (
  <List dense disablePadding subheader={<ListSubheader disableSticky>History</ListSubheader>}>
    {snapshots
      .map((snapshot, index) => ({ snapshot, index }))
      .reverse()
      .map(({ snapshot, index }) => (
        <ListItemButton key={snapshot.id} selected={snapshot.id === selectedId} onClick={() => onSelect(snapshot.id)}>
          <ListItemText
            primary={index === snapshots.length - 1 ? `#${index + 1} (latest)` : `#${index + 1}`}
            secondary={formatAppDebugTimestamp(snapshot.timestamp)}
          />
        </ListItemButton>
      ))}
  </List>
));

AppDebugHistoryList.displayName = 'AppDebugHistoryList';

//*****************************************************************************************
// Debug Stores
//*****************************************************************************************

export const AppDebugStores = memo(() => {
  const theme = useTheme();
  const history = useAppDebugStoreHistory();

  const store = useAppInterfaceStore(s => s.debug.store);
  const snapshotId = useAppInterfaceStore(s => s.debug.snapshotId);
  const setInterfaceStore = useAppSetInterfaceStore();

  const snapshots = history[store] ?? EMPTY_SNAPSHOTS;

  const counts = useMemo(
    () =>
      APP_DEBUG_STORE_NAMES.reduce(
        (acc, name) => ({ ...acc, [name]: history[name]?.length ?? 0 }),
        {} as Record<AppDebugStoreName, number>
      ),
    [history]
  );

  const selected = useMemo(
    () => snapshots.find(snapshot => snapshot.id === snapshotId) ?? snapshots[snapshots.length - 1] ?? null,
    [snapshotId, snapshots]
  );

  const handleSelectStore = useCallback(
    (name: AppDebugStoreName) =>
      setInterfaceStore(s => {
        s.debug.store = name;
        s.debug.snapshotId = null;
        return s;
      }),
    [setInterfaceStore]
  );

  const handleSelectSnapshot = useCallback(
    (id: number) =>
      setInterfaceStore(s => {
        s.debug.snapshotId = id;
        return s;
      }),
    [setInterfaceStore]
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', minHeight: 0 }}>
      <div
        style={{
          width: '200px',
          flex: '0 0 auto',
          overflow: 'auto',
          borderRight: `1px solid ${theme.palette.divider}`
        }}
      >
        <AppDebugStoreList counts={counts} selected={store} onSelect={handleSelectStore} />
      </div>

      <MonacoEditor value={selected?.value ?? ''} language="json" options={MONACO_OPTIONS} />

      <div
        style={{ width: '200px', flex: '0 0 auto', overflow: 'auto', borderLeft: `1px solid ${theme.palette.divider}` }}
      >
        <AppDebugHistoryList snapshots={snapshots} selectedId={selected?.id ?? null} onSelect={handleSelectSnapshot} />
      </div>
    </div>
  );
});

AppDebugStores.displayName = 'AppDebugStores';
