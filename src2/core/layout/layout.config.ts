import { z } from 'zod';

//*****************************************************************************************
// App Layout Settings & Config
//*****************************************************************************************

export const AppLayoutSettingsSchema = z.object({
  cookies: z.object({
    autoHideAppbar: z.boolean().optional(),
    density: z.enum(['comfortable', 'compact', 'dense']).optional(),
    drawerOpen: z.boolean().optional(),
    lang: z.string().optional(),
    layout: z.enum(['side', 'top']).optional(),
    mode: z.enum(['light', 'dark', 'system']).optional(),
    showBreadcrumbs: z.boolean().optional(),
    showQuickSearch: z.boolean().optional(),
    theme: z.string().optional()
  })
});

export type AppLayoutSettings = z.infer<typeof AppLayoutSettingsSchema>;

export type AppLayoutConfig = AppLayoutSettings & {
  usermenu: {
    open: boolean;
  };
};
