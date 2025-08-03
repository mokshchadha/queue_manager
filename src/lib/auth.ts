import jwt from 'jsonwebtoken';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export function signToken(payload: User): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    console.error(error)
    return null;
  }
}

export function setAuthCookie(headers: Headers, token: string): void {
  headers.set('Set-Cookie', 
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
  );
}

export function clearAuthCookie(headers: Headers): void {
  headers.set('Set-Cookie', 
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  );
}