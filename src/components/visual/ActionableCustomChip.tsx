import useExternalLookup from 'components/hooks/useExternalLookup';
import { ExternalLinkType } from 'components/models/base/config';
import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';
import CustomChip, { CustomChipProps } from './CustomChip';
import ExternalLinks from './ExternalSearch';

export type ActionableCustomChipProps = CustomChipProps & {
  data_type?: string;
  category?: ExternalLinkType;
  classification?: string;
  label?: string;
};

const initialMenuState = {
  mouseX: null,
  mouseY: null
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
      <CustomChip
        icon={<ExternalLinks category={category} type={data_type} value={label} round={variant === 'outlined'} />}
        label={label}
        variant={variant}
        {...otherProps}
        onClick={actionable ? handleMenuClick : null}
        onContextMenu={actionable ? handleMenuClick : null}
      />
    </>
  );
};

const ActionableCustomChip = React.memo(WrappedActionableCustomChip);
export default ActionableCustomChip;
