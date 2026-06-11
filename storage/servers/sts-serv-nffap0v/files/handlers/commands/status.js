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
  const userId = ctx.from.id;
  const order = orderStore.getOrder(userId);

  if (!order) {
    return await ctx.reply('⚠️ Tidak ada transaksi terbaru yang tersimpan. Silakan buat invoice terlebih dahulu dengan tombol Join Sekarang.');
  }

  try {
    const statusData = await getPaymentStatus(order.refId);

    if (statusData.payment_status === 'paid') {
      orderStore.clearOrder(userId);

      const successMessage = `🎉 TERIMAKASIH SUDAH JOIN\n━━━━━━━━━━━━━━━━━━━━\n📦 Join: (https://t.me/+OELBeU9M4g0xZmQ1)\n📅 berlaku hingga: ** ${formatDateId(statusData.paid_at || order.expires_at)} WIB**\n💳 Pembayaran: **Rp ${order.amount.toLocaleString('id-ID')}**\n🆔 ID Transaksi: <code>${statusData.trx_id || order.trx_id || order.refId}</code>\n[**⚠️ Harap Meluangkan Waktu Untuk Baca Rules  **](https://t.me/aturmedia/26)\n━━━━━━━━━━━━━━━━━━━━\n\nTerima kasih telah mendukung MEDIA HUNTERS! 🔥`;

      return await ctx.reply(successMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    }

    return await ctx.reply(`⏳ Status pembayaran masih *${statusData.payment_status || 'pending'}*. Silakan tunggu sampai pembayaran terdeteksi dan coba lagi.`, {
      parse_mode: 'Markdown',
    });
  } catch (err) {
    console.error('status command error:', err);
    return await ctx.reply(`❌ Gagal memeriksa status pembayaran: ${err.message}`);
  }
};
