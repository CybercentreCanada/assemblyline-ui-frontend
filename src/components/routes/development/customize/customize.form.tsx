import { createFormContext } from 'components/core/form/createFormContext';

export const CUSTOMIZE_METHODS = [
  'Pure <div /> using className',
  'Pure <div /> using style',
  '<div /> component with style',
  "<div /> component with MUI's style",

  'Box component using className',
  'Box component with style',
  'Box component with styled',
  'Box component with sx'
] as const;

export type CustomizeMethod = (typeof CUSTOMIZE_METHODS)[number];

export type CustomizeForm = {
  method: CustomizeMethod;
  count: number;
  times: Record<CustomizeMethod, number>;
  performances: Record<CustomizeMethod, number>;
};

export const DEFAULT_CUSTOMIZE_FORM = {
  method: null,
  count: 10000,
  times: null,
  performances: null
};

export const { FormProvider, useForm } = createFormContext<CustomizeForm>({
  defaultValues: structuredClone(DEFAULT_CUSTOMIZE_FORM)
});
