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
  width: `max(${theme.spacing(5)}, 28px)`,
  height: `max(${theme.spacing(5)}, 28px)`,
  [theme.breakpoints.down('sm')]: {
    width: `max(${theme.spacing(4)}, 24px)`,
    height: `max(${theme.spacing(4)}, 24px)`
  }
}));
