import type { CheckboxProps } from '@mui/material';
import { Checkbox, ListItemIcon } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import type { AnchorProps } from 'components/core/TableOfContent/Anchor';
import { Anchor } from 'components/core/TableOfContent/Anchor';
import { ResetInputAdornment } from 'components/visual/Inputs/components/inputs.component.adornment';
import { InputCircularSkeleton } from 'components/visual/Inputs/components/inputs.component.buttons';
import { useInputId, useInputLabel } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  ListInputButtonRoot,
  ListInputRoot,
  ListInputText
} from 'components/visual/ListInputs/lib/listinputs.components';
import type { ListInputOptions, ListInputSlotProps } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type ListHeaderProps = Omit<
  InputValueModel<boolean, React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>>,
  'value'
> &
  ListInputOptions &
  ListInputSlotProps & {
    anchor?: boolean;
    anchorProps?: AnchorProps;
    checked?: boolean;
    edge?: CheckboxProps['edge'];
    indeterminate?: CheckboxProps['indeterminate'];
  };

type ListHeaderController = ListHeaderProps & InputRuntimeState<boolean>;

const WrappedListHeader = React.memo(() => {
  const [get] = usePropStore<ListHeaderController>();

  const anchor = get('anchor');
  const anchorProps = get('anchorProps');
  const checked = get('checked');
  const disabled = get('disabled');
  const edge = get('edge');
  const id = useInputId();
  const indeterminate = get('indeterminate');
  const loading = get('loading');
  const primary = useInputLabel();

  const onChange = get('onChange');

  return (
    <Anchor anchor={id} label={primary} disabled={!anchor} {...anchorProps}>
      {!onChange ? (
        <ListInputRoot dense disableGutters disablePadding sx={{ padding: 0 }}>
          {checked !== null && checked !== undefined && (
            <ListItemIcon>
              {loading ? (
                <InputCircularSkeleton />
              ) : (
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  disableRipple
                  edge={edge}
                  indeterminate={indeterminate}
                  inputProps={{ id }}
                  tabIndex={-1}
                />
              )}
            </ListItemIcon>
          )}
          <ListInputText />
        </ListInputRoot>
      ) : (
        <ListInputButtonRoot
          dense
          disableGutters
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onChange(event, checked, indeterminate);
          }}
          sx={{ padding: 0 }}
        >
          {checked !== null && checked !== undefined && (
            <ListItemIcon>
              {loading ? (
                <InputCircularSkeleton />
              ) : (
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  disableRipple
                  edge={edge}
                  indeterminate={indeterminate}
                  inputProps={{ id }}
                  tabIndex={-1}
                />
              )}
            </ListItemIcon>
          )}

          <ListInputText />

          <ResetInputAdornment />
        </ListInputButtonRoot>
      )}
    </Anchor>
  );
});

export const ListHeader = ({
  anchor = false,
  anchorProps = null,
  checked = null,
  edge = 'end',
  preventRender = false,
  ...props
}: ListHeaderProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<boolean>({
    value: Boolean(checked),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<ListHeaderController>
      initialProps={{ ...DEFAULT_LIST_INPUT_CONTROLLER_PROPS, onChange: null } as ListHeaderController}
      props={{
        anchor,
        anchorProps,
        checked,
        edge,
        onChange: null,
        preventRender,
        validationMessage,
        validationStatus,
        ...props
      }}
    >
      <WrappedListHeader />
    </PropProvider>
  );
};

ListHeader.displayName = 'ListHeader';
