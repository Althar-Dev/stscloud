const axios = require('axios');
const config = require('../config');

const BASE_URL = config.goMerchantBaseUrl || 'https://api.gomerchant.web.id';

const ensureConfig = () => {
  if (!config.goMerchantApiKey) {
    throw new Error('GO_MERCHANT_APIKEY tidak ditemukan. Tambahkan ke file .env');
  }
  if (!config.goMerchantProject) {
    throw new Error('GO_MERCHANT_PROJECT tidak ditemukan. Tambahkan ke file .env');
  }
};

const createOrder = async ({ refId, amount, customerName, expired = 15 }) => {
  ensureConfig();

  if (!refId) {
    throw new Error('Parameter refId diperlukan untuk membuat pesanan QRIS');
  }
  if (!amount || typeof amount !== 'number') {
    throw new Error('Parameter amount harus berupa angka dan tidak boleh kosong');
  }

  const payload = {
    apikey: config.goMerchantApiKey,
    nama_project: config.goMerchantProject,
    ref_id: refId,
    amount,
    customer_name: customerName || undefined,
    expired,
  };

  try {
    const response = await axios.post(`${BASE_URL}/order`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    if (!response?.data) {
      throw new Error('Respons API GoMerchant tidak valid');
    }

    const data = response.data;
    if (data.status !== 'success') {
      throw new Error(`GoMerchant error: ${data.message || 'Unknown error'}`);
    }

    return data.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Gagal membuat order GoMerchant';
    throw new Error(message);
  }
};

const getPaymentStatus = async (refId) => {
  ensureConfig();

  if (!refId) {
    throw new Error('Parameter refId diperlukan untuk mengecek status pembayaran');
  }

  const payload = {
    apikey: config.goMerchantApiKey,
    ref_id: refId,
  };

  try {
    const response = await axios.post(`${BASE_URL}/status`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    if (!response?.data) {
      throw new Error('Respons status GoMerchant tidak valid');
    }

    const data = response.data;
    if (data.status !== 'success') {
      throw new Error(`GoMerchant status error: ${data.message || 'Unknown error'}`);
    }

    return data.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Gagal memeriksa status pembayaran';
    throw new Error(message);
  }
};

module.exports = {
  createOrder,
  getPaymentStatus,
};
