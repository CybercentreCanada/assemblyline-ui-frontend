import z from 'zod';

export const AppAuthSettingsSchema = z.object({
  login: z
    .object({
      allow_saml_login: z.boolean().optional(),
      allow_signup: z.boolean().optional(),
      allow_userpass_login: z.boolean().optional(),
      oauth_providers: z.array(z.string()).optional()
    })
    .optional(),
  redirectTo: z.string(),
  preferredMethod: z.string()
});

export type AppAuthSettings = z.infer<typeof AppAuthSettingsSchema>;

export type AppAuthConfig = AppAuthSettings & {
  mode: 'login' | 'loading' | 'locked' | 'quota' | 'tos' | 'app' | 'logout';
  disableWhoAmI: boolean;
};
