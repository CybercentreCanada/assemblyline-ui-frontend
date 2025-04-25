import { createFormContext } from 'components/core/form/createFormContext';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';

export type TableOfContentStore = {
  activeID: string;
  anchors: { id: string; label: string; subheader: boolean }[];
};

const TABLE_OF_CONTENT_STORE: TableOfContentStore = Object.freeze({
  activeID: null,
  anchors: []
});

const { FormProvider, useForm } = createFormContext<TableOfContentStore>({
  defaultValues: structuredClone(TABLE_OF_CONTENT_STORE)
});

export type TableOfContentContextProps = {
  rootRef: React.MutableRefObject<HTMLDivElement>;
  headerRef: React.MutableRefObject<HTMLDivElement>;
  loadAnchors: (props?: { id?: string; label?: string; subheader?: boolean }) => void;
  scrollTo: (event: React.SyntheticEvent, activeAnchor: string) => void;
  Anchors: React.FC<{ children: (anchors: TableOfContentStore['anchors']) => React.ReactNode }>;
  ActiveAnchor: React.FC<{
    activeID: TableOfContentStore['activeID'];
    children: (active: boolean) => React.ReactNode;
  }>;
};

export const TableOfContentContext = React.createContext<TableOfContentContextProps>(null);

export function useTableOfContent(): TableOfContentContextProps {
  return useContext(TableOfContentContext);
}

export type TableOfContentProps = {
  behavior?: ScrollOptions['behavior'];
  children?: React.ReactNode;
};

export const TableOfContent: React.FC<TableOfContentProps> = React.memo(
  ({ behavior = 'smooth', children = null }: TableOfContentProps) => {
    const form = useForm();

    const rootRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const Anchors = useMemo<TableOfContentContextProps['Anchors']>(
      () =>
        ({ children: render }) => (
          <form.Subscribe selector={state => state.values.anchors} children={anchors => render(anchors)} />
        ),
      [form]
    );

    const ActiveAnchor = useMemo<TableOfContentContextProps['ActiveAnchor']>(
      () =>
        ({ activeID, children: render }) => (
          <form.Subscribe selector={state => activeID === state.values.activeID} children={active => render(active)} />
        ),
      [form]
    );

    const findActive = useCallback(() => {
      const elements = rootRef.current?.querySelectorAll('[data-anchor]');
      for (let i = elements.length - 1; i >= 0; i--) {
        if (
          elements.item(i).getBoundingClientRect().top - 2 <=
          rootRef.current.getBoundingClientRect().top + headerRef.current.getBoundingClientRect().height
        ) {
          form.setFieldValue('activeID', elements.item(i).getAttribute('data-anchor'));
          break;
        }
      }
    }, [form]);

    const loadAnchors = useCallback<TableOfContentContextProps['loadAnchors']>(
      ({ id = null, label = null, subheader = false }) => {
        const elements = rootRef.current?.querySelectorAll('[data-anchor]');
        const prevAnchors = form.getFieldValue('anchors');
        const nextAnchors: TableOfContentStore['anchors'] = [];

        (elements || []).forEach((element: Element) => {
          const anchorID = element.getAttribute('data-anchor');
          const index = prevAnchors.findIndex(a => a.id === anchorID);
          if (id === anchorID) nextAnchors.push({ id, label, subheader });
          else if (index >= 0) nextAnchors.push(prevAnchors[index]);
        });

        form.setFieldValue('activeID', null);
        form.setFieldValue('anchors', nextAnchors);
      },
      [form]
    );

    const scrollTo = useCallback<TableOfContentContextProps['scrollTo']>(
      (event, activeAnchor) => {
        event.preventDefault();
        event.stopPropagation();

        const element: HTMLDivElement = rootRef.current.querySelector("[data-anchor='" + activeAnchor + "']");
        rootRef.current.scrollTo({
          top: element.offsetTop - rootRef.current.offsetTop - headerRef.current.getBoundingClientRect().height,
          behavior: behavior
        });
      },
      [behavior]
    );

    useEffect(() => {
      const rootElement = rootRef.current;
      if (!rootElement) return;

      rootElement.addEventListener('scroll', findActive, false);
      return () => {
        rootElement.removeEventListener('scroll', findActive, false);
      };
    }, [findActive]);

    return (
      <TableOfContentContext.Provider value={{ rootRef, headerRef, loadAnchors, scrollTo, Anchors, ActiveAnchor }}>
        {children}
      </TableOfContentContext.Provider>
    );
  }
);

export const TableOfContentProvider = React.memo((props: TableOfContentProps) => (
  <FormProvider>
    <TableOfContent {...props} />
  </FormProvider>
));

export default TableOfContentProvider;
