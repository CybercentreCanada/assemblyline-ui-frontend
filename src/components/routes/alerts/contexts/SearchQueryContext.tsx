// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import { useLocation } from 'react-router';

// type ContextProps = {
//   // defaultQuery: string;
//   // onDefaultQueryChange: (value: string) => void;
//   // onDefaultQueryClear: () => void;

// };

// type Props = {
//   children: React.ReactNode;
//   base: string;
//   hidden?: string[];
//   enforceBase: string[];
// };

// const SearchQueryContext = createContext<ContextProps>(null);

// export const useSearchQuery = (): ContextProps => useContext(SearchQueryContext);

// export const SearchQueryProvider = ({
//   children,
//   base = null,
//   hidden = [],
//   enforceBase = ['offset', 'rows']
// }: Props) => {
//   // const navigate = useNavigate();

//   const location = useLocation();

//   const [defaults, setDefaults] = useState<URLSearchParams>(null);

//   const search = useMemo(() => new URLSearchParams(location.search), [location.search]);

//   // const [defaultQuery, setDefaultQuery] = useState<string>(null);

//   // const onDefaultQueryChange = useCallback(
//   //   (value: string) => {
//   //     localStorage.setItem(storage, value);
//   //     setDefaultQuery(value);
//   //     navigate(`${window.location.pathname}${window.location.hash}`);
//   //   },
//   //   [navigate, storage]
//   // );

//   // const onDefaultQueryClear = useCallback(() => {
//   //   localStorage.removeItem(storage);
//   //   setDefaultQuery(query);
//   //   navigate(`${window.location.pathname}${window.location.hash}`);
//   // }, [navigate, query, storage]);

//   useEffect(() => {
//     const value = localStorage.getItem(storage);
//     const search = new SimpleSearchQuery(value, query);
//     setDefaultQuery(search.toString(['tc_start']));
//   }, [query, storage]);

//   return <SearchQueryContext.Provider value={{}}>{children}</SearchQueryContext.Provider>;
// };

export const test = null;
