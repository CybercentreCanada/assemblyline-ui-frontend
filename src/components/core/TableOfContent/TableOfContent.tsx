import { createFormContext } from 'components/core/form/createFormContext';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';

export type TableOfContentStore = {
  active?: number;
  anchors?: { id: string; label: string; subheader: boolean }[];
};

const TABLE_OF_CONTENT_STORE: TableOfContentStore = Object.freeze({
  active: null,
  anchors: []
});

const { FormProvider, useForm } = createFormContext<TableOfContentStore>({
  defaultValues: structuredClone(TABLE_OF_CONTENT_STORE)
});

export type TableOfContentContextProps = {
  rootRef: React.MutableRefObject<HTMLDivElement>;
  headerRef: React.MutableRefObject<HTMLDivElement>;
  loadAnchors: (props?: { id?: string; label?: string; subheader?: boolean }) => void;
  scrollTo: (event: React.SyntheticEvent, index: number) => void;
  Anchors: React.FC<{ children: (anchors: TableOfContentStore['anchors']) => React.ReactNode }>;
  ActiveAnchor: React.FC<{
    anchorIndex: TableOfContentStore['active'];
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

    const rootRef = useRef<HTMLDivElement>();
    const headerRef = useRef<HTMLDivElement>();

    const Anchors = useMemo<TableOfContentContextProps['Anchors']>(
      () =>
        ({ children: render }) =>
          <form.Subscribe selector={state => state.values.anchors} children={anchors => render(anchors)} />,
      [form]
    );

    const ActiveAnchor = useMemo<TableOfContentContextProps['ActiveAnchor']>(
      () =>
        ({ anchorIndex, children: render }) =>
          (
            <form.Subscribe
              selector={state => anchorIndex === state.values.active}
              children={active => render(active)}
            />
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
          form.setStore(s => {
            s.active = i;
            return s;
          });
          break;
        }
      }
    }, [form]);

    const loadAnchors = useCallback<TableOfContentContextProps['loadAnchors']>(
      ({ id = null, label = null, subheader = false }) => {
        form.setStore(s => {
          const elements = rootRef.current?.querySelectorAll('[data-anchor]');
          const anchors: TableOfContentStore['anchors'] = [];

          elements.forEach(element => {
            const anchorID = element.getAttribute('data-anchor');
            const index = s.anchors.findIndex(a => a.id === anchorID);
            if (id === anchorID) anchors.push({ id, label, subheader });
            else if (index >= 0) anchors.push(s.anchors[index]);
          });

          s.active = null;
          s.anchors = anchors;
          return s;
        });
      },
      [form]
    );

    const scrollTo = useCallback<TableOfContentContextProps['scrollTo']>(
      (event, index) => {
        event.preventDefault();
        event.stopPropagation();

        const anchor = form.getFieldValue(`anchors[${index}].id`) as string;
        const element: HTMLDivElement = rootRef.current.querySelector("[data-anchor='" + anchor + "']");
        rootRef.current.scrollTo({
          top: element.offsetTop - rootRef.current.offsetTop - headerRef.current.getBoundingClientRect().height,
          behavior: behavior
        });
      },
      [behavior, form]
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
