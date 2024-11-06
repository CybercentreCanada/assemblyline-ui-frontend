// import {
//   Button,
//   Checkbox,
//   CircularProgress,
//   FormControlLabel,
//   Skeleton,
//   TextField,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// import useAppBanner from 'commons/components/app/hooks/useAppBanner';
// import useALContext from 'components/hooks/useALContext';
// import useMyAPI from 'components/hooks/useMyAPI';
// import useMySnackbar from 'components/hooks/useMySnackbar';
// import SubmissionMetadata from 'components/layout/submissionMetadata';
// import { getSubmitType } from 'helpers/utils';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { useLocation, useNavigate } from 'react-router';
// import { Link } from 'react-router-dom';
// import { useForm } from './form';

// const useStyles = makeStyles(theme => ({
//   no_pad: {
//     padding: 0
//   },
//   meta_key: {
//     overflowX: 'hidden',
//     whiteSpace: 'nowrap',
//     textOverflow: 'ellipsis'
//   },
//   item: {
//     marginLeft: 0,
//     width: '100%',
//     '&:hover': {
//       background: theme.palette.action.hover
//     }
//   },
//   buttonProgress: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     marginTop: -12,
//     marginLeft: -12
//   },
//   tweaked_tabs: {
//     [theme.breakpoints.only('xs')]: {
//       '& [role=tab]': {
//         minWidth: '90px'
//       }
//     }
//   }
// }));

// type Props = {
//   onValidateServiceSelection: (cbType: string) => void;
// };

// const WrappedHashSubmit = ({ onValidateServiceSelection }: Props) => {
//   const { t, i18n } = useTranslation(['submit']);
//   const { apiCall } = useMyAPI();
//   const theme = useTheme();
//   const classes = useStyles();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const banner = useAppBanner();
//   const { user: currentUser, c12nDef, configuration } = useALContext();
//   const { showErrorMessage, showSuccessMessage, closeSnackbar } = useMySnackbar();

//   const form = useForm();

//   const sp1 = theme.spacing(1);
//   const sp2 = theme.spacing(2);
//   const sp4 = theme.spacing(4);

//   return (
//     <>
//       <div style={{ display: 'flex', flexDirection: 'row', marginTop: sp2, alignItems: 'flex-start' }}>
//         <form.Field
//           field={store => store.input.toPath()}
//           children={({ state, handleBlur, handleChange }) =>
//             !form.state.values.settings ? (
//               <Skeleton style={{ flexGrow: 1, height: '3rem' }} />
//             ) : (
//               <TextField
//                 label={`${t('urlHash.input_title')}${t('urlHash.input_suffix')}`}
//                 error={state.value.hasError}
//                 size="small"
//                 type="stringInput"
//                 variant="outlined"
//                 value={state.value.value}
//                 style={{ flexGrow: 1, marginRight: '1rem' }}
//                 onBlur={handleBlur}
//                 onChange={event =>
//                   handleChange(prev => {
//                     const [type, value] = getSubmitType(event.target.value, configuration);
//                     closeSnackbar();
//                     return { ...prev, type, value, hasError: false };
//                   })
//                 }
//               />
//             )
//           }
//         />

//         <form.Subscribe
//           selector={state => [state.values.allowClick, state.values.input.type, state.values.input.value]}
//           children={([allowClick, type, value]) =>
//             !form.state.values.settings ? (
//               <Skeleton style={{ marginLeft: sp2, height: '3rem', width: '5rem' }} />
//             ) : (
//               <Button
//                 disabled={!(type && value) || !allowClick}
//                 color="primary"
//                 variant="contained"
//                 onClick={() => onValidateServiceSelection('urlHash')}
//                 style={{ height: '40px' }}
//               >
//                 {type ? `${t('urlHash.button')} ${type}` : t('urlHash.button')}
//                 {!allowClick && <CircularProgress size={24} className={classes.buttonProgress} />}
//               </Button>
//             )
//           }
//         />
//       </div>

