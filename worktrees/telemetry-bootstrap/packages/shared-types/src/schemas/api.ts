import { z } from 'zod';

export const ApiSuccessEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.literal(true),
  data: dataSchema,
  message: z.string().optional(),
});

export const ApiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.any(),
  message: z.string().optional(),
});

export const ApiEnvelopeSchema = (dataSchema: z.ZodTypeAny) => z.union([
  ApiSuccessEnvelopeSchema(dataSchema),
  ApiErrorEnvelopeSchema,
]);