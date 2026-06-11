require('dotenv').config();

module.exports = {
  token: process.env.TELEGRAM_TOKEN,
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL,
  goMerchantApiKey: process.env.GO_MERCHANT_APIKEY,
  goMerchantProject: process.env.GO_MERCHANT_PROJECT,
  goMerchantBaseUrl: process.env.GO_MERCHANT_BASE_URL || 'https://api.gomerchant.web.id',
  isDevelopment: process.env.NODE_ENV === 'development',
};
