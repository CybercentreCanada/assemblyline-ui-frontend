import type { FieldComponent, FormApi, FormOptions, ReactFormApi, Validator } from '@tanstack/react-form';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import _ from 'lodash';
import { createContext, useCallback, useContext } from 'react';
import type { FieldPath } from './utils';
import { buildPath } from './utils';

export function createFormContext<
  TFormData,
  TFormValidator extends Validator<TFormData, unknown> = Validator<TFormData, unknown>
>(options: FormOptions<TFormData, TFormValidator>) {
  type FormContextProps = (FormApi<TFormData, TFormValidator> & ReactFormApi<TFormData, TFormValidator>) | null;

  type FormFieldComponentProps = Parameters<FieldComponent<TFormData, TFormValidator>>[0];

  type FieldComponentProps = Omit<FormFieldComponentProps, 'name'> & {
    field: (data: FieldPath<TFormData>) => string;
  };

  const useFormData = () => useTanStackForm(options);

  const FormContext = createContext<FormContextProps>(null);

  const FormProvider = ({ children }) => <FormContext.Provider value={useFormData()}>{children}</FormContext.Provider>;

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

    const FieldComponent = useCallback(
      ({ children, field, ...fieldOptions }: FieldComponentProps) => {
        const name = field(buildPath(options.defaultValues)).slice(2) as FormFieldComponentProps['name'];

        return (
          <form.Field name={name} {...fieldOptions}>
            {children}
          </form.Field>
        );
      },
      [form]
    );

    return { ...form, setStore, Field: FieldComponent };
  };

  return { FormProvider, useForm };
}
