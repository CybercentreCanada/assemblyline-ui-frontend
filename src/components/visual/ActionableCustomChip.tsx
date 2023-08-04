import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';
import CustomChip, { CustomChipProps } from './CustomChip';
import ExternalLinks from './ExternalLookup/ExternalLinks';
import { useSearchTagExternal } from './ExternalLookup/useExternalLookup';

// export interface ActionableCustomChipProps extends CustomChipProps {
//   data_type?: string;
//   category?: 'hash' | 'metadata' | 'tag';
//   classification?: string;
//   label?: string;
// }

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

const WrappedActionableCustomChip: React.FC<ActionableCustomChipProps> = ({
  children,
  data_type = null,
  category = null,
  classification,
  label,
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

  const { lookupState, isActionable, searchTagExternal } = useSearchTagExternal({
    [data_type]: {
      results: {},
      errors: {},
      success: null
    }
  });

  const actionable = isActionable(category, data_type, label);

  // Do the menu rendering here
  return (
    <>
      {actionable && (
        <ActionMenu
          category={category}
          type={data_type}
          value={label}
          state={state}
          setState={setState}
          searchTagExternal={searchTagExternal}
          classification={classification}
        />
      )}
      <CustomChip
        icon={
          actionable && lookupState && lookupState[data_type] ? (
            <ExternalLinks
              success={lookupState[data_type].success}
              results={lookupState[data_type].results}
              errors={lookupState[data_type].errors}
              iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '20px', verticalAlign: 'middle' }}
            />
          ) : null
        }
        {...otherProps}
        onClick={actionable ? handleMenuClick : null}
        onContextMenu={actionable ? handleMenuClick : null}
      />
    </>
  );
};

const ActionableCustomChip = React.memo(WrappedActionableCustomChip);
export default ActionableCustomChip;
