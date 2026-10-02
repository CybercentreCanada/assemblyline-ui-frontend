import { ExpandMore } from '@mui/icons-material';
import { Button } from '@mui/material';

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
