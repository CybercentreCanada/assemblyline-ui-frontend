import { Box, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import AlertList from './alert-list';
import { AlertItem } from './alerts';
import Viewport from './viewport';

type AlertListDetailProps = {
  items: AlertItem[];
};

const AlertListDetail: React.FC<AlertListDetailProps> = ({ items }) => {
  const theme = useTheme();
  const [item, setItem] = useState<AlertItem>(null);
  return (
    <Viewport>
      <Box height="100%" overflow="auto">
        <AlertList items={items} />
      </Box>
    </Viewport>
  );
};

export default AlertListDetail;
