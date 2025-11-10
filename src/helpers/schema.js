import z from 'zod';

export const loginSchema = z.object({
  email: z.string('Email is required').email(),
  password: z
    .string('Password is required')
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(50, { message: 'Password must be at most 50 characters long' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string('Email is required').email(),
});

export const resetPasswordSchema = z.object({
  token: z.string('Token is required'),
  newPassword: z
    .string('Password is required')
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

export const createTicketSchema = z.object({
  service_id: z.string('Service is required'),
  description: z
    .string('Description is required')
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(1000, { message: 'Description must be at most 1000 characters' }),
  priority: z.enum(['normal', 'medium', 'high']).optional(),
  branch_id: z.string().optional().nullable(),
  asset_id: z.string().optional().nullable(),
  scheduled_date: z.string('Date is required'),
});

export const approveRejectQuotationSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
});

export const completeTicketSchema = z.object({
  notes: z
    .string()
    .max(500, { message: 'Notes must be at most 500 characters' })
    .optional(),
});

export const addTicketNoteSchema = z.object({
  text: z
    .string('Note text is required')
    .min(1, { message: 'Note text is required' })
    .max(500, { message: 'Note text must be at most 500 characters' }),
});

export const createBranchSchema = z.object({
  name: z.string('Name is required').min(2).max(100),
  address: z.string('Address is required').min(10).max(200),
  city: z.string('City is required').min(2).max(50),
  area: z.string().optional(),
  map_link: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  is_main_branch: z.boolean().optional(),
});

export const createAssetSchema = z.object({
  name: z.string('Name is required').min(2).max(100),
  asset_type: z.enum([
    'equipment',
    'vehicle',
    'property',
    'furniture',
    'technology',
    'other',
  ]),
  branch_id: z.string('Branch is required'),
  description: z.string().optional(),
  maintenance_interval_days: z.number().min(1).max(365),
  brand: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'retired']),
  images: z.array(z.string()).optional(),
  serial_number: z.string(),
  model_number: z.string(),
  images: z.array(z.string()).optional(),
});

export const createUserSchema = z.object({
  first_name: z.string('First name is required').min(2).max(50),
  last_name: z.string('Last name is required').min(2).max(50),
  email: z.string('Email is required').email(),
  phone: z.string('Phone is required').min(10).max(15),
  password: z.string('Password is required').min(6).max(100),
  branch_id: z.string().optional().nullable(),
  role: z.enum(['company_admin', 'branch_admin']),
  permissions: z
    .object({
      can_book_services: z.boolean().optional(),
      can_complete_bookings: z.boolean().optional(),
      can_view_worker_contacts: z.boolean().optional(),
      can_manage_assets: z.boolean().optional(),
      can_manage_branches: z.boolean().optional(),
      can_manage_users: z.boolean().optional(),
    })
    .optional(),
  status: z.enum(['active', 'suspended']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string('Current password is required'),
  newPassword: z
    .string('New password is required')
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

export const createBookingSchema = z.object({
  branch_id: z.string().optional().nullable(),
  asset_id: z.string().optional().nullable(),
  service_id: z.string('Service is required'),
  sub_services: z.array(z.string()).optional(),
  description: z.string('Description is required').min(10).max(500),
  scheduled_start: z.string().optional(),
  location: z.object({
    address: z.string('Address is required'),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
});

export const completeBookingSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'wallet', 'company_account']),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  completion_notes: z.string().optional(),
});
