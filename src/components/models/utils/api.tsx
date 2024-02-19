import { z } from 'zod';

export const APIResponse = z.object({
  api_status_code: z.number().default(0).catch(0).describe('Response status code'),
  api_server_version: z.any().default('').catch('').describe('Response server version'),
  api_response: z.any().default(null).catch(null).describe('Response data'),
  api_error_message: z.string().default('').catch('').describe('Response error message')
});
