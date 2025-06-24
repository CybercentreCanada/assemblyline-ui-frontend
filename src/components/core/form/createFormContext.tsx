import type { FormAsyncValidateOrFn, FormOptions, FormValidateOrFn, ReactFormExtendedApi } from '@tanstack/react-form';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import React, { createContext, useContext } from 'react';

export function createFormContext<
  TFormData,
  TOnMount extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnChange extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnChangeAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnBlurAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnServer extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TSubmitMeta = unknown
>(
  options: FormOptions<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer,
    TSubmitMeta
  >
) {
  type FormContextProps = ReactFormExtendedApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnServer,
    TSubmitMeta
  > | null;

  const FormContext = createContext<FormContextProps>(null);

  type FormProviderProps = {
    children: React.ReactNode;
  };

  const FormProvider = ({ children }: FormProviderProps) => {
    const form = useTanStackForm(options);
    return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
  };

  const useForm = () => {
    const form = useContext(FormContext);
    if (!form) {
      throw new Error('Store not found');
    }

    return form;
  };

  return { FormProvider, useForm };
}
