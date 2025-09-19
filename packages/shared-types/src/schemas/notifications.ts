import { z } from 'zod';

export const NotificationItemSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  message: z.string().min(1),
  createdAt: z.union([z.string(), z.number()]),
});

export const NotificationsResponseSchema = z.object({
  userId: z.string().min(1),
  notifications: z.array(NotificationItemSchema),
});

export type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;
