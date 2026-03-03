import { z } from 'zod';

// Email validation stricter
const emailSchema = z.string().email().toLowerCase().max(255);

// Strong password: min 12 chars, uppercase, lowercase, number, special char
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// ============================================================
// AUTHENTICATION SCHEMAS
// ============================================================

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password required'),
  turnstileToken: z.string().optional(), // Will be required in middleware
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  companyName: z.string().max(255).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  agreeToTerms: z.literal(true),
  turnstileToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ResetPasswordSchema = z.object({
  email: emailSchema,
  token: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const Enable2FASchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Token must be 6 digits'),
});

export type Enable2FAInput = z.infer<typeof Enable2FASchema>;

export const Verify2FASchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Token must be 6 digits'),
  backupCode: z.string().optional(),
}).refine((data) => data.token || data.backupCode, {
  message: 'Either token or backup code required',
});

export type Verify2FAInput = z.infer<typeof Verify2FASchema>;

// ============================================================
// PRODUCTS & ORDERS SCHEMAS
// ============================================================

export const CreateProductSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Price must be positive'),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  sku: z.string().max(100),
  category: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1),
  shippingAddress: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    region: z.string().min(2),
    postalCode: z.string().regex(/^[0-9]{5,}$/, 'Invalid postal code'),
    country: z.string().length(2), // ISO country code
  }),
  paymentMethod: z.enum(['credit_card', 'mobile_money', 'bank_transfer']),
  notes: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ============================================================
// ADMIN SCHEMAS
// ============================================================

export const AdminImpersonationSchema = z.object({
  userId: z.string(),
  reason: z.string().min(5).max(500), // Audit trail
  duration: z.number().int().min(5).max(480), // 5 min to 8 hours
});

export type AdminImpersonationInput = z.infer<typeof AdminImpersonationSchema>;

export const BulkOperationSchema = z.object({
  ids: z.array(z.string()).min(1).max(1000),
  action: z.enum(['delete', 'archive', 'publish', 'unpublish', 'updateStatus']),
  status: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type BulkOperationInput = z.infer<typeof BulkOperationSchema>;

// ============================================================
// CONTENT & CMS SCHEMAS
// ============================================================

export const CreatePageSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(10),
  publishedAt: z.date().optional(),
  scheduledPublishAt: z.date().optional(),
  isPreview: z.boolean().default(false),
  metadata: z.object({
    description: z.string().max(160),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export type CreatePageInput = z.infer<typeof CreatePageSchema>;

// ============================================================
// UTILITY FUNCTION
// ============================================================

/**
 * Validate input against schema and throw formatted errors
 */
export async function validateInput<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError('Input validation failed', formatted);
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
