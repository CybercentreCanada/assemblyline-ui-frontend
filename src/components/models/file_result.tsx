import { z } from 'zod';
import { zTime } from './utils/helpers';

export const VerdictSchema = z.enum(['safe', 'info', 'suspicious', 'highly_suspicious', 'malicious']);

export const VERDICT_MAP: Record<Verdict, number> = {
  malicious: 4,
  highly_suspicious: 3,
  suspicious: 2,
  info: 1,
  safe: 0
};

export const AlternateResultSchema = z.object({
  classification: z.string().default('').catch(''),
  created: zTime,
  drop_file: z.boolean().default(false).catch(false),
  from_archive: z.boolean().default(false).catch(false),
  id: z.string().default('').catch(''),
  response: z
    .object({
      service_name: z.string().default('').catch(''),
      service_version: z.string().default('').catch('')
    })
    .default({ service_name: '', service_version: '' })
    .catch({ service_name: '', service_version: '' }),
  result: z
    .object({
      score: z.number().default(0).catch(0)
    })
    .default({ score: 0 })
    .catch({ score: 0 })
});

export const ChildrenSchema = z.object({
  name: z.string().default('').catch(''),
  sha256: z.string().default('').catch('')
});

export const SignatureSchema = z
  .tuple([
    z.string().default('').catch('').describe('signature value'),
    VerdictSchema.default('info').catch('info').describe('signature verdict'),
    z.boolean().default(false).catch(false).describe('is this signature safelisted?')
  ])
  .default(['', 'info', false])
  .catch(['', 'info', false]);

export const TagSchema = z
  .tuple([
    z.string().default('').catch('').describe('tag value'),
    VerdictSchema.default('info').catch('info').describe('tag verdict'),
    z.boolean().default(false).catch(false).describe('is this tag safelisted?'),
    z.string().default('').catch('').describe('tag classification')
  ])
  .default(['', 'info', false, ''])
  .catch(['', 'info', false, '']);

export const FileResultSchema = z.object({
  alternates: z.record(z.string().default('').catch(''), z.array(AlternateResultSchema).default([]).catch([])),
  attack_matrix: z.any(),
  childrens: z.any(),
  classification: z.string().default('').catch('').describe('Classification of the file'),
  errors: z.any(),
  file_info: z.any(),
  file_viewer_only: z.any(),

  heuristics: z.any(),
  metadata: z.any(),
  parents: z.any(),
  results: z.any(),
  signatures: z.array(SignatureSchema).default([]).catch([]),
  tags: z.record(z.string().default('').catch(''), z.array(TagSchema).default([]).catch([]))
});

export type Verdict = z.infer<typeof VerdictSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type FileResult = z.infer<typeof FileResultSchema>;
