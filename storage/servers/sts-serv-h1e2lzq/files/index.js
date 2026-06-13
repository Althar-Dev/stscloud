const { Telegraf } = require("telegraf");

const bot = new Telegraf("8932641291:AAHjyJt6WyF91OBMoVxxqpHjkn3yVZ_lJx8");

bot.on("message", async (ctx) => {
    try {
        const entities = ctx.message.entities || [];

        const customEmojis = entities.filter(
            e => e.type === "custom_emoji"
        );

        if (!customEmojis.length) {
            return ctx.reply("❌ Tidak ada emoji premium yang terdeteksi.");
        }

        let text = "";
        let outputEntities = [];
        let offset = 0;

        for (const emoji of customEmojis) {
            const line = `▫ ${emoji.custom_emoji_id}\n`;

            outputEntities.push({
                type: "custom_emoji",
                offset: offset,
                length: 1,
                custom_emoji_id: emoji.custom_emoji_id
            });

            text += `▫ ${emoji.custom_emoji_id}\n`;
            offset += line.length;
        }

        await ctx.telegram.sendMessage(
            ctx.chat.id,
            text,
            {
                entities: outputEntities
            }
        );

    } catch (err) {
        await ctx.reply(`❌ Error:\n${err.message}`);
    }
});

bot.launch();

console.log("Bot aktif");