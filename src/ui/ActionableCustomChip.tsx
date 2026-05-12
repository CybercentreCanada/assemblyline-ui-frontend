import useALContext from 'deprecated/hooks/useALContext';
import useExternalLookup from 'deprecated/hooks/useExternalLookup';
import type { ExternalLinkType } from 'models/base/config';
import React, { useCallback, useState } from 'react';
import ActionMenu from 'ui/ActionMenu';
import type { CustomChipProps } from 'ui/CustomChip';
import CustomChip from 'ui/CustomChip';
import EnrichmentCustomChip, { BOREALIS_TYPE_MAP } from 'ui/EnrichmentCustomChip';
import ExternalLinks from 'ui/ExternalSearch';

export type ActionableCustomChipProps = CustomChipProps & {
  category?: ExternalLinkType;
  classification?: string;
  data_type?: string;
  index?: string;
  label?: string;
  value?: string;
};

const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const WrappedActionableCustomChip: React.FC<ActionableCustomChipProps> = ({
  children,
  data_type = null,
  index = null,
  category = null,
  classification,
  label,
  value,
  variant = 'outlined',
  ...otherProps
}) => {
  const [state, setState] = useState(initialMenuState);
  const { configuration } = useALContext();

  const handleMenuClick = useCallback(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  const { isActionable } = useExternalLookup();
  const actionable = index || isActionable(category, data_type, label);

  // Do the menu rendering here
  return (
    <>
      {actionable && state !== initialMenuState && (
        <ActionMenu
          category={category}
          index={index}
          type={data_type}
          value={value || label}
          state={state}
          setState={setState}
          classification={classification}
        />
      )}
      {'borealis' in configuration.ui.api_proxies && data_type in BOREALIS_TYPE_MAP && label !== null ? (
        <EnrichmentCustomChip
          dataType={BOREALIS_TYPE_MAP[data_type]}
          dataValue={label}
          dataClassification={classification}
          icon={<ExternalLinks category={category} type={data_type} value={label} round={variant === 'outlined'} />}
          label={label}
          variant={variant}
          {...otherProps}
          onContextMenu={actionable ? handleMenuClick : null}
        />
      ) : (
        <CustomChip
          icon={<ExternalLinks category={category} type={data_type} value={label} round={variant === 'outlined'} />}
          label={label}
          variant={variant}
          {...otherProps}
          onContextMenu={actionable ? handleMenuClick : null}
        />
      )}
    </>
  );
};

const ActionableCustomChip = React.memo(WrappedActionableCustomChip);
export default ActionableCustomChip;
