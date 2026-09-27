
'use server';

import nodemailer from 'nodemailer';

/**
 * @fileOverview Layanan pengiriman email notifikasi untuk batas penggunaan sumber daya dan kedaluwarsa.
 * Dikelola oleh StarVale Technology Solution (Alhadi Adriano).
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

export async function sendResourceLimitNotification(
  email: string, 
  serverName: string, 
  resourceType: 'Disk' | 'CPU' | 'RAM', 
  currentValue: string, 
  limitValue: string
) {
  try {
    console.log(`[Email Service Disabled] Resource limit notification skipped for ${email} (${serverName})`);
    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer Resource Error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendExpirationReminderNotification(
  email: string,
  serverName: string,
  expiryDate: string
) {
  try {
    console.log(`[Email Service Disabled] Expiration reminder notification skipped for ${email} (${serverName})`);
    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer Expiration Error:', error);
    return { success: false, error: error.message };
  }
}
