import useExternalLookup from 'components/hooks/useExternalLookup';
import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';
import CustomChip, { CustomChipProps } from './CustomChip';
import EnrichmentCustomChip from './EnrichmentCustomChip';
import ExternalLinks from './ExternalSearch';

export type ActionableCustomChipProps = CustomChipProps & {
  data_type?: string;
  category?: 'hash' | 'metadata' | 'tag';
  classification?: string;
  label?: string;
};

const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const TYPE_MAP = {
  'network.static.ip': 'ip',
  'network.dynamic.ip': 'ip',
  'network.static.domain': 'domain',
  'network.dynamic.domain': 'domain',
  'network.static.uri': 'url',
  'network.dynamic.uri': 'url',
  md5: 'md5',
  sha1: 'sha1',
  sha256: 'sha256',
  'email.address': 'eml_address'
};

const WrappedActionableCustomChip: React.FC<ActionableCustomChipProps> = ({
  children,
  data_type = null,
  category = null,
  classification,
  label,
  variant = 'outlined',
  ...otherProps
}) => {
  const [state, setState] = React.useState(initialMenuState);

  const handleMenuClick = useCallback(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  const { isActionable } = useExternalLookup();
  const actionable = isActionable(category, data_type, label);

  // Do the menu rendering here
  return (
    <>
      {actionable && state !== initialMenuState && (
        <ActionMenu
          category={category}
          type={data_type}
          value={label}
          state={state}
          setState={setState}
          classification={classification}
        />
      )}
      {data_type in TYPE_MAP && label !== null ? (
        <EnrichmentCustomChip
          dataType={TYPE_MAP[data_type]}
          dataValue={label}
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
