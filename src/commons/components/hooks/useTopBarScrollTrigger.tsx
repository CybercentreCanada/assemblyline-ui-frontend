import { useScrollTrigger } from '@material-ui/core';

export default function useTopBarScrollTrigger() {
  return useScrollTrigger({
    disableHysteresis: true,
    threshold: 0
  });
}
