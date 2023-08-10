import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
// import ExternalLinks from 'components/visual/ExternalLookup/ExternalLinks';
import ExternalLinks from 'components/visual/ExternalSearch';
import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';

const STYLE = { height: 'auto', minHeight: '20px' };
const initialMenuState = {
  mouseX: null,
  mouseY: null
};

type TagProps = {
  type: string;
  value: string;
  lvl?: string | null;
  score?: number | null;
  short_type?: string | null;
  highlight_key?: string;
  safelisted?: boolean;
  fullWidth?: boolean;
  force?: boolean;
  classification?: string | null;
};

const WrappedTag: React.FC<TagProps> = ({
  type,
  value,
  lvl = null,
  score = null,
  short_type = null,
  highlight_key = null,
  safelisted = false,
  fullWidth = false,
  force = false,
  classification
}) => {
  const [state, setState] = React.useState(initialMenuState);
  const { scoreToVerdict } = useALContext();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { showSafeResults } = useSafeResults();

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  let maliciousness = lvl || scoreToVerdict(score);
  if (safelisted) {
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
        category={'tag'}
        type={type}
        value={value}
        state={state}
        setState={setState}
        classification={classification}
        highlight_key={highlight_key}
      />
      <CustomChip
        wrap
        variant={safelisted ? 'outlined' : 'filled'}
        size="tiny"
        type="rounded"
        color={highlight_key && isHighlighted(highlight_key) ? ('primary' as 'info') : color}
        label={short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
        style={STYLE}
        onClick={highlight_key ? handleClick : null}
        fullWidth={fullWidth}
        onContextMenu={handleMenuClick}
        icon={
          <ExternalLinks
            category={'tag'}
            type={type}
            value={value}
            iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '20px', verticalAlign: 'middle' }}
          />
        }
      />
    </>
  );
};

const Tag = React.memo(WrappedTag);
export default Tag;
