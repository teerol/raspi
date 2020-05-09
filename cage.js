// reading data from ruuvi
const ruuvi = require('node-ruuvitag');

ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
    console.log('Got data from RuuviTag ' + tag.id + ':\n' +
      JSON.stringify(data, null, '\t'));
  });
});

// handeling the data (current, hour avg, day avg)

// telebot commands
bot.on('/hello', (msg) => msg.reply.text("Hello! :)"));