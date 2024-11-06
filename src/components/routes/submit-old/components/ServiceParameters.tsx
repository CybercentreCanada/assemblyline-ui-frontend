// import {
//   Checkbox,
//   Divider,
//   FormControl,
//   FormControlLabel,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemText,
//   MenuItem,
//   Paper,
//   Select,
//   Skeleton,
//   TextField,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// import useALContext from 'components/hooks/useALContext';
// import type { UserSettings } from 'components/models/base/user_settings';
// import React, { useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useForm } from '../form';
// import { BooleanInput } from '../inputs/BooleanInput';
// import { EnumInput } from '../inputs/EnumInput';
// import { NumberInput } from '../inputs/NumberInput';
// import { TextInput } from '../inputs/TextInput';
// import { ResetButton } from './ServiceAccordion';

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

// type ServiceProps = {
//   cat_id: number;
//   svr_id: number;
//   categoryName: string;
//   service: {
//     category: string;
//     description: string;
//     is_external: boolean;
//     name: string;
//     selected: boolean;
//   };
// };

// const Service: React.FC<ServiceProps> = React.memo(({ cat_id, svr_id, categoryName, service }) => {
//   const theme = useTheme();
//   const form = useForm();

//   const index = useMemo(
//     () => form.store.state.values.settings.service_spec.findIndex(spec => spec.name === service.name),
//     [form.store.state.values.settings.service_spec, service.name]
//   );

//   return (
//     <List
//       component={Paper}
//       dense
//       sx={{
//         '&>:not(:last-child)': {
//           borderBottom: `thin solid ${theme.palette.divider}`
//         }
//       }}
//     >
//       {/* <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
//         <Typography variant="h6">{service.name}</Typography>
//         <Typography variant="body2" color="textSecondary">
//           {service.description}
//         </Typography>
//       </ListItem> */}

//       <form.Field
//         field={store => store.settings.services[cat_id].services[svr_id].selected.toPath()}
//         children={({ state, handleBlur, handleChange }) => (
//           <ListItem
//             id={`${categoryName} - ${service.name}`}
//             secondaryAction={
//               <Checkbox
//                 edge="end"
//                 checked={state.value}
//                 // indeterminate={state.value}
//                 onBlur={handleBlur}
//                 onChange={() => handleChange(!state.value)}
//               />
//             }
//             disablePadding
//             dense
//           >
//             <ListItemButton onClick={() => handleChange(!state.value)}>
//               <ListItemText
//                 primary={service.name}
//                 primaryTypographyProps={{ variant: 'h6' }}
//                 secondary={service.description}
//                 secondaryTypographyProps={{ variant: 'body2' }}
//               />
//             </ListItemButton>
//           </ListItem>
//         )}
//       />

//       {index < 0
//         ? null
//         : form.store.state.values.settings?.service_spec?.[index].params
//             // .sort((a, b) => a.name.localeCompare(b.name))
//             .map((param, p_id) => (
//               <form.Field
//                 key={`${p_id}`}
//                 field={store => store.settings.service_spec[index].params[p_id].value.toPath()}
//                 children={({ state, handleBlur, handleChange }) => {
//                   const primary = param.name.replaceAll('_', ' ');
//                   const secondary = `[${param.type}]`;

