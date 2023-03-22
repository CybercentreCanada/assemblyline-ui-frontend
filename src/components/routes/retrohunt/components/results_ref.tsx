export const resultsRef = null;
// import ArchiveIcon from '@mui/icons-material/Archive';
// import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
// import { Theme, useMediaQuery, useTheme } from '@mui/material';
// import createStyles from '@mui/styles/createStyles';
// import makeStyles from '@mui/styles/makeStyles';
// import PageHeader from 'commons/components/pages/PageHeader';
// import useALContext from 'components/hooks/useALContext';
// import useMyAPI from 'components/hooks/useMyAPI';
// import useMySnackbar from 'components/hooks/useMySnackbar';
// import SearchBar from 'components/visual/SearchBar/search-bar';
// import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
// import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
// import SearchPager from 'components/visual/SearchPager';
// import FilesTable from 'components/visual/SearchResult/files';
// import SearchResultCount from 'components/visual/SearchResultCount';
// import { useEffect, useRef, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router';
// import { useLocation, useParams } from 'react-router-dom';
// import { Retrohunt } from '.';

// const PAGE_SIZE = 25;

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     tweaked_tabs: {
//       minHeight: 'unset',
//       [theme.breakpoints.up('md')]: {
//         '& [role=tab]': {
//           padding: '8px 20px',
//           fontSize: '13px',
//           minHeight: 'unset',
//           minWidth: 'unset'
//         }
//       },
//       [theme.breakpoints.down('sm')]: {
//         minHeight: 'unset',
//         '& [role=tab]': {
//           fontSize: '12px',
//           minHeight: 'unset',
//           minWidth: 'unset'
//         }
//       }
//     },
//     searchresult: {
//       paddingLeft: theme.spacing(1),
//       color: theme.palette.primary.main,
//       fontStyle: 'italic'
//     }
//   })
// );

// type SearchProps = {
//   index?: string | null;
// };

// type ParamProps = {
//   id: string;
// };

// type SearchResults = {
//   items: any[];
//   offset: number;
//   rows: number;
//   total: number;
// };

// type Props = {
//   retrohunt: Retrohunt;
// };

// export const RetrohuntResults = (props: Props) => {
//   const { id } = useParams<ParamProps>();
//   const { t } = useTranslation(['retrohunt']);
//   const [pageSize] = useState(PAGE_SIZE);
//   const [searching, setSearching] = useState(false);
//   const { indexes, user: currentUser, configuration } = useALContext();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const classes = useStyles();
//   const { apiCall } = useMyAPI();
//   const [query, setQuery] = useState<SimpleSearchQuery>(null);
//   const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);
//   const [tab, setTab] = useState(null);
//   const { showErrorMessage } = useMySnackbar();
//   const downSM = useMediaQuery(theme.breakpoints.down('md'));

//   const [fileResults, setFileResults] = useState<SearchResults>(null);

//   const queryValue = useRef<string>('');

//   const handleChangeTab = (event, newTab) => {
//     navigate(`${location.pathname}?${query.toString()}#${newTab}`);
//   };

//   const onClear = () => {
//     query.delete('query');
//     navigate(`${location.pathname}?${query.toString()}${location.hash}`);
//   };

//   const onSearch = () => {
//     if (queryValue.current !== '') {
//       query.set('query', queryValue.current);
//       navigate(`${location.pathname}?${query.toString()}${location.hash}`);
//     } else {
//       onClear();
//     }
//   };

//   const onFilterValueChange = (inputValue: string) => {
//     queryValue.current = inputValue;
//   };

//   const resetResults = () => {
//     setFileResults(null);
//   };

//   useEffect(() => {
//     // On index change we need to update the search suggestion
//     setSearchSuggestion([
//       ...Object.keys(indexes[index || id] || {}).filter(name => indexes[index || id][name].indexed),
//       ...DEFAULT_SUGGESTION
//     ]);
//   }, [index, id, indexes]);

//   useEffect(() => {
//     // On location.search change we need to change the query object and reset the results
//     setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0&filters=NOT%20to_be_deleted:true`));
//     resetResults();
//   }, [location.search, pageSize]);

//   useEffect(() => {
//     const nextAvailableTab = () => {
//       for (const curTab of [...Object.keys(stateMap)]) {
//         if (currentUser.roles.includes(permissionMap[curTab])) return curTab;
//       }
//       return 'submission';
//     };
//     // On location.hash change, we need to change the tab
//     const newTab = location.hash.substring(1, location.hash.length) || index || id || nextAvailableTab();
//     setTab(newTab);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, index, location.hash]);

//   useEffect(() => {
//     if (query) {
//       queryValue.current = query.get('query', '');
//       if (query.get('query')) {
//         const searchList = [];
//         if (!(index || id)) {
//           searchList.push(...Object.keys(stateMap));
//         } else {
//           searchList.push(tab);
//           if (!searching) setSearching(true);
//         }
//         for (const searchIndex of searchList) {
//           // Do no perform search if user has no rights
//           if (!currentUser.roles.includes(permissionMap[searchIndex])) continue;

//           apiCall({
//             method: 'POST',
//             url: `/api/v4/search/${searchIndex}/`,
//             body: { ...query.getParams(), rows: pageSize, offset: 0 },
//             onSuccess: api_data => {
//               stateMap[searchIndex](api_data.api_response);
//             },
//             onFailure: api_data => {
//               if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
//                 showErrorMessage(api_data.api_error_message);
//               } else {
//                 stateMap[searchIndex]({ total: 0, offset: 0, items: [], rows: pageSize });
//               }
//             },
//             onFinalize: () => {
//               if (index || id) {
//                 setSearching(false);
//               }
//             }
//           });
//         }
//       }
//     }
//     // eslint-disable-next-line
//   }, [query]);

//   const TabSpacer = props => <div style={{ flexGrow: 1 }} />;

//   const SpecialTab = ({ children, ...otherProps }) => children;

//   return (
//     <>
//       <PageHeader isSticky>
//         <div style={{ paddingTop: theme.spacing(1) }}>
//           <SearchBar
//             initValue={query ? query.get('query', '') : ''}
//             searching={searching}
//             placeholder={t(`search_${index || id || 'all'}`)}
//             suggestions={searchSuggestion}
//             onValueChange={onFilterValueChange}
//             onClear={onClear}
//             onSearch={onSearch}
//             buttons={
//               configuration.datastore.archive.enabled &&
//               currentUser.roles.includes('archive_view') &&
//               ['submission', 'result', 'file', 'all'].includes(index || id || 'all')
//                 ? [
//                     {
//                       icon:
//                         query && query.get('use_archive') === 'true' ? (
//                           <ArchiveIcon fontSize={downSM ? 'small' : 'medium'} />
//                         ) : (
//                           <ArchiveOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />
//                         ),
//                       tooltip:
//                         query && query.get('use_archive') === 'true'
//                           ? t('use_archive.turn_off')
//                           : t('use_archive.turn_on'),
//                       props: {
//                         onClick: () => {
//                           query.set(
//                             'use_archive',
//                             !query.has('use_archive') ? 'true' : query.get('use_archive') === 'false'
//                           );
//                           navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
//                         }
//                       }
//                     }
//                   ]
//                 : []
//             }
//           />
//           <div
//             style={{
//               display: 'flex',
//               flexDirection: 'row',
//               flexWrap: 'wrap',
//               marginBottom: theme.spacing(0.5),
//               justifyContent: 'flex-end'
//             }}
//           >
//             {resMap[tab] && resMap[tab].total !== 0 && (index || id) && (
//               <div className={classes.searchresult}>
//                 <SearchResultCount count={resMap[tab].total} />
//                 {t(resMap[tab].total === 1 ? 'matching_result' : 'matching_results')}
//               </div>
//             )}
//             <div style={{ flexGrow: 1 }} />
//             {resMap[tab] && (
//               <SearchPager
//                 total={resMap[tab].total}
//                 setResults={stateMap[tab]}
//                 page={resMap[tab].offset / resMap[tab].rows + 1}
//                 pageSize={pageSize}
//                 index={tab}
//                 query={query}
//                 setSearching={setSearching}
//               />
//             )}
//           </div>
//         </div>
//       </PageHeader>
//       <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
//         {tab === 'file' && query && query.get('query') && (
//           <FilesTable fileResults={fileResults} allowSort={!!(index || id)} />
//         )}
//       </div>
//     </>
//   );
// };
