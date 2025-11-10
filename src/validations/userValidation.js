const { z } = require('zod');

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin']).default('user')
});

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['user', 'admin']).optional()
});

const validateUser = (data) => {
  try {
    return { data: userSchema.parse(data), error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

const validateUserUpdate = (data) => {
  try {
    return { data: userUpdateSchema.parse(data), error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

module.exports = {
  validateUser,
  validateUserUpdate,
  userSchema,
  userUpdateSchema
};