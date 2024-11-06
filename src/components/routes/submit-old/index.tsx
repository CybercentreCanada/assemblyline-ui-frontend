// import Flow from '@flowjs/flow.js';
// import { Alert, useMediaQuery, useTheme } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// import useAppBanner from 'commons/components/app/hooks/useAppBanner';
// import PageFullSize from 'commons/components/pages/PageFullSize';
// import useALContext from 'components/hooks/useALContext';
// import useMyAPI from 'components/hooks/useMyAPI';
// import useMySnackbar from 'components/hooks/useMySnackbar';
// import type { Metadata } from 'components/models/base/submission';
// import Classification from 'components/visual/Classification';
// import ConfirmationDialog from 'components/visual/ConfirmationDialog';
// import { TabContainer } from 'components/visual/TabContainer';
// import generateUUID from 'helpers/uuid';
// import React, { useCallback, useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useLocation, useNavigate } from 'react-router';
// import { ServiceList } from './components/ServiceList';
// import { FileSubmit } from './file';
// import { FormProvider, useForm } from './form';
// import { HashSubmit } from './hash';
// import { SubmitOptions2 } from './options2';

// const useStyles = makeStyles(theme => ({
//   no_pad: {
//     padding: 0
//   },
//   meta_key: {
//     overFLOWX: 'hidden',
//     whiteSpace: 'nowrap',
//     textOverFLOW: 'ellipsis'
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

// // eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// const FLOW = new Flow({
//   target: '/api/v4/ui/FLOWjs/',
//   permanentErrors: [412, 500, 501],
//   maxChunkRetries: 1,
//   chunkRetryInterval: 500,
//   simultaneousUploads: 4
// });

// const TABS = ['file', 'hash', 'options'] as const;
// type Tabs = (typeof TABS)[number];

// type SubmitState = {
//   hash: string;
//   tabContext: string;
//   c12n: string;
//   metadata?: Metadata;
// };

// type SubmitProps = {
//   none: boolean;
// };

// const WrappedSubmitContent = () => {
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

//   const [tab, setTab] = useState<Tabs>('file');

//   const sp1 = theme.spacing(1);
//   const sp2 = theme.spacing(2);
//   const sp4 = theme.spacing(4);

//   const downSM = useMediaQuery(theme.breakpoints.down('md'));
//   const md = useMediaQuery(theme.breakpoints.only('md'));

//   const submitState = useMemo<SubmitState>(() => location.state as SubmitState, [location.state]);
//   const submitParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

//   const handleValidateServiceSelection = useCallback(() => {
//     // to do
//     console.log(form.store.state.values);
//   }, []);

//   const handleCancelUpload = useCallback(() => {
//     form.setStore(s => ({ ...s, file: null, allowClick: true, uploadProgress: null, uuid: generateUUID() }));
//     FLOW.cancel();
//     FLOW.off('complete');
//     FLOW.off('fileError');
//     FLOW.off('progress');
//   }, [form]);

//   console.log(form.state.values);

//   // useEffect(() => {
//   //   apiCall<UserSettings>({
//   //     url: `/api/v4/user/settings/${currentUser.username}/`,
//   //     onSuccess: ({ api_response }) => {
//   //       console.log(api_response);
//   //       form.setStore(s => {
//   //         s.settings = { ...api_response } as any;

//   //         if (submitState) {
//   //           s.settings.classification = submitState.c12n;
//   //         } else if (submitParams.get('classification')) {
//   //           s.settings.classification = submitParams.get('classification');
//   //         }

//   //         s.settings.default_external_sources = Array.from(
//   //           new Set(
//   //             Object.entries(configuration.submission.file_sources).reduce(
//   //               (prev, [, fileSource]) => [...prev, ...fileSource.auto_selected],
//   //               api_response?.default_external_sources || []
//   //             )
//   //           )
//   //         );

//   //         if (!currentUser.roles.includes('submission_customize')) {
//   //           s.submissionProfile = api_response.preferred_submission_profile;
//   //         }

//   //         return s;
//   //       });
//   //     }
//   //   });

//   //   form.setStore(s => {
//   //     s.uuid = generateUUID();

//   //     // Handle if we've been given input via param
//   //     const inputParam = submitParams.get('input') || '';
//   //     if (inputParam) setTab('hash');
//   //     const [type, value] = getSubmitType(inputParam, configuration);
//   //     closeSnackbar();
//   //     s.input = { type, value, hasError: false };

//   //     // Load the default submission metadata
//   //     if (configuration.submission.metadata && configuration.submission.metadata.submit) {
//   //       const tempMeta = {};
//   //       for (const metaKey in configuration.submission.metadata.submit) {
//   //         const metaConfig = configuration.submission.metadata.submit[metaKey];
//   //         if (metaConfig.default !== null) {
//   //           tempMeta[metaKey] = metaConfig.default;
//   //         }
//   //       }
//   //       if (tempMeta) {
//   //         console.log(tempMeta);

