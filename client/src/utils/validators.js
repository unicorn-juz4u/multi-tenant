import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordErrorMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';

export const registerSchema = z.object({
  tenantName: z.string().trim().min(2, 'Tenant name must be at least 2 characters').max(100),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().regex(passwordRegex, passwordErrorMessage),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const projectFormSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(120),
  description: z.string().trim().max(2000).optional().default(''),
  status: z.enum(['planning', 'active', 'completed', 'on_hold', 'archived']).default('active'),
});

export const userFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().regex(passwordRegex, passwordErrorMessage),
  role: z.enum(['admin', 'member']).default('member'),
});

export const userEditSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['admin', 'member']),
  isActive: z.boolean(),
});

export const tenantFormSchema = z.object({
  name: z.string().trim().min(2, 'Organization name must be at least 2 characters').max(100),
  plan: z.enum(['free', 'pro', 'enterprise']),
});
