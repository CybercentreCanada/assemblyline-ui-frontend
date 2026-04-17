import { Avatar, styled, type AvatarProps } from '@mui/material';
import type { FC } from 'react';

export type AppAvatarProps = { url?: string; email?: string } & Omit<AvatarProps, 'src'>;

export const AppAvatar: FC<AppAvatarProps> = ({ url, ...props }) => {
  return (
    <Avatar
      {...props}
      sx={{
        ...(props.sx || {}),
        '&:hover': {
          cursor: 'pointer'
        }
      }}
      src={url}
    />
  );
};

export const AppUserAvatar: FC<AppAvatarProps> = styled(AppAvatar)(({ theme }) => ({
  width: theme.spacing(5),
  height: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  }
}));
