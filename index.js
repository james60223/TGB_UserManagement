const { Bot } = require('grammy');
require('dotenv').config();
const dbConnection = require('./database/database.js');

// Replace with your Telegram bot token
const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

// Initialize grammY bot
const bot = new Bot(BOT_TOKEN);

// Start command handler
bot.command('start', (ctx) => ctx.reply('Hello! Use /getchatid to retrieve the chat ID.'));

// Command to get the chat ID
bot.command('getchatid', (ctx) => {
    const chatId = ctx.chat.id;
//   ctx.reply(`The chat ID is: ${chatId}`);
    console.log(chatId);
});

// Event handler for new chat members
bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id;
    if (chatId != GROUP_CHAT_ID) 
        return;
    if (ctx.message.new_chat_members) {
        ctx.message.new_chat_members.map(async (member) => {
            dbConnection.insertUserIfNotExists(member.username, member.first_name + ' ' + member.last_name, member.id, '', 0, 0, 5000);

            await ctx.reply(`Welcome ${member.username} to the group!`);

            await ctx.api.restrictChatMember(chatId, member.id, {
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_polls: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
                can_change_info: false,
                can_invite_users: false,
                can_pin_messages: false
            });

            console.log(`Restricted user ${member.id} in chat ${chatId}`);
        });
    }
});

// Start the bot
bot.start();

