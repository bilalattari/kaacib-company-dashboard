import z from 'zod';

export const loginSchema = z.object({
  email: z.string('Email is required').email(),
  password: z
    .string('Password is required')
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(50, { message: 'Password must be at most 50 characters long' }),
});
