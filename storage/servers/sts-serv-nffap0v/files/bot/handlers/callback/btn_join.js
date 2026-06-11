const { createOrder } = require('../../utils/payment');
const orderStore = require('../../utils/orderStore');

const generateRefId = () => `INV-${Date.now()}`;

module.exports = async (ctx) => {
  await ctx.answerCbQuery('Anda memilih Join Sekarang.');

  const refId = generateRefId();
  const amount = 2000;
  const customerName = ctx.from.username || ctx.from.first_name || 'Customer';

  try {
    const order = await createOrder({
      refId,
      amount,
      customerName,
      expired: 15,
    });

    orderStore.saveOrder(ctx.from.id, {
      refId,
      amount,
      customerName,
      trx_id: order.trx_id,
      expires_at: order.expires_at,
    });

    const qrUrl = order.payment_detail?.qr_image || order.payment_detail?.qr_string;
    const caption = `🧾 <b>Invoice Media Hunters  - Qris</b>\n━━━━━━━━━━━━━━━━━\n💰 Nominal: Rp ${amount}\n📦 Join:  <b>Media Hunters</b>\n🆔 ID Transaksi: <code>${refId}</code>\n📖 Tutorial Pembayaran: /tutorial\n\nPindai kode QRIS ini menggunakan aplikasi pembayaran kamu\n▸ setelah pembayaran terverifikasi link invite akan automatis di kirim`;

    if (!qrUrl) {
      throw new Error('QRIS image tidak tersedia dari GoMerchant');
    }

    try {
      await ctx.deleteMessage();
    } catch (deleteErr) {
      console.warn('Tidak dapat menghapus pesan lama:', deleteErr.message);
    }

    await ctx.replyWithPhoto({ url: qrUrl }, {
      caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Cek Status', callback_data: 'btn_check_status' }],
          [{ text: 'Kembali', callback_data: 'btn_home' }],
        ],
      },
    });
  } catch (err) {
    console.error('btn_join error:', err);
    return await ctx.reply(`❌ Gagal membuat invoice QRIS:\n${err.message}`);
  }
};
