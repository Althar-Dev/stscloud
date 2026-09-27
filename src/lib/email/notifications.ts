
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

    /*
    const mailOptions = {
      from: '"STSCloud Guard" <stscloud.id@gmail.com>',
      to: email,
      subject: `[STSCloud] Server Stopped: ${resourceType} Limit Reached`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ef4444; text-align: center;">Resource Limit Reached</h2>
          <p>Hello,</p>
          <p>Your server <strong>${serverName}</strong> has been automatically stopped because it reached its <strong>${resourceType}</strong> allocation limit.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Resource: <strong>${resourceType}</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Current Usage: <span style="color: #ef4444;">${currentValue}</span></p>
            <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Package Limit: <strong>${limitValue}</strong></p>
          </div>

          <p>To prevent performance degradation of other nodes, the system has suspended this instance. Please upgrade your plan or optimize your application before restarting.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://client.stscloud.id" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} StarVale Technology Solution. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    */

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

    /*
    const mailOptions = {
      from: '"STSCloud Billing" <stscloud.id@gmail.com>',
      to: email,
      subject: `[STSCloud] Perhatian: Server ${serverName} Akan Kedaluwarsa dalam 24 Jam`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1; text-align: center;">Peringatan Kedaluwarsa</h2>
          <p>Halo,</p>
          <p>Kami ingin menginformasikan bahwa masa aktif server Anda <strong>${serverName}</strong> akan berakhir dalam waktu kurang dari 24 jam.</p>
          
          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">Status: <strong>Akan Segera Berakhir</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #92400e;">Tanggal Berakhir: <strong>${new Date(expiryDate).toLocaleString('id-ID')}</strong></p>
          </div>

          <p>Jika masa aktif berakhir, server Anda akan otomatis dihentikan dan masuk ke mode <strong>Read-Only</strong>. Untuk menghindari gangguan layanan, silakan lakukan perpanjangan sekarang melalui tab Billing di Dashboard.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://client.stscloud.id" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Perpanjang Sekarang</a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Abaikan email ini jika Anda sudah melakukan perpanjangan atau tidak ingin melanjutkan layanan.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} StarVale Technology Solution. Dikelola oleh Alhadi Adriano.<br/>
            Infrastruktur Cloud Next-Gen Indonesia.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    */

    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer Expiration Error:', error);
    return { success: false, error: error.message };
  }
}
