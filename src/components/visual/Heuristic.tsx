import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import ActionMenu from 'components/visual/ActionMenu';
import CustomChip from 'components/visual/CustomChip';
import type { PossibleColor } from 'helpers/colors';
import React, { useCallback } from 'react';

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

  const color: PossibleColor = {
    suspicious: 'warning' as const,
    malicious: 'error' as const,
    safe: 'success' as const,
    info: 'default' as const,
    highly_suspicious: 'warning' as const
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
      {state !== initialMenuState && (
        <ActionMenu
          category={signature ? 'signature' : 'heuristic'}
          type=""
          value={text}
          state={state}
          setState={setState}
          highlight_key={highlight_key}
        />
      )}
      <CustomChip
        wrap
        variant="outlined"
        size="tiny"
        type="rounded"
        color={highlight_key && isHighlighted(highlight_key) ? 'primary' : color}
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
