import { createFormContext } from 'components/core/form/createFormContext';

export const CUSTOMIZE_METHODS = [
  'Pure <div /> using style',
  'Pure <div /> using className',
  '<div /> component with style',
  'Box component with style',
  'Box component with sx'
] as const;

export type CustomizeMethod = (typeof CUSTOMIZE_METHODS)[number];

export type CustomizeForm = {
  method: CustomizeMethod;
  count: number;
  times: Record<CustomizeMethod, number>;
};

export const DEFAULT_CUSTOMIZE_FORM = {
  method: null,
  count: 10000,
  times: null
};

export const { FormProvider, useForm } = createFormContext<CustomizeForm>({
  defaultValues: structuredClone(DEFAULT_CUSTOMIZE_FORM)
});
