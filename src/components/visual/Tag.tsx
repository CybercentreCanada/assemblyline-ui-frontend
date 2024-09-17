import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import type { PossibleColors } from 'components/visual/CustomChip';
import CustomChip from 'components/visual/CustomChip';
import ExternalLinks from 'components/visual/ExternalSearch';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import ActionMenu from './ActionMenu';
import EnrichmentCustomChip, { BOREALIS_TYPE_MAP } from './EnrichmentCustomChip';

const STYLE = { height: 'auto', minHeight: '22px' };
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
  label?: string | null;
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
  classification,
  label = null
}) => {
  const { pathname } = useLocation();
  const { scoreToVerdict, configuration } = useALContext();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { showSafeResults } = useSafeResults();

  const [state, setState] = useState<typeof initialMenuState>(initialMenuState);
  const [showBorealisDetails, setShowBorealisDetails] = useState<boolean>(true);

  const maliciousness = useMemo<string>(() => {
    let v = lvl || scoreToVerdict(score);
    if (safelisted) v = 'safe';
    return v;
  }, [lvl, safelisted, score, scoreToVerdict]);

  const color = useMemo<PossibleColors>(
    () =>
      ({
        suspicious: 'warning' as const,
        malicious: 'error' as const,
        safe: 'success' as const,
        info: 'default' as const,
        highly_suspicious: 'warning' as const
      }[maliciousness]),
    [maliciousness]
  );

  const handleClick = useCallback(() => triggerHighlight(highlight_key), [triggerHighlight, highlight_key]);

  const handleMenuClick = useCallback<React.MouseEventHandler<HTMLDivElement>>(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  useEffect(() => {
    setShowBorealisDetails(false);
  }, [pathname]);

  return maliciousness === 'safe' && !showSafeResults && !force ? null : (
    <>
      {state !== initialMenuState && (
        <ActionMenu
          category={'tag'}
          type={type}
          value={value}
          state={state}
          setState={setState}
          classification={classification}
          highlight_key={highlight_key}
          setBorealisDetails={setShowBorealisDetails}
        />
      )}
      {configuration.ui.api_proxies.includes('borealis') && type in BOREALIS_TYPE_MAP && value !== null ? (
        <EnrichmentCustomChip
          dataType={BOREALIS_TYPE_MAP[type]}
          dataValue={value}
          dataClassification={classification}
          hidePreview={true}
          hideDetails={true}
          wrap
          label={label ? label : short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
          size="tiny"
          type="rounded"
          color={highlight_key && isHighlighted(highlight_key) ? 'primary' : color}
          onClick={highlight_key ? handleClick : null}
          fullWidth={fullWidth}
          onContextMenu={handleMenuClick}
          forceDetails={showBorealisDetails}
          setForceDetails={setShowBorealisDetails}
          icon={<ExternalLinks category={'tag'} type={type} value={value} />}
        />
      ) : (
        <CustomChip
          wrap
          variant="outlined"
          size="tiny"
          type="rounded"
          color={highlight_key && isHighlighted(highlight_key) ? 'primary' : color}
          label={label ? label : short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
          style={STYLE}
          onClick={highlight_key ? handleClick : null}
          fullWidth={fullWidth}
          onContextMenu={handleMenuClick}
          icon={<ExternalLinks category={'tag'} type={type} value={value} />}
        />
      )}
    </>
  );
};

const Tag = React.memo(WrappedTag);
export default Tag;
