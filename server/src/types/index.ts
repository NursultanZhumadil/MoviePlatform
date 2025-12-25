import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: 'Admin' | 'User';
  } | null;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'Admin' | 'User';
  };
}

export interface JwtUserPayload extends JwtPayload {
  userId: string;
  email: string;
  role: 'Admin' | 'User';
}

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}

