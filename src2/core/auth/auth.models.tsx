import { z } from 'zod';

export const AppAuthSettingsSchema = z.object({
  login: z
    .object({
      allowSAML: z.boolean().optional(),
      allowSignup: z.boolean().optional(),
      allowUserPass: z.boolean().optional(),
      oAuthProviders: z.array(z.string()).optional()
    })
    .optional()
});

export type AppAuthSettings = z.infer<typeof AppAuthSettingsSchema>;

export type AppAuthConfig = AppAuthSettings & {};