//   //         s.submissionMetadata = { ...tempMeta, ...s.submissionMetadata };
//   //       }
//   //     }

//   //     console.log(configuration.submission.metadata);

//   //     return s;
//   //   });
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);

//   // useEffect(() => {
//   //   // Handle if we've been given input via param
//   //   const inputParam = submitParams.get('input') || '';
//   //   if (inputParam) {
//   //     handleStringChange(inputParam);
//   //     setTab('url');
//   //   }
//   // }, [handleStringChange, submitParams]);

//   // useEffect(() => {
//   //   // Load the default submission metadata
//   //   setSubmissionMetadata(v => ({
//   //     ...(!configuration?.submission?.metadata?.submit
//   //       ? {}
//   //       : Object.entries(configuration.submission.metadata.submit).reduce(
//   //           (prev, [key, metadata]) => (!metadata.default ? prev : { ...prev, [key]: metadata.default }),
//   //           {}
//   //         )),
//   //     ...v
//   //   }));
//   // }, [configuration.submission.metadata.submit]);

//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'row',
//         flexWrap: 'nowrap',
//         maxHeight: 'calc(100vh-64px)',
//         overflowY: 'auto'
//       }}
//     >
//       {/* <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%"> */}
//       <PageFullSize
//         styles={{
//           paper: {
//             width: '100%',
//             alignSelf: 'center',
//             maxWidth: md ? '800px' : downSM ? '100%' : '1024px',
//             padding: theme.spacing(4)
//           }
//         }}
//       >
//         <form.Subscribe
//           selector={state => [state.canSubmit, state.isSubmitting, state.values.validate]}
//           children={([canSubmit, isSubmitting, validate]) => (
//             <ConfirmationDialog
//               open={validate}
//               // handleClose={event => setValidate(false)}
//               handleClose={() => form.store.setState(s => ({ ...s, validate: false }))}
//               // handleCancel={cleanupServiceSelection}
//               // handleAccept={executeCB}
//               handleAccept={() => {}}
//               title={t('validate.title')}
//               cancelText={t('validate.cancelText')}
//               acceptText={t('validate.acceptText')}
//               text={t('validate.text')}
//             />
//           )}
//         />

//         <div style={{ marginBottom: !downSM && !configuration.ui.banner ? '2rem' : null }}>{banner}</div>

//         {configuration.ui.banner && (
//           <Alert severity={configuration.ui.banner_level} style={{ marginBottom: '2rem' }}>
//             {configuration.ui.banner[i18n.language]
//               ? configuration.ui.banner[i18n.language]
//               : configuration.ui.banner.en}
//           </Alert>
//         )}

//         {c12nDef.enforce ? (
//           <form.Field
//             field={store => store.settings.classification.toPath()}
//             children={({ name, state, handleBlur, handleChange }) => (
//               <div style={{ paddingBottom: sp4 }}>
//                 <div style={{ padding: sp1, fontSize: 16 }}>{t('classification')}</div>
//                 <Classification
//                   format="long"
//                   type="picker"
//                   c12n={state.value ? state.value : null}
//                   setClassification={classification => handleChange(classification)}
//                   disabled={!currentUser.roles.includes('submission_create')}
//                 />
//               </div>
//             )}
//           />
//         ) : null}

//         <TabContainer
//           indicatorColor="primary"
//           textColor="primary"
//           paper
//           centered
//           variant="standard"
//           style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
//           tabs={{
//             file: {
//               label: t('file'),
//               inner: (
//                 <FileSubmit
//                   onValidateServiceSelection={handleValidateServiceSelection}
//                   onCancelUpload={handleCancelUpload}
//                 />
//               )
//             },
//             hash: {
//               label: `${t('urlHash.input_title')}${t('urlHash.input_suffix')}`,
//               disabled: !currentUser.roles.includes('submission_create'),
//               inner: <HashSubmit onValidateServiceSelection={handleValidateServiceSelection} />
//             },
//             options: {
//               label: t('options'),
//               inner: (
//                 <SubmitOptions2
//                   onValidateServiceSelection={handleValidateServiceSelection}
//                   onCancelUpload={handleCancelUpload}
//                 />
//               )
//             }
//           }}
//         />
//         {/* </PageCenter> */}
//       </PageFullSize>
//       <div style={{ position: 'sticky', top: '0px', overflowY: 'auto' }}>
//         <ServiceList />
//       </div>
//     </div>
//   );
// };

// const SubmitContent = React.memo(WrappedSubmitContent);

// const WrappedSubmitPage = () => (
//   <FormProvider>
//     <SubmitContent />
//   </FormProvider>
// );

// export const SubmitPage = React.memo(WrappedSubmitPage);
// export default SubmitPage;
export const test = null;
