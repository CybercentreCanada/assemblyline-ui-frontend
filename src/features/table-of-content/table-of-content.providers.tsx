import { createFormContext } from 'features/form';
import type { TableOfContentAnchor, TableOfContentStore } from 'features/table-of-content';
import type { MutableRefObject, PropsWithChildren, ReactNode, SyntheticEvent } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

//*****************************************************************************************
// Table of Content Store
//*****************************************************************************************

/** Default state for a table-of-content store. */
export const DEFAULT_TABLE_OF_CONTENT_STORE: TableOfContentStore = {
  activeID: null,
  anchors: []
};

export const { FormProvider: TableOfContentFormProvider, useForm: useTableOfContentForm } =
  createFormContext<TableOfContentStore>({
    defaultValues: structuredClone(DEFAULT_TABLE_OF_CONTENT_STORE)
  });

//*****************************************************************************************
// Table of Content Context
//*****************************************************************************************

/** Context API exposed by the table-of-content provider. */
export type TableOfContentContextProps = {
  /** Ref for the scrollable content root. */
  rootRef: MutableRefObject<HTMLDivElement | null>;
  /** Ref for the fixed header within the content root. */
  headerRef: MutableRefObject<HTMLDivElement | null>;
  /** Registers or refreshes an anchor. */
  loadAnchors: (props?: Partial<TableOfContentAnchor>) => void;
  /** Scrolls the content root to an anchor. */
  scrollTo: (event: SyntheticEvent, id: string) => void;
  /** Renders registered anchors. */
  Anchors: (props: { children: (anchors: TableOfContentAnchor[]) => ReactNode }) => ReactNode;
  /** Renders content for the active state of an anchor. */
  ActiveAnchor: (props: { activeID: string | null; children: (active: boolean) => ReactNode }) => ReactNode;
};

export const TableOfContentContext = createContext<TableOfContentContextProps | null>(null);

export const useTableOfContent = (): TableOfContentContextProps => {
  const context = useContext(TableOfContentContext);
  if (!context) {
    throw new Error('useTableOfContent must be used inside <TableOfContentProvider>');
  }
  return context;
};

//*****************************************************************************************
// Table of Content Provider
//*****************************************************************************************

export type TableOfContentProviderProps = PropsWithChildren<{
  /** Scroll behavior used when navigating to an anchor. */
  behavior?: ScrollOptions['behavior'];
}>;

export const TableOfContentProvider = memo(({ behavior = 'smooth', children }: TableOfContentProviderProps) => {
  const form = useTableOfContentForm();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  /**
   * @name Anchors
   * @description Renders content with the current registered table-of-content anchors.
   * @param props - Render callback receiving the current anchors.
   * @returns The rendered subscribed content.
   */
  const Anchors = useMemo<TableOfContentContextProps['Anchors']>(
    () =>
      ({ children: render }) => (
        <form.Subscribe selector={s => s.values.anchors} children={anchors => render(anchors)} />
      ),
    [form]
  );

  /**
   * @name ActiveAnchor
   * @description Renders content based on whether the requested anchor is currently active.
   * @param props - Anchor identifier and render callback.
   * @returns The rendered subscribed content.
   */
  const ActiveAnchor = useMemo<TableOfContentContextProps['ActiveAnchor']>(
    () =>
      ({ activeID, children: render }) => (
        <form.Subscribe selector={s => s.values.activeID === activeID} children={isActive => render(isActive)} />
      ),
    [form]
  );

  /**
   * @name findActive
   * @description Finds the last anchor above the header boundary and stores it as active.
   * @returns Nothing when no scrollable root or header is available.
   */
  const findActive = useCallback((): void => {
    const root = rootRef.current;
    const header = headerRef.current;
    if (!root || !header) return;

    const headerOffset = header.getBoundingClientRect().height;
    const rootTop = root.getBoundingClientRect().top;
    const elements = root.querySelectorAll('[data-anchor]');

    for (let index = elements.length - 1; index >= 0; index -= 1) {
      const element = elements.item(index);
      if (!element) continue;

      if (element.getBoundingClientRect().top - 2 <= rootTop + headerOffset) {
        const id = element.getAttribute('data-anchor');
        if (id) form.setFieldValue('activeID', id);
        break;
      }
    }
  }, [form]);

  /**
   * @name loadAnchors
   * @description Reads anchors from the content root and refreshes the registered anchor state.
   * @param props - Optional anchor metadata to apply to the matching element.
   * @returns Nothing when no scrollable root is available.
   */
  const loadAnchors = useCallback<TableOfContentContextProps['loadAnchors']>(
    ({ id, label, subheader = false } = {}) => {
      const root = rootRef.current;
      if (!root) return;

      const elements = root.querySelectorAll('[data-anchor]');
      const previous = form.getFieldValue('anchors');
      const next: TableOfContentAnchor[] = [];

      elements.forEach(element => {
        const anchorID = element.getAttribute('data-anchor');
        if (!anchorID) return;

        if (id === anchorID) {
          next.push({ id, label: label ?? '', subheader });
        } else {
          const previousAnchor = previous.find(anchor => anchor.id === anchorID);
          if (previousAnchor) next.push(previousAnchor);
        }
      });

      form.setFieldValue('activeID', null);
      form.setFieldValue('anchors', next);
    },
    [form]
  );

  /**
   * @name scrollTo
   * @description Scrolls the content root to an anchor while accounting for the fixed header height.
   * @param event - Event whose default navigation and propagation should be prevented.
   * @param id - Anchor identifier to locate and scroll into view.
   * @returns Nothing when the root, header, or target anchor is unavailable.
   */
  const scrollTo = useCallback<TableOfContentContextProps['scrollTo']>(
    (event, id) => {
      event.preventDefault();
      event.stopPropagation();

      const root = rootRef.current;
      const header = headerRef.current;
      if (!root || !header) return;

      const element = root.querySelector<HTMLDivElement>(`[data-anchor='${id}']`);
      if (!element) return;

      const headerOffset = header.getBoundingClientRect().height;
      root.scrollTo({
        top: element.offsetTop - root.offsetTop - headerOffset,
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
    <TableOfContentContext.Provider value={{ rootRef, headerRef, loadAnchors, scrollTo, Anchors, ActiveAnchor }}>
      {children}
    </TableOfContentContext.Provider>
  );
});

TableOfContentProvider.displayName = 'TableOfContentProvider';

//*****************************************************************************************
// Table of Content Layout
//*****************************************************************************************

export const TableOfContentLayout = memo(({ behavior, children }: TableOfContentProviderProps) => (
  <TableOfContentFormProvider>
    <TableOfContentProvider behavior={behavior}>{children}</TableOfContentProvider>
  </TableOfContentFormProvider>
));

TableOfContentLayout.displayName = 'TableOfContentLayout';
