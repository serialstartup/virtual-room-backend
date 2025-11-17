import { z } from 'zod';
export declare const signupSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export type SignupSchemaType = z.infer<typeof signupSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
