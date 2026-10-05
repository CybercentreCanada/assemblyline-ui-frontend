import type { FormAsyncValidateOrFn, FormOptions, FormValidateOrFn, ReactFormExtendedApi } from '@tanstack/react-form';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import type { ReactElement, ReactNode } from 'react';
import { createContext, useContext } from 'react';

export const createFormContext = <
  TFormData,
  TOnMount extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnChange extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnChangeAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnBlur extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnBlurAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnSubmit extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnSubmitAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnDynamic extends FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
  TOnDynamicAsync extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>,
  TOnServer extends FormAsyncValidateOrFn<TFormData> = FormAsyncValidateOrFn<TFormData>
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
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer
  >
): {
  FormProvider: ({ children }: { children: ReactNode }) => ReactElement;
  useForm: () => ReactFormExtendedApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    never
  >;
} => {
  type FormContextProps = ReactFormExtendedApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    never
  > | null;

  const FormContext = createContext<FormContextProps>(null);

  type FormProviderProps = { children: ReactNode };

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
};
