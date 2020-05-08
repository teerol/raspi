const TeleBot = require('telebot');
const bot = new TeleBot({
  token: 1087700060:AAGYqsnxRaxEAQ6hTCMm4o_Sj4sjcQaSDGQ,
  polling: {
    interval: 1000, // How often check updates (in ms).
    timeout: 0, // Update polling timeout (0 - short polling).
    limit: 100, // Limits the number of updates to be retrieved.
    retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
  }
});
// wait for '/hello' command
bot.on('/hello', (msg) => msg.reply.text("Hello! :)"));
// start bot
bot.start();