//       <form.Subscribe
//         selector={state => [
//           state.values.settings,
//           state.values.input.type,
//           configuration.ui.url_submission_auto_service_selection
//         ]}
//         children={([settings, type, selection]) =>
//           type === 'url' &&
//           selection &&
//           selection.length > 0 && (
//             <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
//               <Typography variant="subtitle1">
//                 {t('options.submission.url_submission_auto_service_selection')}
//               </Typography>
//               {selection.map((service_name, i) => (
//                 <div key={i}>
//                   <FormControlLabel
//                     control={
//                       settings ? (
//                         <Checkbox
//                           size="small"
//                           checked={settings.services.some(category =>
//                             category.services.some(service => service.name === service_name)
//                           )}
//                           name="label"
//                           onChange={() => {
//                             if (!settings) return;
//                             form.setStore(s => {
//                               let services = settings.services.map(cat => ({
//                                 ...cat,
//                                 services: cat.services.map(srv => ({
//                                   ...srv,
//                                   selected: srv.name === service_name ? !srv.selected : srv.selected
//                                 }))
//                               }));

//                               services = services.map(cat => ({ ...cat, selected: cat.every(srv => srv.selected) }));
//                               return { ...s, services };
//                             });
//                           }}
//                         />
//                       ) : (
//                         <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
//                       )
//                     }
//                     label={<Typography variant="body2">{service_name}</Typography>}
//                     className={settings ? classes.item : null}
//                   />
//                 </div>
//               ))}
//             </div>
//           )
//         }
//       />

//       <form.Subscribe
//         selector={state => [state.values.settings, state.values.input.type, configuration.submission.file_sources]}
//         children={([settings, type, file_sources]) =>
//           type &&
//           file_sources[type] &&
//           file_sources[type].sources &&
//           file_sources[type].sources.length > 0 && (
//             <div style={{ textAlign: 'start', marginTop: theme.spacing(1) }}>
//               <Typography variant="subtitle1">{t('options.submission.default_external_sources')}</Typography>
//               {file_sources[type].sources.map((source, i) => (
//                 <div key={i}>
//                   <FormControlLabel
//                     control={
//                       settings ? (
//                         <Checkbox
//                           size="small"
//                           checked={settings.default_external_sources.indexOf(source) !== -1}
//                           name="label"
//                           onChange={() => {
//                             if (!settings) return;
//                             form.setStore(s => {
//                               const newSources = settings.default_external_sources;
//                               if (newSources.indexOf(source) === -1) {
//                                 newSources.push(source);
//                               } else {
//                                 newSources.splice(newSources.indexOf(source), 1);
//                               }
//                               return { ...s, default_external_sources: newSources };
//                             });
//                           }}
//                         />
//                       ) : (
//                         <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
//                       )
//                     }
//                     label={<Typography variant="body2">{source}</Typography>}
//                     className={settings ? classes.item : null}
//                   />
//                 </div>
//               ))}
//             </div>
//           )
//         }
//       />

//       <form.Field
//         field={store => store.submissionMetadata.toPath()}
//         children={({ state, handleChange }) => (
//           <SubmissionMetadata submissionMetadata={state.value} setSubmissionMetadata={value => handleChange(value)} />
//         )}
//       />

//       {!configuration.ui.tos ? null : (
//         <div style={{ marginTop: sp4, textAlign: 'center' }}>
//           <Typography variant="body2">
//             {t('terms1')}
//             <i>{t('urlHash.button')}</i>
//             {t('terms2')}
//             <Link style={{ textDecoration: 'none', color: theme.palette.primary.main }} to="/tos">
//               {t('terms3')}
//             </Link>
//             .
//           </Typography>
//         </div>
//       )}
//     </>
//   );
// };

// export const HashSubmit = React.memo(WrappedHashSubmit);
export const test = null;
