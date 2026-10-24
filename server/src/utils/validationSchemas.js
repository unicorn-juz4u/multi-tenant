import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordErrorMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';

export const registerSchema = z.object({
  body: z.object({
    tenantName: z.string().trim().min(2, 'Tenant name must be at least 2 characters').max(100),
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().regex(passwordRegex, passwordErrorMessage),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(120),
    description: z.string().trim().max(2000).optional().default(''),
    status: z.enum(['planning', 'active', 'completed', 'on_hold', 'archived']).optional().default('active'),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.enum(['planning', 'active', 'completed', 'on_hold', 'archived']).optional(),
  }),
});

export const projectQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().optional().default(''),
    status: z.enum(['planning', 'active', 'completed', 'on_hold', 'archived', 'all']).optional().default('all'),
    sort: z.string().trim().default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().regex(passwordRegex, passwordErrorMessage),
    role: z.enum(['admin', 'member']).default('member'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(['admin', 'member']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Tenant name must be at least 2 characters').max(100).optional(),
    plan: z.enum(['free', 'pro', 'enterprise']).optional(),
  }),
});
