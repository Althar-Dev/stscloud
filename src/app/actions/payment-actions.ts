'use server';

import { SValePay } from "@starvale-sdk/svalepay";

// Initialize SValePay with placeholder credentials for prototyping
const svale = new SValePay({
  businessId: process.env.SVALEPAY_BUSINESS_ID || "SVP-STSCLOUD",
  secretKey: process.env.SVALEPAY_SECRET_KEY || "svp_live_stscloud_key"
});

export async function createSvalePayment(input: {
  amount: number;
  email: string;
  external_id: string;
  description: string;
}) {
  try {
    const response = await svale.createPayment({
      amount: input.amount,
      payment_method: "QRIS",
      customer_email: input.email,
      external_id: input.external_id,
      description: input.description
    });

    if (response.status === "success") {
      const invoiceUrl = svale.generateQr({
        code: response.data.payment_code,
        amount: input.amount,
        reference: input.external_id,
        template: "default",
        theme: "light",
        uppercase: true
      });

      return {
        success: true,
        data: {
          ...response.data,
          qr_url: invoiceUrl
        }
      };
    }

    return { success: false, error: "Failed to create payment" };
  } catch (error: any) {
    console.error("SValePay Error:", error);
    return { success: false, error: error.message || "A system error occurred" };
  }
}

export async function checkPaymentStatus(trxId: string) {
  try {
    const status = await svale.getStatus(trxId);
    return { success: true, status: status.data.status };
  } catch (error: any) {
    console.error("Status Check Error:", error);
    return { success: false, error: error.message };
  }
}
