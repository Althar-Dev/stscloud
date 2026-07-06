
'use server';

import nodemailer from 'nodemailer';

/**
 * @fileOverview Layanan pengiriman email notifikasi untuk batas penggunaan sumber daya.
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'stscloud.id@gmail.com',
    pass: 'nfyu mquz burm ynlm',
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
            <a href="https://stscloud.id/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} STSCloud Infrastructure. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer Resource Error:', error);
    return { success: false, error: error.message };
  }
}
