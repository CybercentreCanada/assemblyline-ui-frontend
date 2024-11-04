import type { FormApi, FormOptions, ReactFormApi, Validator } from '@tanstack/react-form';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import _ from 'lodash';
import React, { createContext, useCallback, useContext } from 'react';

export function createFormContext<
  TFormData,
  TFormValidator extends Validator<TFormData, string> = Validator<TFormData, string>
>(options: FormOptions<TFormData, TFormValidator>) {
  type FormContextProps = (FormApi<TFormData, TFormValidator> & ReactFormApi<TFormData, TFormValidator>) | null;

  // type FormFieldComponentProps = Parameters<FieldComponent<TFormData, TFormValidator>>[0];

  // type FieldComponentProps<Value> = Omit<FormFieldComponentProps, 'name'> & {
  //   field: (data: TFormData) => Value;
  // };

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
        form.store.setState(s => ({ ...s, values: _.cloneDeep(updater(s.values)) }));
      },
      [form.store]
    );

    // const FieldComponent = useCallback(
    //   <Value extends any>({ children, field, ...fieldOptions }: FieldComponentProps<any>) => {
    //     const data = field(path);
    //     const name = 'toPath' in data ? data.toPath().slice(2) : null;
    //     // const name = field(buildPath(options.defaultValues)).slice(2) as FormFieldComponentProps['name'];

    //     return (
    //       <form.Field name={name as string} {...fieldOptions}>
    //         {children}
    //       </form.Field>
    //     );
    //   },
    //   [form, path]
    // );

    return { ...form, setStore };
  };

  return { FormProvider, useForm };
}
