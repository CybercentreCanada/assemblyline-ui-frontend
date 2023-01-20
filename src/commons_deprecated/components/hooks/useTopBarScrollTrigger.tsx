import { useScrollTrigger } from '@mui/material';

export default function useTopBarScrollTrigger() {
  return useScrollTrigger({
    disableHysteresis: true,
    threshold: 0
  });
}
