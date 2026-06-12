import { Markup } from 'telegraf';
import { stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { althar } from '../config/config.js';
import { findOrderPackage, getOrderConfirmationKeyboard, getOrderMessage, sendOrderMenu, formatCurrency } from '../utils/order.js';
import { createPaymentQr, paidStatus } from '../lib/payment.js';
import {
  buildAddMainKeyboard,
  buildSetMainKeyboard,
  buildDeleteMainKeyboard,
  buildDeleteProductCategoryKeyboard,
  buildMenuCategoryKeyboard,
  buildMenuProductKeyboard,
  getMenuProductText,
  buildProductCategoryKeyboard,
  buildCategoryKeyboard,
  buildProductKeyboard,
  buildProductFieldKeyboard,
  getCategoryById,
  getProductByIndex,
  getProductsPage,
  hasCategories,
  loadProdukData,
  isAdmin,
  deleteCategory,
  deleteProduct,
} from '../utils/produk.js';
import { loadTestimoniData, deleteTestimoni, buildTestimoniKeyboard } from '../utils/testimoni.js';

const MAX_TESTIMONI_BYTES = 50 * 1024 * 1024;
const bannerImagePath = fileURLToPath(new URL('../images/banner.png', import.meta.url));
const pendingPayments = new Map();

function getStartKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Menu', 'show_menu'), Markup.button.callback('Testimoni', 'show_testimoni')],
    [Markup.button.callback('Support', 'support'), Markup.button.callback('Bot Info', 'bot_info')],
  ]);
}

function getHomeKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('Home', 'back_to_start')]]);
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getStartText(ctx) {
  const name = ctx.from?.first_name || ctx.from?.username || 'Teman';
  return `👋 <b>Welcome!</b>
<blockquote>Halo ${name}! Selamat datang di toko kami silahkan pilih menu di bawah ini:</blockquote>\n\n` +
      `<b>Jangan cuma di lihat tapi di order ya betie</b> 😁\n\n`;
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function scheduleDeleteMessages(ctx, messages) {
  const chatId = ctx.chat.id;
  const messageIds = messages
    .map((msg) => msg?.message_id)
    .filter((id) => typeof id === 'number');

  setTimeout(async () => {
    for (const messageId of messageIds) {
      try {
        await ctx.telegram.deleteMessage(chatId, messageId);
      } catch {
      }
    }
  }, 60 * 1000);
}

async function deleteCurrentMessageAndReply(ctx, text, markup) {
  try {
    await ctx.deleteMessage();
  } catch {
  }
  return ctx.reply(text, { parse_mode: 'HTML', ...markup });
}

async function safeShowTestimoni(ctx) {
  const testimonials = await loadTestimoniData();
  const sorted = [...testimonials].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const selected = [];
  let totalSize = 0;

  for (const item of sorted) {
    if (!item.localPath) continue;
    const photoPath = item.localPath.startsWith('file://') ? fileURLToPath(item.localPath) : item.localPath;
    try {
      const stats = await stat(photoPath);
      if (!stats.isFile()) continue;
      if (stats.size > MAX_TESTIMONI_BYTES || totalSize + stats.size > MAX_TESTIMONI_BYTES) continue;
      totalSize += stats.size;
    } catch {
      continue;
    }

    selected.push({
      type: 'photo',
      media: { source: photoPath },
      caption: item.caption || undefined,
      caption_parse_mode: 'HTML',
    });
  }

  if (selected.length === 0) {
    return safeEditMessageText(ctx, 'Belum ada testimoni yang tersedia.', getStartKeyboard());
  }

  const batches = chunkArray(selected, 10);
  const sentMessages = [];

  for (const batch of batches) {
    try {
      const result = await ctx.replyWithMediaGroup(batch);
      if (Array.isArray(result)) {
        sentMessages.push(...result);
      }
    } catch { 
    }
  }

  if (sentMessages.length === 0) {
    return safeEditMessageText(ctx, 'Gagal menampilkan testimoni saat ini.', getStartKeyboard());
  }

  scheduleDeleteMessages(ctx, sentMessages);
}

async function safeEditMessageText(ctx, text, markup) {
  const options = { parse_mode: 'HTML', ...(markup ?? {}) };
  try {
    return await ctx.editMessageText(text, options);
  } catch (error) {
    const description = error?.response?.description ?? '';
    if (description.includes('message is not modified')) {
      return null;
    }
    if (description.includes('there is no text in the message to edit')) {
      const replyMarkup = markup?.reply_markup ?? markup;
      try {
        return await ctx.editMessageCaption(text, { parse_mode: 'HTML', reply_markup: replyMarkup });
      } catch (captionError) {
        const captionDescription = captionError?.response?.description ?? '';
        if (captionDescription.includes('message is not modified')) {
          return null;
        }
        if (captionDescription.includes('message to edit not found')) {
          return ctx.reply(text, { parse_mode: 'HTML', ...(markup ?? {}) });
        }
        throw captionError;
      }
    }
    if (description.includes('message to edit not found')) {
      return ctx.reply(text, { parse_mode: 'HTML', ...(markup ?? {}) });
    }
    throw error;
  }
}

export function registerCallbackHandler(bot) {
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    await ctx.answerCbQuery();

    if (data === 'show_menu') {
      const dataProduk = await loadProdukData();
      if (!hasCategories(dataProduk)) {
        return safeEditMessageText(ctx, '<b>Belum ada category.</b>\n\n<blockquote>Silakan tambahkan category terlebih dahulu.</blockquote>', getHomeKeyboard());
      }
      return safeEditMessageText(ctx, '<b>Product Category</b>\n\n<blockquote>Berikut adalah Category yang kami sediakan Silahkan pilih Category yang anda inginkan</blockquote>', buildMenuCategoryKeyboard(dataProduk, 1));
    }

    if (data === 'support') {
      return safeEditMessageText(
        ctx,
        '<b>Butuh bantuan?</b>\n\n<blockquote>Hubungi admin atau kunjungi customer service kami.</blockquote>\n\n<b>Admin:</b> @AltharDev\n<b>Customer Service:</b> @AltharDev',
        getHomeKeyboard()
      );
    }

    if (data === 'bot_info') {
      return safeEditMessageText(
        ctx,
        '<b>Information</b>\n\n<blockquote>Bot ini membantu kamu memilih paket toko dan memproses pesan order dengan cepat.</blockquote>',
        getHomeKeyboard()
      );
    }

    if (data === 'show_testimoni') {
      return safeShowTestimoni(ctx);
    }

    if (data === 'back_to_start') {
      return deleteCurrentMessageAndReply(ctx, getStartText(ctx), getStartKeyboard());
    }

    if (data.startsWith('order:')) {
      const packageId = data.split(':')[1];
      const selectedPackage = findOrderPackage(packageId);
      if (!selectedPackage) {
        return ctx.answerCbQuery('Paket tidak ditemukan. Silakan pilih kembali dengan /order.', { show_alert: true });
      }

      return safeEditMessageText(ctx, getOrderMessage(selectedPackage), getOrderConfirmationKeyboard(selectedPackage));
    }

    if (data.startsWith('confirm:')) {
      const packageId = data.split(':')[1];
      const selectedPackage = findOrderPackage(packageId);
      if (!selectedPackage) {
        return ctx.answerCbQuery('Paket konfirmasi tidak ditemukan.', { show_alert: true });
      }

      return safeEditMessageText(
        ctx,
        `Terima kasih! Pesanan kamu sebesar ${selectedPackage.label} telah dicatat. Jika sudah melakukan pembayaran, tim akan memproses segera.`,
        getHomeKeyboard()
      );
    }

    if (data === 'add:category') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = { mode: 'category' };
      return safeEditMessageText(ctx, 'Baik Bos!, Silahkan berikan saya nama categorynya');
    }

    if (data === 'add:product') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const dataProduk = await loadProdukData();
      if (!hasCategories(dataProduk)) {
        return safeEditMessageText(ctx, 'Belum ada category. Silakan tambahkan category terlebih dahulu.', buildAddMainKeyboard());
      }

      ctx.session.addFlow = { mode: 'product', stage: 'chooseCategory' };
      return safeEditMessageText(
        ctx,
        'Baik Bos!, Silahkan pilih category yang ingin di tambahkan produknya',
        buildProductCategoryKeyboard(dataProduk, 1)
      );
    }

    if (data === 'add:testimoni') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = { mode: 'testimoni' };
      return safeEditMessageText(ctx, 'Baik Bos!, silahkan kirim gambar testimoni yang ingin ditambahkan.');
    }

    if (data.startsWith('add:product_page:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const page = Number(data.split(':')[2]) || 1;
      const dataProduk = await loadProdukData();
      return safeEditMessageText(
        ctx,
        'Silakan pilih category yang ingin di tambahkan produknya',
        buildProductCategoryKeyboard(dataProduk, page)
      );
    }

    if (data.startsWith('add:product_cat:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const categoryId = data.split(':')[2];
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }

      ctx.session.addFlow = {
        mode: 'product',
        stage: 'enterProductName',
        categoryId,
        categoryName: category.name,
      };
      return safeEditMessageText(ctx, 'Baik Bos!, Silahkan berikan saya nama produknya');
    }

    if (data === 'add:back') {
      ctx.session = ctx.session || {};
      ctx.session.addFlow = null;
      return safeEditMessageText(ctx, 'Baik Bos!, apa yang ingin anda tambahkan? silahkan pilih di bawah ini', buildAddMainKeyboard());
    }

    if (data === 'delete:category') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const dataProduk = await loadProdukData();
      if (!hasCategories(dataProduk)) {
        return safeEditMessageText(ctx, 'Belum ada category. Silakan tambahkan category terlebih dahulu.', buildDeleteMainKeyboard());
      }

      return safeEditMessageText(ctx, 'Silakan pilih kategori yang ingin dihapus.', buildCategoryKeyboard(dataProduk, 1, 'delete'));
    }

    if (data === 'delete:product') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const dataProduk = await loadProdukData();
      if (!hasCategories(dataProduk)) {
        return safeEditMessageText(ctx, 'Belum ada category. Silakan tambahkan category terlebih dahulu.', buildDeleteMainKeyboard());
      }

      return safeEditMessageText(ctx, 'Silakan pilih kategori untuk menghapus produk.', buildDeleteProductCategoryKeyboard(dataProduk, 1));
    }

    if (data === 'delete:testimoni') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const testimonies = await loadTestimoniData();
      if (!Array.isArray(testimonies) || testimonies.length === 0) {
        return safeEditMessageText(ctx, 'Tidak ada testimoni yang tersimpan saat ini.', buildDeleteMainKeyboard());
      }

      return safeEditMessageText(ctx, 'Silakan pilih testimoni yang ingin dihapus.', buildTestimoniKeyboard(testimonies, 1));
    }

    if (data.startsWith('delete:product_page:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const page = Number(data.split(':')[3]) || 1;
      const dataProduk = await loadProdukData();
      return safeEditMessageText(ctx, 'Silakan pilih kategori untuk menghapus produk.', buildDeleteProductCategoryKeyboard(dataProduk, page));
    }

    if (data.startsWith('delete:product_cat:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const categoryId = data.split(':')[2];
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }

      const productCount = (dataProduk.products?.[categoryId] || []).length;
      if (productCount === 0) {
        return safeEditMessageText(ctx, 'Belum ada produk pada category ini.', buildDeleteMainKeyboard());
      }

      return safeEditMessageText(ctx, 'Pilih produk yang ingin dihapus.', buildProductKeyboard(dataProduk, categoryId, 1, 'delete', 'delete:back'));
    }

    if (data.startsWith('delete:category:confirm:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const categoryId = data.split(':')[3];
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }

      await deleteCategory(categoryId);
      return safeEditMessageText(ctx, `Kategori ${escapeHtml(category.name)} telah berhasil dihapus.`, buildDeleteMainKeyboard());
    }

    if (data.startsWith('delete:category:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const categoryId = data.split(':')[2];
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }

      return safeEditMessageText(
        ctx,
        `Anda yakin ingin menghapus kategori ${escapeHtml(category.name)} beserta seluruh produk di dalamnya?`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Hapus Kategori', `delete:category:confirm:${categoryId}`)],
          [Markup.button.callback('Batal', 'delete:back')],
        ])
      );
    }

    if (data.startsWith('delete:product:confirm:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const [_, __, ___, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      await deleteProduct(categoryId, Number(productIndex));
      return safeEditMessageText(ctx, `Produk ${escapeHtml(product.name)} telah berhasil dihapus.`, buildDeleteMainKeyboard());
    }

    if (data.startsWith('delete:product:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const [_, __, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      const productName = escapeHtml(product.name);
      return safeEditMessageText(
        ctx,
        `Anda yakin ingin menghapus produk ${productName}?`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Hapus Produk', `delete:product:confirm:${categoryId}:${productIndex}`)],
          [Markup.button.callback('Batal', 'delete:back')],
        ])
      );
    }

    if (data.startsWith('delete:testimoni:confirm:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const testimoniId = data.split(':')[3];
      const deleted = await deleteTestimoni(testimoniId);
      if (!deleted) {
        return ctx.answerCbQuery('Testimoni tidak ditemukan.', { show_alert: true });
      }

      return safeEditMessageText(ctx, 'Testimoni telah berhasil dihapus.', buildDeleteMainKeyboard());
    }

    if (data.startsWith('delete:testimoni:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const testimoniId = data.split(':')[2];
      const testimonies = await loadTestimoniData();
      const testimonial = testimonies.find((item) => item.id === testimoniId);
      if (!testimonial) {
        return ctx.answerCbQuery('Testimoni tidak ditemukan.', { show_alert: true });
      }

      return safeEditMessageText(
        ctx,
        `Anda yakin ingin menghapus testimoni ini? ${testimonial.caption ? `Keterangan: ${testimonial.caption}` : ''}`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Hapus Testimoni', `delete:testimoni:confirm:${testimoniId}`)],
          [Markup.button.callback('Batal', 'delete:back')],
        ])
      );
    }

    if (data.startsWith('delete:testimoni_page:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const page = Number(data.split(':')[2]) || 1;
      const testimonies = await loadTestimoniData();
      return safeEditMessageText(ctx, 'Pilih testimoni yang ingin dihapus.', buildTestimoniKeyboard(testimonies, page));
    }

    if (data === 'delete:back') {
      ctx.session = ctx.session || {};
      ctx.session.addFlow = null;
      return safeEditMessageText(ctx, 'Silakan pilih jenis data yang ingin dihapus, lalu lanjutkan menggunakan tombol di bawah.', buildDeleteMainKeyboard());
    }

    if (data.startsWith('menu:product_link:')) {
      const transactionId = data.split(':')[2];
      const payment = transactionId ? pendingPayments.get(transactionId) : null;
      if (!payment) {
        return ctx.answerCbQuery('Data produk tidak tersedia.', { show_alert: true });
      }

      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, payment.categoryId, payment.productIndex);
      if (!product || !product.link?.trim()) {
        return ctx.answerCbQuery('Data produk tidak tersedia.', { show_alert: true });
      }

      const reply = await ctx.reply(`Data produk: ${product.link}`, { parse_mode: 'HTML' });
      const chatId = ctx.chat.id;

      setTimeout(async () => {
        if (reply?.message_id) {
          try {
            await ctx.telegram.deleteMessage(chatId, reply.message_id);
          } catch { 
          }
        }
      }, 15 * 1000);

      return;
    }

    if (data === 'set:category') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const dataProduk = await loadProdukData();
      if (!hasCategories(dataProduk)) {
        return safeEditMessageText(ctx, 'Belum ada category. Silakan tambahkan category terlebih dahulu.', buildSetMainKeyboard());
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = { mode: 'setCategory', stage: 'chooseCategory' };
      return safeEditMessageText(ctx, 'Baik Bos!, Silahkan pilih category yang ingin di setting', buildCategoryKeyboard(dataProduk, 1, 'set'));
    }

    if (data === 'set:product') {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const dataProduk = await loadProdukData();
      if (!hasCategories(dataProduk)) {
        return safeEditMessageText(ctx, 'Belum ada category. Silakan tambahkan category terlebih dahulu.', buildSetMainKeyboard());
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = { mode: 'setProduct', stage: 'chooseCategory' };
      return safeEditMessageText(
        ctx,
        'Baik Bos!, Silahkan pilih category yang ingin di setting produknya',
        buildCategoryKeyboard(dataProduk, 1, 'set:product')
      );
    }

    if (data.startsWith('set:category_page:') || data.startsWith('set:product:category_page:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const parts = data.split(':');
      const page = Number(parts[parts.length - 1]) || 1;
      const prefix = data.startsWith('set:product:category_page:') ? 'set:product' : 'set';
      const dataProduk = await loadProdukData();
      return safeEditMessageText(ctx, 'Silahkan pilih category', buildCategoryKeyboard(dataProduk, page, prefix));
    }

    if (data === 'menu:back') {
      const dataProduk = await loadProdukData();
      return deleteCurrentMessageAndReply(ctx, 'Silakan pilih category:', buildMenuCategoryKeyboard(dataProduk, 1));
    }

    if (data.startsWith('menu:category_page:')) {
      const page = Number(data.split(':')[2]) || 1;
      const dataProduk = await loadProdukData();
      return safeEditMessageText(ctx, 'Silakan pilih category:', buildMenuCategoryKeyboard(dataProduk, page));
    }

    if (data.startsWith('menu:category:')) {
      const categoryId = data.split(':')[2];
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }
      const { products, startIndex } = getProductsPage(dataProduk, categoryId, 1);
      try {
        await ctx.deleteMessage();
      } catch {
      }
      return ctx.replyWithPhoto(
        { source: bannerImagePath },
        {
          caption: getMenuProductText(category, products, startIndex),
          parse_mode: 'HTML',
          reply_markup: buildMenuProductKeyboard(dataProduk, categoryId, 1).reply_markup,
        }
      );
    }

    if (data.startsWith('menu:product_page:')) {
      const [_, __, categoryId, pageText] = data.split(':');
      const page = Number(pageText) || 1;
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }
      const { products, startIndex } = getProductsPage(dataProduk, categoryId, page);
      return safeEditMessageText(ctx, getMenuProductText(category, products, startIndex), {
        reply_markup: buildMenuProductKeyboard(dataProduk, categoryId, page).reply_markup,
      });
    }

    if (data.startsWith('menu:product:')) {
      const [_, __, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      return safeEditMessageText(
        ctx,
        `<b>Detail Produk</b>\n\n<blockquote>Produk: ${product.name}\nDesk: ${product.desk || '-'}\nStock: ${product.stock || 0}\nPrice: ${formatCurrency(product.price || 0)}</blockquote>\n\n<b>Tekan Checkout untuk melanjutkan ke pembayaran.</b>`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Checkout', `menu:checkout:${categoryId}:${productIndex}`)],
          [Markup.button.callback('Kembali', `menu:category:${categoryId}`)],
          [Markup.button.callback('Home', 'back_to_start')],
        ])
      );
    }

    if (data.startsWith('menu:checkout:')) {
      const [_, __, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      return safeEditMessageText(
        ctx,
        `<b>Checkout</b>\n\n<blockquote>Produk: ${product.name}\nHarga: ${formatCurrency(product.price || 0)}\nStock: ${product.stock || 0}</blockquote>\n\n<b>Tekan Confirm untuk membuat QRIS pembayaran.</b>`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Confirm', `menu:confirm:${categoryId}:${productIndex}`)],
          [Markup.button.callback('Kembali', `menu:product:${categoryId}:${productIndex}`)],
          [Markup.button.callback('Home', 'back_to_start')],
        ])
      );
    }

    if (data.startsWith('menu:confirm:')) {
      const [_, __, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      const outputFilename = `qris_${categoryId}_${productIndex}.png`;
      let qrImagePath;
      let transactionId;
      const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();

      try {
        const result = await createPaymentQr(
          Number(product.price) || 0,
          'donatur@gmail.com',
          outputFilename,
          shortId,
          `Pembayaran untuk ${product.name}`
        );
        [, transactionId, qrImagePath] = result;
      } catch (error) {
        const message = error?.message || 'Gagal membuat QRIS pembayaran.';
        return safeEditMessageText(
          ctx,
          `Gagal membuat pembayaran: ${message}\n\nPastikan althar.saweriaName berisi username Saweria yang valid.`,
          Markup.inlineKeyboard([
            [Markup.button.callback('Kembali', `menu:product:${categoryId}:${productIndex}`)],
            [Markup.button.callback('Home', 'back_to_start')],
          ])
        );
      }

      ctx.session = ctx.session || {};
      ctx.session.payment = ctx.session.payment || {};
      const payment = {
        categoryId,
        productIndex,
        transactionId,
        shortId,
        productName: product.name,
        buyerChatId: ctx.chat.id,
        photoMessageId: null,
        adminNotified: false,
      };
      pendingPayments.set(shortId, payment);
      ctx.session.paymentTransactionId = shortId;

      const paymentKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Saya sudah bayar', `menu:paid:${shortId}`)],
        [Markup.button.callback('Home', 'back_to_start')],
      ]);

      try {
        await ctx.deleteMessage();
      } catch { 
      }

      const photoMessage = await ctx.replyWithPhoto(
        { source: qrImagePath },
        {
          caption: `<b>Pembayaran QRIS</b>\n\n<blockquote>Produk: ${product.name}\nJumlah: ${formatCurrency(product.price || 0)}\nScan QRIS untuk melanjutkan.</blockquote> `,
          parse_mode: 'HTML',
          reply_markup: paymentKeyboard.reply_markup,
        }
      );

      if (photoMessage?.message_id) {
        ctx.session.payment.photoMessageId = photoMessage.message_id;
        payment.photoMessageId = photoMessage.message_id;
      }
      return photoMessage;
    }

    if (data.startsWith('menu:paid:')) {
      const transactionId = data.split(':')[2];
      const payment = transactionId ? pendingPayments.get(transactionId) : null;
      if (!payment?.transactionId) {
        return ctx.answerCbQuery('Tidak ada transaksi aktif. Silakan mulai kembali dari Checkout.', { show_alert: true });
      }

      const isPaid = await paidStatus(payment.transactionId);
      if (!isPaid) {
        return safeEditMessageText(
          ctx,
          `<b>Pembayaran belum terdeteksi.</b>\n\n<blockquote>Pastikan kamu sudah scan QRIS dan menyelesaikan pembayaran, lalu coba lagi.</blockquote>`,
          Markup.inlineKeyboard([
            [Markup.button.callback('Cek lagi', `menu:paid:${transactionId}`)],
            [Markup.button.callback('Home', 'back_to_start')],
          ])
        );
      }

      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, payment.categoryId, payment.productIndex);
      if (!product) {
        return ctx.answerCbQuery('Data produk tidak ditemukan.', { show_alert: true });
      }

      if (!product.link?.trim()) {
        return safeEditMessageText(
          ctx,
          '<b>Pembayaran berhasil.</b>\n\n<blockquote>Produk tidak memiliki link. Silakan hubungi admin untuk informasi lebih lanjut.</blockquote>',
          Markup.inlineKeyboard([
            [Markup.button.callback('Home', 'back_to_start')],
          ])
        );
      }

      if (payment.photoMessageId) {
        try {
          await ctx.deleteMessage(payment.photoMessageId);
        } catch { 
        }
      }

      pendingPayments.delete(transactionId);

      return safeEditMessageText(
        ctx,
        `<b>Pembayaran berhasil.</b>\n\nBerikut Data produk anda:\n\n<blockquote>${product.link}</blockquote>`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Home', 'back_to_start')],
        ])
      );
    }

    if (data.startsWith('set:product_page:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const [_, __, categoryId, pageText] = data.split(':');
      const page = Number(pageText) || 1;
      const dataProduk = await loadProdukData();
      return safeEditMessageText(ctx, 'Silahkan pilih produk', buildProductKeyboard(dataProduk, categoryId, page, 'set'));
    }

    if (data.startsWith('set:category:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const categoryId = data.split(':')[2];
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = {
        mode: 'setCategory',
        stage: 'enterCategoryName',
        categoryId,
      };
      return safeEditMessageText(ctx, 'Baik Bos!, Silahkan berikan saya nama categorynya');
    }

    if (data.startsWith('set:product:category:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const [_, __, ___, categoryId] = data.split(':');
      const dataProduk = await loadProdukData();
      const category = getCategoryById(dataProduk, categoryId);
      if (!category) {
        return ctx.answerCbQuery('Category tidak ditemukan.', { show_alert: true });
      }

      const productCount = (dataProduk.products?.[categoryId] || []).length;
      if (productCount === 0) {
        return safeEditMessageText(ctx, 'Belum ada produk pada category ini.', buildSetMainKeyboard());
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = {
        mode: 'setProduct',
        stage: 'chooseProduct',
        categoryId,
      };
      return safeEditMessageText(ctx, 'Baik Bos!, Silahkan pilih produk yang ingin di setting', buildProductKeyboard(dataProduk, categoryId, 1, 'set'));
    }

    if (data.startsWith('set:product:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const [_, __, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = {
        mode: 'setProduct',
        stage: 'chooseField',
        categoryId,
        productIndex,
      };
      return safeEditMessageText(ctx, 'Baik Bos!, Silahkan pilih field yang ingin di setting', buildProductFieldKeyboard(categoryId, productIndex));
    }

    if (data.startsWith('set:field:')) {
      if (!isAdmin(ctx.from?.id)) {
        return ctx.answerCbQuery('Hanya owner/admin yang dapat menggunakan perintah ini.', { show_alert: true });
      }

      const [_, __, field, categoryId, productIndex] = data.split(':');
      const dataProduk = await loadProdukData();
      const product = getProductByIndex(dataProduk, categoryId, productIndex);
      if (!product) {
        return ctx.answerCbQuery('Product tidak ditemukan.', { show_alert: true });
      }

      ctx.session = ctx.session || {};
      ctx.session.addFlow = {
        mode: 'setProduct',
        stage: 'enterFieldValue',
        categoryId,
        productIndex,
        field,
      };
      return safeEditMessageText(ctx, `Baik Bos!, Silahkan berikan saya nilai baru untuk ${field}`);
    }

    if (data === 'set:back') {
      ctx.session = ctx.session || {};
      ctx.session.addFlow = null;
      return safeEditMessageText(ctx, 'Halo Bos!, apa yang ingin anda setting? silahkan pilih di bawah ini', buildSetMainKeyboard());
    }

    return ctx.answerCbQuery('Tombol tidak dikenali.', { show_alert: true });
  });
}
