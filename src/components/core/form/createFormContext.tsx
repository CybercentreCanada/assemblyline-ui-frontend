import type { FormApi, FormOptions, ReactFormApi, Validator } from '@tanstack/react-form';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import React, { createContext, useCallback, useContext } from 'react';

export function createFormContext<
  TFormData,
  TFormValidator extends Validator<TFormData, string> = Validator<TFormData, string>
>(options: FormOptions<TFormData, TFormValidator>) {
  type FormContextProps = (FormApi<TFormData, TFormValidator> & ReactFormApi<TFormData, TFormValidator>) | null;

  const FormContext = createContext<FormContextProps>(null);

  type FormProviderProps = {
    children: React.ReactNode;
    onSubmit?: FormOptions<TFormData, TFormValidator>['onSubmit'];
  };

  const FormProvider = ({ children, onSubmit = () => null }: FormProviderProps) => {
    const form = useTanStackForm({
      ...options,
      onSubmit: props => {
        'onSubmit' in options ? options.onSubmit(props) : null;
        onSubmit(props);
      }
    });
    return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
  };

  const useForm = () => {
    const form = useContext(FormContext);
    if (!form) {
      throw new Error('Store not found');
    }

    const setStore = useCallback(
      (updater: (data: TFormData) => TFormData) => {
        form.store.setState(s => ({ ...s, values: updater(s.values) }));
      },
      [form.store]
    );

    return { ...form, setStore };
  };

  return { FormProvider, useForm };
}
