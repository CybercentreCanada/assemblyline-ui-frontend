import { z } from 'zod';

export const SeveritySchema = z.enum(['success', 'info', 'warning', 'error']).default(null).catch(null);

export const SystemMessageSchema = z.object({
  user: z.string().default('').catch(''),
  title: z.string().default('').catch(''),
  severity: SeveritySchema,
  message: z.string().default('').catch('')
});

export type Severity = z.infer<typeof SeveritySchema>;
export type SystemMessage = z.infer<typeof SystemMessageSchema>;
