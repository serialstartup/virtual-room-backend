import type { Request } from 'express';

export interface User {
  id: string
  name: string
  email: string
  premium_status: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface UserWithPassword extends User {
  password_hash: string
}

export interface SignupRequest {
  name?: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  name: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: Omit<User, 'password_hash'>
    token: string
    expires_in: number
  }
  error?: string
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload
}

export interface UserSettings {
  id: string
  user_id: string
  push_notifications: boolean
  email_notifications: boolean
  new_features: boolean
  language: string
  created_at: string
}

export interface UpdateUserSettingsRequest {
  push_notifications?: boolean
  email_notifications?: boolean
  new_features?: boolean
  language?: string
}