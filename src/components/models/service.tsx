import { z } from 'zod';

export const ServiceSchema = z.object({
  accepts: z.string().default('').catch(''),
  category: z.string().default('').catch(''),
  classification: z.string().default('').catch(''),
  description: z.string().default('').catch(''),
  enabled: z.boolean().default(false).catch(false),
  is_external: z.boolean().default(false).catch(false),
  name: z.string().default('').catch(''),
  privileged: z.boolean().default(false).catch(false),
  rejects: z.string().default('').catch(''),
  stage: z.string().default('').catch(''),
  version: z.string().default('').catch('')
});

export const ServicesSchema = z.array(ServiceSchema).default([]).catch([]);

export type Service = z.infer<typeof ServiceSchema>;
export type Services = z.infer<typeof ServicesSchema>;
