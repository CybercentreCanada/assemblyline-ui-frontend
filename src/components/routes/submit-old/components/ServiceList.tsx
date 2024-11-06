// import { Checkbox, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// import useALContext from 'components/hooks/useALContext';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { useForm } from '../form';

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

// type ItemProps = {
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

// const Item: React.FC<ItemProps> = React.memo(({ cat_id, category }) => {
//   const theme = useTheme();
//   const form = useForm();

//   return (
//     <>
//       <form.Field
//         field={store => store.settings.services[cat_id].selected.toPath()}
//         children={({ state, handleBlur, handleChange }) => (
//           <ListItem
//             key={cat_id}
//             secondaryAction={
//               <Checkbox
//                 edge="end"
//                 inputProps={{ 'aria-labelledby': category.name }}
//                 checked={state.value}
//                 onBlur={handleBlur}
//                 onChange={() =>
//                   form.setStore(s => {
//                     if (state.value) {
//                       s.settings.services[cat_id].selected = false;
//                       s.settings.services[cat_id].services = s.settings.services[cat_id].services.map(srv => ({
//                         ...srv,
//                         selected: false
//                       }));
//                     } else {
//                       s.settings.services[cat_id].selected = true;
//                       s.settings.services[cat_id].services = s.settings.services[cat_id].services.map(srv => ({
//                         ...srv,
//                         selected: true
//                       }));
//                     }

//                     console.log(s);

//                     return s;
//                   })
//                 }
//               />
//             }
//             disablePadding
//             sx={{ marginTop: theme.spacing(1) }}
//           >
//             <ListItemButton
//               onClick={() => {
//                 const element = document.getElementById(`${category.name}`);
//                 element.scrollIntoView({ behavior: 'smooth' });
//               }}
//             >
//               <ListItemText primary={category.name} primaryTypographyProps={{ color: 'textSecondary' }} />
//             </ListItemButton>
//           </ListItem>
//         )}
//       />

//       {category.services
//         // .sort((a, b) => a.name.localeCompare(b.name))
//         .map((service, svr_id) => (
//           <form.Field
//             key={`${cat_id}-${svr_id}`}
//             field={store => store.settings.services[cat_id].services[svr_id].selected.toPath()}
//             children={({ state, handleBlur, handleChange }) => (
//               <ListItem
//                 secondaryAction={
//                   <Checkbox
//                     edge="end"
//                     inputProps={{ 'aria-labelledby': service.name }}
//                     checked={state.value}
//                     onBlur={handleBlur}
//                     onChange={() =>
//                       form.setStore(s => {
//                         if (state.value) {
//                           s.settings.services[cat_id].selected = false;
//                           s.settings.services[cat_id].services[svr_id].selected = false;
//                         } else {
//                           s.settings.services[cat_id].services[svr_id].selected = true;
//                           s.settings.services[cat_id].selected = s.settings.services[cat_id].services.every(
//                             srv => srv.selected
//                           );
//                         }

//                         return s;
//                       })
//                     }
//                   />
//                 }
//                 disablePadding
//                 sx={
//                   {
//                     // borderLeft: `1px solid ${theme.palette.primary.main}`
//                   }
//                 }
//               >
//                 <ListItemButton
//                   onClick={() => {
//                     const element = document.getElementById(`${category.name} - ${service.name}`);
//                     element.scrollIntoView({ behavior: 'smooth' });
//                   }}
//                 >
//                   <ListItemText
//                     id={`${svr_id}`}
//                     primary={service.name}
//                     // primaryTypographyProps={{ color: 'primary.main' }}
//                     style={{ marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
//                   />
//                 </ListItemButton>
//               </ListItem>
//             )}
//           />
//         ))}
//     </>
//   );
// });

// const WrappedServiceList = () => {
//   const { t, i18n } = useTranslation(['submit', 'settings']);
//   const theme = useTheme();
//   const classes = useStyles();
//   const form = useForm();
//   const { user: currentUser, c12nDef, configuration } = useALContext();

//   const sp1 = theme.spacing(1);
//   const sp2 = theme.spacing(2);
//   const sp4 = theme.spacing(4);

//   return (
//     <List
//       dense
//       sx={{
//         // bgcolor: 'background.paper',
//         '& ul': { padding: 0 }
//       }}
//     >
//       {form.store.state.values.settings?.services
//         // .sort((a, b) => a.name.localeCompare(b.name))
//         .map((category, cat_id) => (
//           <Item key={cat_id} cat_id={cat_id} category={category} />
//         ))}
//     </List>
//   );
// };

// export const ServiceList = React.memo(WrappedServiceList);
export const test = null;
