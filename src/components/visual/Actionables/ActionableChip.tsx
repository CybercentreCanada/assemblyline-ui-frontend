import useALContext from 'components/hooks/useALContext';
import type { ExternalLinkType } from 'components/models/base/config';
import { ActionableMenu } from 'components/visual/Actionables/components/ActionMenu';
import type { ActionableProps } from 'components/visual/Actionables/lib/actionable.models';
import { PropProvider, usePropStore } from 'components/visual/Actionables/lib/actionable.provider';
import { CustomChip, type CustomChipProps } from 'components/visual/CustomChip';
import EnrichmentCustomChip, { BOREALIS_TYPE_MAP } from 'components/visual/EnrichmentCustomChip';
import ExternalLinks from 'components/visual/ExternalSearch';
import React, { useCallback } from 'react';

export type ActionableChipProps = ActionableProps & {
  category?: ExternalLinkType;
  // classification?: string;
  dataType?: keyof typeof BOREALIS_TYPE_MAP;
  index?: string;
  label?: string;
  variant?: CustomChipProps['variant'];
};

export const WrappedActionableChip = React.memo((props: CustomChipProps) => {
  const { configuration } = useALContext();

  const [get, setStore] = usePropStore<ActionableChipProps>();

  const category = get('category');
  const classification = get('classification');
  const dataType = get('dataType');
  const label = get('label');
  const variant = get('variant');

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      setStore({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
    },
    [setStore]
  );

  const actionable = true;

  return (
    <>
      <ActionableMenu />

      {'borealis' in configuration.ui.api_proxies && dataType in BOREALIS_TYPE_MAP && label !== null ? (
        <EnrichmentCustomChip
          dataType={BOREALIS_TYPE_MAP[dataType]}
          dataValue={label}
          dataClassification={classification}
          icon={<ExternalLinks category={category} type={dataType} value={label} round={variant === 'outlined'} />}
          label={label}
          variant={variant}
          {...props}
          onContextMenu={actionable ? handleMenuClick : null}
        />
      ) : (
        <CustomChip
          icon={<ExternalLinks category={category} type={dataType} value={label} round={variant === 'outlined'} />}
          label={label}
          variant={variant}
          {...props}
          onContextMenu={actionable ? handleMenuClick : null}
        />
      )}
    </>
  );
});

export const ActionableChip = ({
  category = null,
  classification = null,
  label = null,
  type = null,
  value = null,
  variant = 'outlined',
  ...props
}: ActionableChipProps) => (
  <PropProvider<ActionableChipProps>
    props={{
      category,
      classification,
      label,
      type,
      value: value || label,
      variant
    }}
  >
    <WrappedActionableChip {...(props as CustomChipProps)} />
  </PropProvider>
);
