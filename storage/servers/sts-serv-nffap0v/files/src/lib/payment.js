import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { SValePay } = require('@starvale-sdk/svalepay');
const { althar } = require('../config/config.js');
const __dirname = dirname(fileURLToPath(import.meta.url));

const svale = new SValePay({
  businessId: althar.svalepay.businessId,
  secretKey: althar.svalepay.secretKey
});

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => reject(err));
    });
  });
}

export async function createPaymentQr(amount, email, outputFileName = 'qris_payment.png', externalId = null, description = 'Pembayaran Produk Digital') {
  const outputPath = resolve(__dirname, outputFileName);

  const response = await svale.createPayment({
    amount,
    payment_method: 'QRIS',
    customer_email: email,
    external_id: externalId,
    description
  });

  const qrString = response.data.payment_code;
  const transactionId = response.data.trx_id;

  const invoiceUrl = svale.generateQr({
    code: qrString,
    amount,
    reference: externalId || transactionId,
    template: response.data.qris_template,
    theme: response.data.qris_theme,
    uppercase: response.data.qris_uppercase,
  });

  await downloadImage(invoiceUrl, outputPath);

  return [qrString, transactionId, outputPath];
}

export async function paidStatus(transactionId) {
  const status = await svale.getStatus(transactionId);
  return status.data.status === 'success';
}
