import { z } from 'zod';

export const zTime = z
  .string()
  .datetime()
  .transform(arg => (arg === 'NOW' ? new Date().toISOString() : arg))
  .pipe(z.coerce.date())
  .default(new Date().toISOString())
  .catch(new Date());

export function makeResultSchema<Schema extends z.ZodTypeAny>(schema: Schema) {
  return z.object({
    items: z.array(schema).describe('items'),
    offset: z.number().default(0).catch(0).describe('offset of the items'),
    rows: z.number().default(0).catch(0).describe('number of items returned'),
    total: z.number().default(0).catch(0).describe('total number of items in the search result')
  });
}

export function getDefaults<Schema extends z.AnyZodObject>(schema: Schema) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()];
      return [key, undefined];
    })
  );
}

// TODO: implement a function that generates an array containing a description
export function getDescription<Schema extends z.AnyZodObject>(schema: Schema) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) return [key, value._def.description];
      return [key, undefined];
    })
  );
}
