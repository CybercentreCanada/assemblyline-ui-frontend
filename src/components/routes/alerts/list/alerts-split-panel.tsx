import { Box, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import React, { useState } from 'react';
import { AlertItem } from '../alerts';
import SplitPanel from '../panels/split-panel';
import Viewport from '../panels/viewport';
import AlertDetails from './alert-details';
import AlertList from './alert-list';

type AlertsSplitPanelProps = {
  items: AlertItem[];
};

//
const AlertsSplitPanel: React.FC<AlertsSplitPanelProps> = ({ items }) => {
  const theme = useTheme();
  const isLTELarge = useMediaQuery(theme.breakpoints.up('lg'));
  const [state, setState] = useState<{ open: boolean; item: AlertItem }>({ open: false, item: null });

  return (
    <Viewport>
      <SplitPanel
        leftInitWidthPerc={60}
        leftMinWidth={500}
        rightMinWidth={500}
        breakpoint={1100}
        left={
          <Box pr={state.open ? 2 : 0}>
            <AlertList items={items} onItemClick={item => setState({ open: true, item })} />
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
                actions={[{ icon: <CloseIcon />, action: () => setState({ item: null, open: false }) }]}
                // backgroundColor={theme.palette.background.}
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
