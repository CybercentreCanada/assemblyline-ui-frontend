import type { AvatarProps } from '@mui/material';
import { Avatar } from '@mui/material';
import md5 from 'md5';
import { useMemo } from 'react';
import useAppConfigs from '../app/hooks/useAppConfigs';

export type GravatarD = '404' | 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';

export default function AppAvatar({
  d,
  url,
  email,
  ...props
}: { d?: GravatarD; url?: string; email?: string } & Omit<AvatarProps, 'src'>) {
  const configs = useAppConfigs();

  const avatarUrl = useMemo(
    () =>
      url ||
      (configs.preferences.allowGravatar
        ? `https://s.gravatar.com/avatar/${email ? md5(email as string) : ''}?d=${d || configs.preferences.avatarD}`
        : null),
    [configs, url, email, d]
  );

  return (
    <Avatar
      {...props}
      sx={{
        ...(props.sx || {})
      }}
      src={avatarUrl}
    />
  );
}
