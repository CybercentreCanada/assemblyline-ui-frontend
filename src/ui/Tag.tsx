import { HIDE_EVENT_ID } from '@cccsaurora/clue-ui/data/event';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import useHighlighter from 'deprecated/legacy/components/hooks/useHighlighter';
import useSafeResults from 'deprecated/legacy/components/hooks/useSafeResults';
import type { ActionMenuProps } from 'ui/ActionMenu';
import ActionMenu from 'ui/ActionMenu';
import CustomChip from 'ui/CustomChip';
import EnrichmentCustomChip, { CLUE_TYPE_MAP } from 'ui/EnrichmentCustomChip';
import ExternalLinks from 'ui/ExternalSearch';
import type { PossibleColor } from 'shared/utils/colors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
  const { scoreToVerdict, configuration } = useALContext();
  const { isHighlighted, triggerHighlight } = useHighlighter();
  const { showSafeResults } = useSafeResults();

  const [state, setState] = useState<typeof initialMenuState>(initialMenuState);
  const [showClueDetails, setShowClueDetails] = useState<boolean>(false);

  const maliciousness = useMemo<string>(() => {
    let v = lvl || scoreToVerdict(score);
    if (safelisted) v = 'safe';
    return v;
  }, [lvl, safelisted, score, scoreToVerdict]);

  const color = useMemo<PossibleColor>(
    () =>
      ({
        suspicious: 'warning' as const,
        malicious: 'error' as const,
        safe: 'success' as const,
        info: 'default' as const,
        highly_suspicious: 'warning' as const
      })[maliciousness],
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
    return () => {
      setShowClueDetails(false);
      setState(initialMenuState);
      window.dispatchEvent(
        new CustomEvent(HIDE_EVENT_ID, {
          detail: {
            type: 'details',
            value: { type: CLUE_TYPE_MAP[type as keyof typeof CLUE_TYPE_MAP], value: value },
            classification
          }
        })
      );
    };
  }, [classification, type, value]);

  return maliciousness === 'safe' && !showSafeResults && !force ? null : (
    <>
      {state !== initialMenuState && (
        <ActionMenu
          category="tag"
          type={type}
          value={value}
          state={state}
          setState={setState}
          classification={classification}
          highlight_key={highlight_key}
          maliciousness={maliciousness as ActionMenuProps['maliciousness']}
          setClueDetails={setShowClueDetails}
        />
      )}
      {'clue' in configuration.ui.api_proxies && type in CLUE_TYPE_MAP && value !== null ? (
        <EnrichmentCustomChip
          dataType={CLUE_TYPE_MAP[type as keyof typeof CLUE_TYPE_MAP]}
          dataValue={value}
          dataClassification={classification}
          hideDetails={true}
          wrap
          label={label ? label : short_type ? `[${short_type.toUpperCase()}] ${value}` : value}
          size="tiny"
          type="rounded"
          color={highlight_key && isHighlighted(highlight_key) ? 'primary' : color}
          onClick={highlight_key ? handleClick : null}
          fullWidth={fullWidth}
          onContextMenu={handleMenuClick}
          forceDetails={showClueDetails}
          setForceDetails={setShowClueDetails}
          icon={<ExternalLinks category="tag" type={type} value={value} />}
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
          icon={<ExternalLinks category="tag" type={type} value={value} />}
        />
      )}
    </>
  );
};

const Tag = React.memo(WrappedTag);
export default Tag;
