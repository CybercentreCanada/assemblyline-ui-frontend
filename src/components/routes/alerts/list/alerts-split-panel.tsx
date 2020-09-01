import { Box, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import React, { useState } from 'react';
import { AlertItem } from '../alerts';
import SplitPanel from '../panels/split-panel2';
import Viewport from '../panels/viewport';
import AlertDetails from './alert-details';
import AlertList from './alert-list';

type AlertsSplitPanelProps = {
  items: AlertItem[];
};

//
const AlertsSplitPanel: React.FC<AlertsSplitPanelProps> = ({ items }) => {
  const theme = useTheme();
  const [state, setState] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });

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
          <Box pr={state.open ? 2 : 0}>
            <AlertList items={items} onItemClick={item => setState({ open: true, item })} selected={state.item} />
          </Box>
        }
        right={
          state.item ? (
            <Box p={2} pt={0}>
              <PageHeader
                mode="provided"
                title={
                  <Box display="flex">
                    <Typography variant="h6">{state.item.file.name}</Typography>
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
