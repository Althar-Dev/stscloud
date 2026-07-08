
'use server';

import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';

/**
 * @fileOverview Server actions for authentication processes and cross-subdomain session management.
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'stscloud.id@gmail.com',
    pass: 'nfyu mquz burm ynlm',
  },
});

export async function sendVerificationCode(email: string, code: string) {
  try {
    const mailOptions = {
      from: '"STSCloud" <stscloud.id@gmail.com>',
      to: email,
      subject: 'Verify your STSCloud Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">STSCloud Verification</h2>
          <p>Hello,</p>
          <p>You are receiving this email because you are trying to create an account on STSCloud. Please use the following code to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6366f1; background: #f0f1ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #6366f1;">${code}</span>
          </div>
          <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} STSCloud Infrastructure. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
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

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('sts_session');
}