//                   switch (param.type) {
//                     case 'str':
//                       return (
//                         <TextInput
//                           primary={primary}
//                           secondary={secondary}
//                           value={state.value}
//                           onBlur={handleBlur}
//                           onChange={handleChange}
//                         />
//                       );
//                     case 'int':
//                       return (
//                         <NumberInput
//                           primary={primary}
//                           secondary={secondary}
//                           value={state.value}
//                           onBlur={handleBlur}
//                           onChange={e => handleChange(parseInt(e.target.value))}
//                         />
//                       );
//                     case 'bool':
//                       return (
//                         <BooleanInput
//                           primary={primary}
//                           secondary={secondary}
//                           value={state.value}
//                           onBlur={handleBlur}
//                           onChange={() => handleChange(!state.value)}
//                         />
//                       );
//                     case 'list':
//                       return (
//                         <EnumInput primary={primary} secondary={secondary} items={param.list} value={state.value} />
//                       );
//                     default:
//                       return (
//                         <TextInput
//                           primary={primary}
//                           secondary={secondary}
//                           value={state.value}
//                           onBlur={handleBlur}
//                           onChange={handleChange}
//                         />
//                       );
//                     // case 'keyword':
//                     //   return (
//                     //     <TextInput
//                     //       primary={name.replace('_', ' ')}
//                     //       secondary={`[${metadata.validator_type}]`}
//                     //       defaultValue={state.value}
//                     //       options={options}
//                     //       onBlur={handleBlur}
//                     //       onChange={v => handleChange(v)}
//                     //     />
//                     //   );
//                     // case 'enum':
//                     //   return (
//                     //     <EnumInput
//                     //       primary={name.replace('_', ' ')}
//                     //       secondary={`[${metadata.validator_type}]`}
//                     //       value={state.value}
//                     //       items={metadata.validator_params.values}
//                     //       onBlur={handleBlur}
//                     //       onChange={e => handleChange(e.target.value)}
//                     //     />
//                     //   );
//                   }
//                 }}
//               />
//             ))}
//     </List>
//   );
// });

// type CategoryProps = {
//   cat_id: number;
//   category: {
//     name: string;
//     selected: boolean;
//     services: {
//       category: string;
//       description: string;
//       is_external: boolean;
//       name: string;
//       selected: boolean;
//     }[];
//   };
// };

// const Category: React.FC<CategoryProps> = React.memo(({ cat_id, category }) => {
//   const theme = useTheme();
//   const form = useForm();

//   return (
//     <>
//       {/* <div style={{ marginBottom: theme.spacing(2) }}>
//         <div>
//           <Typography variant="h5">{category.name}</Typography>
//           <Divider />
//         </div>
//       </div> */}

//       <form.Field
//         field={store => store.settings.services[cat_id].selected.toPath()}
//         children={({ state, handleBlur, handleChange }) => (
//           <ListItem
//             id={category.name}
//             secondaryAction={
//               <Checkbox
//                 edge="end"
//                 checked={state.value}
//                 onBlur={handleBlur}
//                 onChange={() => handleChange(!state.value)}
//                 // onChange={handleToggle(value)}
//                 // checked={checked.includes(value)}
//               />
//             }
//             disablePadding
//             dense
//             sx={{ marginTop: theme.spacing(1), borderBottom: `thin solid ${theme.palette.divider}` }}
//           >
//             <ListItemButton>
//               <ListItemText primary={category.name} primaryTypographyProps={{ variant: 'h5' }} />
//             </ListItemButton>
//           </ListItem>
//         )}
//       />

//       {category.services
//         .sort((a, b) => a.name.localeCompare(b.name))
//         .map((service, svr_id) => (
//           <Service key={svr_id} cat_id={cat_id} svr_id={svr_id} categoryName={category.name} service={service} />
//         ))}
//     </>
//   );
// });

// type Props = {
//   settings?: UserSettings;
// };

// const WrappedServiceParameters = ({ settings }: Props) => {
//   const { t, i18n } = useTranslation(['submit', 'settings']);
//   const theme = useTheme();
//   const classes = useStyles();
//   const form = useForm();
//   const { user: currentUser, c12nDef, configuration } = useALContext();

//   console.log(settings);

//   const sp1 = theme.spacing(1);
//   const sp2 = theme.spacing(2);
//   const sp4 = theme.spacing(4);

//   return (
//     <>
//       {form.store.state.values.settings?.services
//         // .sort((a, b) => a.name.localeCompare(b.name))
//         .map((category, cat_id) => (
//           <Category key={cat_id} cat_id={cat_id} category={category} />
//         ))}
//     </>
//   );

//   return (
//     <>
//       {settings?.services
//         .sort((a, b) => a.name.localeCompare(b.name))
//         .map((category, cat_id) => (
//           <>
//             <div style={{ marginBottom: theme.spacing(2) }}>
//               <Typography variant="h5">{category.name}</Typography>
//               <Divider />
//             </div>

