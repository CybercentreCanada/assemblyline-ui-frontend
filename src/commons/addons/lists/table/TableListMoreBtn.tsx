/* eslint-disable jsx-a11y/anchor-is-valid */

import { Button } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export interface TableListMoreConfig {
  onClick: () => void;
}

export default function TableListMoreBtn({ onClick }: TableListMoreConfig) {
  return (
    <Button size="small" variant="contained" onClick={onClick} startIcon={<ExpandMore />}>
      Show More Results
    </Button>
  );
}
