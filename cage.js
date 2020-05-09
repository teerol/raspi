// reading data from ruuvi
const ruuvi = require('node-ruuvitag');
let temps = [];
let pressures=[];
let humiditis=[];
let save=81;

ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
    //console.log('Tyotaa tallasta dataa ' + tag.id + ':\n' +
    //  JSON.stringify(data, null, '\t'));
	//console.log(' temp: '+data.temperature+' pres: '+data.pressure+' hud: '+data.humidity+ '\n');
	if (save>80){
		temps.push(data.temperature);
		pressures.push(data.pressure);
		humiditis.push(data.humidity);
		save=0;
	
		if (temps.lenght > 24*60){
			temps.shift();
			pressures.shift();
			humiditis.shift();
		}
	}
	else{
		save += 1;
	}
  });
});
console.log('temps '+temps+'\npres '+pressures+'\nhumids '+humiditis);

// handeling the data (current, hour avg, day avg)

// telebot commands
const TeleBot = require('telebot');
const bot = new TeleBot({
  token: '1087700060:AAEysZAIc6S7CQAQhp_BoSuE9yEuNiN4Gj0',
  polling: {
    interval: 1000, // How often check updates (in ms).
    timeout: 0, // Update polling timeout (0 - short polling).
    limit: 100, // Limits the number of updates to be retrieved.
    retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
  }
});
// wait for '/hello' command
bot.on('/hello', (msg) => msg.reply.text("terve vuoan!"));
bot.on('/maxt',(msg)=>msg.reply.text(temps[1]));
// start bot
bot.start();