import React, { useState } from 'react';
import { AlertItem } from '../alerts';
import SplitPanel from '../panels/split-panel';
import Viewport from '../panels/viewport';
import AlertDetails from './alert-details';
import AlertList from './alert-list';

type AlertsSplitPanelProps = {
  items: AlertItem[];
};

const AlertsSplitPanel: React.FC<AlertsSplitPanelProps> = ({ items }) => {
  const [state, setState] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });

  return (
    <Viewport>
      <SplitPanel
        leftInitWidth={1200}
        left={<AlertList items={items} onItemClick={item => setState({ ...state, item })} />}
        right={state.item ? <AlertDetails item={state.item} /> : null}
      />
    </Viewport>
  );
};

export default AlertsSplitPanel;
