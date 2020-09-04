import { Box, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import { AlertItem } from 'components/routes/alerts/alerts';
import SplitPanel from 'components/routes/alerts/panels/split-panel';
import Viewport from 'components/routes/alerts/panels/viewport';
import React, { useState } from 'react';
import { isEscape } from '../panels/keyboard';
import AlertDetails from './alert-details';
import AlertList from './alert-list';

type AlertsSplitPanelProps = {
  loading?: boolean;
  items: AlertItem[];
};

// .
const AlertsSplitPanel: React.FC<AlertsSplitPanelProps> = ({ loading = false, items }) => {
  const theme = useTheme();
  const [state, setState] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });

  const onListKeyDown = keyCode => {
    if (isEscape(keyCode) && state.open) {
      setState({ ...state, open: false });
    }
  };

  return (
    <Viewport>
      <SplitPanel
        leftMinWidth={500}
        leftInitWidthPerc={60}
        rightMinWidth={600}
        rightDrawerBreakpoint={1100}
        rightDrawerWidth={900}
        rightDrawerBackgroundColor={theme.palette.background.default}
        rightOpen={state.open}
        left={
          // <Box pr={state.open ? 2 : 0}>
          <AlertList
            loading={loading}
            selected={state.open && state.item ? state.item.id : -1}
            items={items}
            onSelection={item => setState({ open: true, item })}
            onKeyDown={onListKeyDown}
          />
          // </Box>
        }
        right={
          state.item ? (
            <Box p={2} pt={0} width="100%">
              <PageHeader
                mode="provided"
                title={
                  <Box display="flex">
                    <Typography variant="h6">{state.item.alert_id}</Typography>
                  </Box>
                }
                actions={[{ icon: <CloseIcon />, action: () => setState({ ...state, open: false }) }]}
                backgroundColor={theme.palette.background.default}
                elevation={0}
                isSticky
              />
              <AlertDetails item={state.item} />
            </Box>
          ) : null
        }
      />
    </Viewport>
  );
};

export default AlertsSplitPanel;
