const { getPaymentStatus } = require('../../utils/payment');
const orderStore = require('../../utils/orderStore');

const formatDateId = (isoDate) => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

module.exports = async (ctx) => {
  await ctx.answerCbQuery();

  const userId = ctx.from.id;
  const order = orderStore.getOrder(userId);

  if (!order) {
    return await ctx.editMessageText(
      '⚠️ Tidak ada transaksi terakhir yang ditemukan. Silakan buat invoice baru terlebih dahulu.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Kembali', callback_data: 'btn_home' }]],
        },
      }
    );
  }

  try {
    const statusData = await getPaymentStatus(order.refId);

    if (statusData.payment_status === 'paid') {
      const successMessage = `🎉 TERIMAKASIH SUDAH JOIN\n━━━━━━━━━━━━━━━━━━━━\n📦 Join: (https://t.me/+OELBeU9M4g0xZmQ1)\n📅 berlaku hingga: ** ${formatDateId(statusData.paid_at || order.expires_at)} WIB**\n💳 Pembayaran: **Rp ${order.amount.toLocaleString('id-ID')}**\n🆔 ID Transaksi: <code>${statusData.trx_id || order.trx_id || order.refId}</code>\n[**⚠️ Harap Meluangkan Waktu Untuk Baca Rules  **](https://t.me/aturmedia/26)\n━━━━━━━━━━━━━━━━━━━━\n\nTerima kasih telah mendukung MEDIA HUNTERS! 🔥`;

      orderStore.clearOrder(userId);

      return await ctx.editMessageText(successMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: 'Menu Utama', callback_data: 'btn_home' }]],
        },
      });
    }

    return await ctx.editMessageText(
      `⏳ Status pembayaran masih *${statusData.payment_status || 'pending'}*. Silakan tunggu sampai pembayaran terdeteksi dan coba lagi.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Cek Lagi', callback_data: 'btn_check_status' }],
            [{ text: 'Kembali', callback_data: 'btn_home' }],
          ],
        },
      }
    );
  } catch (err) {
    console.error('btn_check_status error:', err);
    return await ctx.editMessageText(`❌ Gagal memeriksa status pembayaran:\n${err.message}`, {
      reply_markup: {
        inline_keyboard: [[{ text: 'Kembali', callback_data: 'btn_home' }]],
      },
    });
  }
};
