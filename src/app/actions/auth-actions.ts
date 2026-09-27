
'use server';

import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';

/**
 * @fileOverview Server actions for authentication processes and cross-subdomain session management.
 */

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'stscloud.id@gmail.com',
    pass: 'frxjjgbpfxgpagmm',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendVerificationCode(email: string, code: string) {
  try {
    console.log(`[Email Service Disabled] Verification code for ${email}: ${code}`);
    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer Error:', error);
    return { success: false, error: error.message };
  }
}

export async function setSessionCookie(uid: string) {
  const cookieStore = await cookies();
  cookieStore.set('sts_session', uid, {
    domain: '.stscloud.id', // Share across all subdomains
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('sts_session');
  return session?.value || null;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('sts_session', { domain: '.stscloud.id', path: '/' });
}
