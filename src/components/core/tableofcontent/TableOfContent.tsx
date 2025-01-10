import { createFormContext } from 'components/core/form/createFormContext';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';

export type TableOfContentStore = {
  active?: string;
  anchors?: string[];
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
  loadAnchors: () => void;
  scrollTo: (event: React.SyntheticEvent, anchor: string) => void;
  Anchors: React.FC<{
    children: (anchors: TableOfContentStore['anchors'], active: TableOfContentStore['active']) => React.ReactNode;
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
          (
            <form.Subscribe
              selector={state => [state.values.anchors, state.values.active]}
              children={([anchors, active]) =>
                render(anchors as TableOfContentStore['anchors'], active as TableOfContentStore['active'])
              }
            />
          ),
      [form]
    );

    const loadAnchors = useCallback(() => {
      form.setStore(s => {
        const elements = rootRef.current?.querySelectorAll('[data-anchor]');

        s.anchors = [];
        elements.forEach(element => {
          s.anchors.push(element.textContent);
        });

        return s;
      });
    }, [form]);

    const scrollTo = useCallback(
      (event: React.SyntheticEvent, anchor: string) => {
        event.preventDefault();
        event.stopPropagation();

        const element: HTMLDivElement = rootRef.current.querySelector("[data-anchor='" + anchor + "']");
        rootRef.current.scrollTo({
          top: element.offsetTop - rootRef.current.offsetTop - headerRef.current.getBoundingClientRect().height,
          behavior: behavior
        });
      },
      [behavior]
    );

    const isElementInViewport = useCallback((element: Element) => {
      const rect = element.getBoundingClientRect();
      const offsetTop = headerRef.current.getBoundingClientRect().bottom;
      return (
        rect.top >= offsetTop &&
        rect.bottom <= offsetTop + (window.innerHeight || document.documentElement.clientHeight)
      );
    }, []);

    useEffect(() => {
      const rootElement = rootRef.current;
      if (!rootElement) return;

      const handler = () => {
        const elements = rootRef.current?.querySelectorAll('[data-anchor]');
        for (let i = 0; i < elements.length; i++) {
          if (isElementInViewport(elements.item(i))) {
            form.setStore(s => {
              s.active = elements.item(i).textContent;
              return s;
            });
            break;
          }
        }
      };

      handler();
      rootElement.addEventListener('scroll', handler, false);
      return () => {
        rootElement.removeEventListener('scroll', handler, false);
      };
    }, [form, isElementInViewport]);

    return (
      <TableOfContentContext.Provider value={{ rootRef, headerRef, loadAnchors, scrollTo, Anchors }}>
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
