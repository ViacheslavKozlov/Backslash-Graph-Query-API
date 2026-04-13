import { ErrorResponseSchema } from './route-query.schema.js';

export const commonResponses = {
  error400: { 400: ErrorResponseSchema },
  error500: { 500: ErrorResponseSchema },
  errors: { 400: ErrorResponseSchema, 500: ErrorResponseSchema },
} as const;
