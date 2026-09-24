import { createFormContext } from 'components/core/form/createFormContext';
import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';

export type TableOfContentAnchor = {
  id: string;
  label: string;
  subheader: boolean;
};

export type TableOfContentStore = {
  activeID: string | null;
  anchors: TableOfContentAnchor[];
};

export type TableOfContentContextProps = {
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
  loadAnchors: (props?: Partial<TableOfContentAnchor>) => void;
  scrollTo: (event: React.SyntheticEvent, id: string) => void;
  Anchors: React.FC<{ children: (anchors: TableOfContentAnchor[]) => React.ReactNode }>;
  ActiveAnchor: React.FC<{ activeID: string | null; children: (active: boolean) => React.ReactNode }>;
};

const TABLE_OF_CONTENT_STORE: TableOfContentStore = Object.freeze({
  activeID: null,
  anchors: []
});

const { FormProvider, useForm } = createFormContext<TableOfContentStore>({
  defaultValues: structuredClone(TABLE_OF_CONTENT_STORE)
});

export const TableOfContentContext = React.createContext<TableOfContentContextProps | null>(null);

export const useTableOfContent = (): TableOfContentContextProps => {
  const ctx = useContext(TableOfContentContext);
  if (!ctx) {
    throw new Error('useTableOfContent must be used inside <TableOfContentProvider>');
  }
  return ctx;
};

export type TableOfContentProps = {
  behavior?: ScrollOptions['behavior'];
  children?: React.ReactNode;
};

export const TableOfContent: React.FC<TableOfContentProps> = React.memo(({ behavior = 'smooth', children }) => {
  const form = useForm();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const Anchors = useMemo<TableOfContentContextProps['Anchors']>(
    () =>
      ({ children: render }) => (
        <form.Subscribe selector={s => s.values.anchors} children={anchors => render(anchors)} />
      ),
    [form]
  );

  const ActiveAnchor = useMemo<TableOfContentContextProps['ActiveAnchor']>(
    () =>
      ({ activeID, children: render }) => (
        <form.Subscribe selector={s => s.values.activeID === activeID} children={isActive => render(isActive)} />
      ),
    [form]
  );

  const findActive = useCallback(() => {
    const root = rootRef.current;
    const header = headerRef.current;
    if (!root || !header) return;

    const headerOffset = header.getBoundingClientRect().height;
    const rootTop = root.getBoundingClientRect().top;

    const elements = root.querySelectorAll('[data-anchor]');
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements.item(i);
      if (!el) continue;

      if (el.getBoundingClientRect().top - 2 <= rootTop + headerOffset) {
        const id = el.getAttribute('data-anchor');
        if (id) form.setFieldValue('activeID', id);
        break;
      }
    }
  }, [form]);

  const loadAnchors = useCallback<TableOfContentContextProps['loadAnchors']>(
    ({ id, label, subheader = false } = {}) => {
      const root = rootRef.current;
      if (!root) return;

      const elements = root.querySelectorAll('[data-anchor]');
      const previous = form.getFieldValue('anchors');
      const next: TableOfContentAnchor[] = [];

      elements.forEach(el => {
        const anchorID = el.getAttribute('data-anchor');
        if (!anchorID) return;

        if (id === anchorID) {
          // Updated anchor
          next.push({
            id,
            label: label ?? '',
            subheader
          });
        } else {
          // Existing anchor
          const previousIndex = previous.findIndex(a => a.id === anchorID);
          if (previousIndex >= 0) next.push(previous[previousIndex]);
        }
      });

      form.setFieldValue('activeID', null);
      form.setFieldValue('anchors', next);
    },
    [form]
  );

  const scrollTo = useCallback<TableOfContentContextProps['scrollTo']>(
    (event, id) => {
      event.preventDefault();
      event.stopPropagation();

      const root = rootRef.current;
      const header = headerRef.current;
      if (!root || !header) return;

      const el = root.querySelector<HTMLDivElement>(`[data-anchor='${id}']`);
      if (!el) return;

      const headerOffset = header.getBoundingClientRect().height;

      root.scrollTo({
        top: el.offsetTop - root.offsetTop - headerOffset,
        behavior
      });
    },
    [behavior]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.addEventListener('scroll', findActive, { passive: true });
    return () => root.removeEventListener('scroll', findActive);
  }, [findActive]);

  return (
    <TableOfContentContext.Provider
      value={{
        rootRef,
        headerRef,
        loadAnchors,
        scrollTo,
        Anchors,
        ActiveAnchor
      }}
    >
      {children}
    </TableOfContentContext.Provider>
  );
});

export const TableOfContentProvider = React.memo((props: TableOfContentProps) => (
  <FormProvider>
    <TableOfContent {...props} />
  </FormProvider>
));

export default TableOfContentProvider;
