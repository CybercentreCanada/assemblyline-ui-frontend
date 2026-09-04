import { Avatar, type AvatarProps } from '@mui/material';

export default function AppAvatar({ url, ...props }: { url?: string; email?: string } & Omit<AvatarProps, 'src'>) {
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
}
