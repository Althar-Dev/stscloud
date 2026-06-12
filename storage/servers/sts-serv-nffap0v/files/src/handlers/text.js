import { addCategory, addProduct, getCategoryById, isAdmin, buildContinueKeyboard, buildSetContinueKeyboard, updateCategoryName, updateProductFieldByIndex } from '../utils/produk.js';
import { addTestimoni, saveTestimoniPhoto } from '../utils/testimoni.js';

export function registerTextHandler(bot) {
  bot.on('text', async (ctx) => {
    const message = ctx.message.text.trim();
    ctx.session = ctx.session || {};
    const addFlow = ctx.session.addFlow;

    if (addFlow) {
      if (!isAdmin(ctx.from?.id)) {
        ctx.session.addFlow = null;
        return ctx.reply('Hanya owner/admin yang dapat menggunakan perintah ini.', { parse_mode: 'HTML' });
      }

      if (addFlow.mode === 'testimoni') {
        return ctx.reply('Kirim gambar testimoni, bukan teks.', { parse_mode: 'HTML' });
      }

      if (addFlow.mode === 'category') {
        const categoryName = message;
        await addCategory(categoryName);
        ctx.session.addFlow = null;
        return ctx.reply(`Done Bos!, Category ${categoryName} Sudah berhasil di tambahkan`, { parse_mode: 'HTML', ...buildContinueKeyboard() });
      }

      if (addFlow.mode === 'product' && addFlow.stage === 'enterProductName') {
        const productName = message;
        const { categoryName } = addFlow;
        await addProduct(addFlow.categoryId, productName);
        ctx.session.addFlow = null;
        return ctx.reply(
          `Done Bos!, Product ${productName} Sudah berhasil di tambahkan ke kategori ${categoryName}`,
          { parse_mode: 'HTML', ...buildContinueKeyboard() }
        );
      }

      if (addFlow.mode === 'setCategory' && addFlow.stage === 'enterCategoryName') {
        const categoryName = message;
        await updateCategoryName(addFlow.categoryId, categoryName);
        ctx.session.addFlow = null;
        return ctx.reply(`Done Bos!, Category ${categoryName} Sudah berhasil di setting`, { parse_mode: 'HTML', ...buildSetContinueKeyboard() });
      }

      if (addFlow.mode === 'setProduct' && addFlow.stage === 'enterFieldValue') {
        const field = addFlow.field;
        const updatedProduct = await updateProductFieldByIndex(addFlow.categoryId, addFlow.productIndex, field, message);
        if (!updatedProduct) {
          ctx.session.addFlow = null;
          return ctx.reply('Gagal menemukan product untuk diupdate. Silakan ulangi.', { parse_mode: 'HTML', ...buildSetContinueKeyboard() });
        }

        ctx.session.addFlow = null;
        return ctx.reply(
          `Done Bos!, Product ${updatedProduct.name} field ${field} berhasil di set menjadi ${message}`,
          { parse_mode: 'HTML', ...buildSetContinueKeyboard() }
        );
      }
    }
  });

  bot.on('photo', async (ctx) => {
    ctx.session = ctx.session || {};
    const addFlow = ctx.session.addFlow;
    if (!addFlow || addFlow.mode !== 'testimoni') {
      return;
    }

    if (!isAdmin(ctx.from?.id)) {
      ctx.session.addFlow = null;
      return ctx.reply('Hanya owner/admin yang dapat menggunakan perintah ini.', { parse_mode: 'HTML' });
    }

    const mediaGroupId = ctx.message.media_group_id;
    const photos = ctx.message.photo || [];
    if (photos.length === 0) {
      return ctx.reply('Kirim gambar testimoni dengan format foto.', { parse_mode: 'HTML' });
    }

    const photoId = photos[photos.length - 1].file_id;
    const caption = ctx.message.caption?.trim() || '';
    const fileUrl = await ctx.telegram.getFileLink(photoId);
    const localPath = await saveTestimoniPhoto(fileUrl.href, Date.now().toString());
    await addTestimoni(ctx.from.id, photoId, localPath, caption);

    if (mediaGroupId) {
      const pending = ctx.session.pendingTestimoniGroup || {};
      if (pending.timer) {
        clearTimeout(pending.timer);
      }

      const timer = setTimeout(async () => {
        try {
          await ctx.reply('Done Bos!, Testimoni gambar kamu sudah dicatat.', { parse_mode: 'HTML', ...buildContinueKeyboard() });
        } catch {
        }
        ctx.session.addFlow = null;
        ctx.session.pendingTestimoniGroup = null;
      }, 1500);

      ctx.session.pendingTestimoniGroup = {
        mediaGroupId,
        timer,
      };
      return;
    }

    ctx.session.addFlow = null;
    return ctx.reply('Done Bos!, Testimoni gambar kamu sudah dicatat.', { parse_mode: 'HTML', ...buildContinueKeyboard() });
  });
}
