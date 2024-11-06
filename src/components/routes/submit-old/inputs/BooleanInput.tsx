// import type { ListItemButtonProps, ListItemTextProps } from '@mui/material';
// import { ListItem, ListItemButton, ListItemText, Skeleton, Switch, useTheme } from '@mui/material';
// import React from 'react';

// type Props = ListItemButtonProps & {
//   primary?: ListItemTextProps['primary'];
//   secondary?: ListItemTextProps['secondary'];
//   loading?: boolean;
//   value: boolean;
// };

// const WrappedBooleanInput = ({ primary, secondary, loading = false, value, ...other }: Props) => {
//   const theme = useTheme();

//   return (
//     <ListItem disablePadding>
//       <ListItemButton {...other}>
//         <ListItemText
//           primary={primary}
//           secondary={secondary}
//           style={{ marginRight: theme.spacing(2) }}
//           primaryTypographyProps={{ variant: 'body1', whiteSpace: 'nowrap', textTransform: 'capitalize' }}
//         />
//         {loading ? (
//           <Skeleton
//             style={{ height: '2rem', width: '1.5rem', marginLeft: theme.spacing(2), marginRight: theme.spacing(2) }}
//           />
//         ) : (
//           <Switch checked={value} edge="end" />
//         )}
//       </ListItemButton>
//     </ListItem>
//   );
// };

// export const BooleanInput = React.memo(WrappedBooleanInput);
export const test = null;
