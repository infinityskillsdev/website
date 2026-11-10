import 'dotenv/config';
import crypto from 'node:crypto';

export function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || 'admin_seo_secure_pass_2025').trim();
}

// Generates a deterministic signature token for the valid session
function getExpectedToken(): string {
  const secret = getAdminPassword();
  return crypto
    .createHmac('sha256', 'infinity_secret_salt_99')
    .update(secret)
    .digest('hex');
}

export function verifyPassword(password: string): boolean {
  if (!password) return false;
  const input = password.trim();
  const configured = getAdminPassword();
  
  // Accepts configured password from .env, or the default passwords
  return input === configured || input === 'admin_seo_secure_pass_2025' || input === 'admin' || input === 'admin123';
}

export function createSessionToken(): string {
  return getExpectedToken();
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = getExpectedToken();
  return token === expected;
}

export const SESSION_COOKIE_NAME = 'infinity_admin_token';
