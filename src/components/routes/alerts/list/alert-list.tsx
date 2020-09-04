import List from 'components/elements/list';
import { AlertItem } from 'components/routes/alerts/alerts';
import AlertListItem from 'components/routes/alerts/list/alert-list-item';
import React from 'react';

type AlertListProps = {
  loading?: boolean;
  selected?: string | number;
  items: AlertItem[];
  itemLayout?: 'inline' | 'stack';
  onSelection: (item: AlertItem) => void;
  onKeyDown?: (keyCode: number, items: AlertItem[], selectedId: number | string) => void;
};

const AlertList: React.FC<AlertListProps> = ({
  loading = true,
  selected = -1,
  items,
  itemLayout = 'inline',
  onSelection,
  onKeyDown
}) => {
  return (
    <List
      loading={loading}
      selected={selected}
      items={items}
      onItemSelected={onSelection}
      onRenderItem={i => <AlertListItem item={i} layout={itemLayout} />}
      onKeyDown={onKeyDown}
    />
  );
};

export default AlertList;
