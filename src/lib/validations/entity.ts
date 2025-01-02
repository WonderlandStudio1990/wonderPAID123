import { z } from 'zod';

export const MoniteEntityMetadataSchema = z.object({
  user_id: z.string(),
  email: z.string().nullable(),
  created_at: z.string()
});

export const MoniteEntitySettingsSchema = z.object({
  currency: z.string(),
  timezone: z.string()
});

export const EntityCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['individual', 'organization']),
  status: z.enum(['active', 'inactive']).optional(),
  metadata: MoniteEntityMetadataSchema.optional(),
  settings: MoniteEntitySettingsSchema.optional()
});

export const UserEntityCreateSchema = z.object({
  user_id: z.string().uuid(),
  entity_id: z.string()
});

export type EntityCreate = z.infer<typeof EntityCreateSchema>;
export type UserEntityCreate = z.infer<typeof UserEntityCreateSchema>;
export type MoniteEntityMetadata = z.infer<typeof MoniteEntityMetadataSchema>;
export type MoniteEntitySettings = z.infer<typeof MoniteEntitySettingsSchema>;