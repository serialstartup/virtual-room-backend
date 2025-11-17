import { z } from 'zod';
export const signupSchema = z.object({
    email: z
        .string()
        .email('Geçerli bir email adresi giriniz')
        .max(255, 'Email adresi çok uzun')
        .toLowerCase(),
    password: z
        .string()
        .min(8, 'Şifre en az 8 karakter olmalıdır')
        .max(100, 'Şifre en fazla 100 karakter olabilir')
});
export const loginSchema = z.object({
    email: z
        .string()
        .email('Geçerli bir email adresi giriniz')
        .toLowerCase(),
    password: z
        .string()
        .min(1, 'Şifre gereklidir')
        .max(100, 'Şifre çok uzun')
});
export const updateUserSchema = z.object({
    name: z
        .string()
        .min(1, 'İsim gereklidir')
        .max(100, 'İsim çok uzun')
        .trim()
});
//# sourceMappingURL=authValidation.js.map