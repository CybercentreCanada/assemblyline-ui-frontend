import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';

const STYLE = { height: 'auto', minHeight: '20px' };
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

type HeuristicProps = {
  text: string;
  lvl?: string | null;
  score?: number | null;
  signature?: boolean;
  show_type?: boolean;
  highlight_key?: string;
  fullWidth?: boolean;
  safe?: boolean;
  force?: boolean;
};

const WrappedHeuristic: React.FC<HeuristicProps> = ({
  text,
  lvl = null,
  score = null,
  signature = false,
  show_type = false,
  highlight_key = null,
  fullWidth = false,
  safe = false,
  force = false
}) => {
  const [state, setState] = React.useState(initialMenuState);
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { scoreToVerdict } = useALContext();
  const { showSafeResults } = useSafeResults();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  let maliciousness = lvl || scoreToVerdict(score);
  if (safe) {
    maliciousness = 'safe';
  }

  const color: PossibleColors = {
    suspicious: 'warning' as 'warning',
    malicious: 'error' as 'error',
    safe: 'success' as 'success',
    info: 'default' as 'default',
    highly_suspicious: 'warning' as 'warning'
  }[maliciousness];

  const handleMenuClick = useCallback(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  return maliciousness === 'safe' && !showSafeResults && !force ? null : (
    <>
      <ActionMenu
        category={signature ? 'signature' : 'heuristic'}
        type={''}
        value={text}
        state={state}
        setState={setState}
        highlight_key={highlight_key}
      />
      <CustomChip
        wrap
        variant={safe ? 'outlined' : 'filled'}
        size="tiny"
        type="rounded"
        color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
        label={show_type ? (signature ? `[SIGNATURE] ${text}` : `[HEURISTIC] ${text}`) : text}
        style={STYLE}
        onClick={highlight_key ? handleClick : null}
        fullWidth={fullWidth}
        onContextMenu={handleMenuClick}
      />
    </>
  );
};

const Heuristic = React.memo(WrappedHeuristic);
export default Heuristic;
