import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { useForm } from 'components/routes/development/library/contexts/form';
import React from 'react';

export type ListLibraryState = {
  list: {
    name: string;
    values: {
      classification: string;
      sectionOpen: boolean;
    };
  };
};
export const LIST_LIBRARY_STATE: ListLibraryState = {
  list: {
    name: 'List',
    values: {
      classification: 'TLP:C',
      sectionOpen: true
    }
  }
} as const;

export const ListSection = React.memo(() => {
  const form = useForm();

  return <DemoContainer></DemoContainer>;
});