//             {category.services
//               .sort((a, b) => a.name.localeCompare(b.name))
//               .map((service, svr_id) => (
//                 <>
//                   <div>
//                     <form.Field
//                       field={store => store.settings.deep_scan.toPath()}
//                       children={({ state, handleBlur, handleChange }) => (
//                         <ListItemButton onClick={e => handleChange(!state.value)}>
//                           <ListItemText primary={service.name} secondary={service.description} />
//                           {!form.state.values.settings ? (
//                             <Skeleton style={{ height: '2rem', width: '1.5rem', marginLeft: sp2, marginRight: sp2 }} />
//                           ) : (
//                             <Checkbox
//                               size="small"
//                               // checked={param.value}
//                               name="label"
//                               // onChange={() => setParam(idx, pidx, !param.value)}
//                             />
//                           )}
//                         </ListItemButton>
//                       )}
//                     />
//                   </div>

//                   {settings.service_spec
//                     .find(spec => spec.name === service.name)
//                     ?.params.map((param, p_id) => (
//                       <div key={p_id}>
//                         {param.type === 'bool' ? (
//                           <div>
//                             <FormControlLabel
//                               control={
//                                 <Checkbox
//                                   size="small"
//                                   // checked={param.value}
//                                   name="label"
//                                   // onChange={() => setParam(idx, pidx, !param.value)}
//                                 />
//                               }
//                               label={
//                                 <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
//                                   {param.name.replace(/_/g, ' ')}
//                                   <ResetButton
//                                     value={param.value}
//                                     defaultValue={param.default}
//                                     // hasResetButton={hasResetButton}
//                                     // reset={() => setParam(idx, pidx, param.default)}
//                                   />
//                                 </Typography>
//                               }
//                               // className={classes.item}
//                               // disabled={disabled}
//                             />
//                           </div>
//                         ) : (
//                           <>
//                             <div>
//                               <Typography
//                                 variant="caption"
//                                 gutterBottom
//                                 style={{ textTransform: 'capitalize' }}
//                                 color="textSecondary"
//                               >
//                                 {param.name.replace(/_/g, ' ')}
//                                 <ResetButton
//                                   value={param.value}
//                                   defaultValue={param.default}
//                                   // hasResetButton={hasResetButton}
//                                   // reset={() => {
//                                   //   setValue(param.default);
//                                   //   setParam(idx, pidx, param.default);
//                                   // }}
//                                 />
//                               </Typography>
//                             </div>
//                             {param.type === 'list' ? (
//                               <FormControl size="small" fullWidth>
//                                 <Select
//                                   // disabled={disabled}
//                                   value={param.value}
//                                   variant="outlined"
//                                   // onChange={event => setParam(idx, pidx, event.target.value)}
//                                   fullWidth
//                                 >
//                                   {param.list ? (
//                                     param.list.map((item, i) => (
//                                       <MenuItem key={i} value={item}>
//                                         {item}
//                                       </MenuItem>
//                                     ))
//                                   ) : (
//                                     <MenuItem value="" />
//                                   )}
//                                 </Select>
//                               </FormControl>
//                             ) : param.type === 'str' ? (
//                               <TextField
//                                 variant="outlined"
//                                 // disabled={disabled}
//                                 type="text"
//                                 size="small"
//                                 value={param.value}
//                                 // onChange={event => setParam(idx, pidx, event.target.value)}
//                                 fullWidth
//                               />
//                             ) : (
//                               <TextField
//                                 variant="outlined"
//                                 // disabled={disabled}
//                                 type="number"
//                                 size="small"
//                                 // value={parsedValue}
//                                 // onChange={handleIntChange}
//                                 fullWidth
//                               />
//                             )}
//                           </>
//                         )}
//                       </div>
//                     ))}
//                 </>
//               ))}
//           </>
//         ))}
//     </>
//   );
// };

// export const ServiceParameters = React.memo(WrappedServiceParameters);
export const test = null;
