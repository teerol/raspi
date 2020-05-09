// reading data from ruuvi
const ruuvi = require('node-ruuvitag');
let temps = [];
let pressures=[];
let humiditis=[];
let last_update;
let save=81;

ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
   	if (save>80){
		temps.push(data.temperature);
		pressures.push(data.pressure);
		humiditis.push(data.humidity);
		var last_update = new Date();
		save=0;
		console.log(temps+'/n');
	
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

// handeling the data (current, hour avg, day avg)



// telebot commands
let HELP = 'Sää Ratinassa /n'
'/lampo kertoo nykyisen lämpötilan, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi lämpötilat /n'+
'/paine kertoo nykyisen ilmanpaineen, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi ilmanpaineet /n'+
'/kosteus kertoo nykyisen ilmankosteuden, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi ilmankosteudet /n'+
'/updated kertoo kelonajan koska sää on viimeksi päivittynyt /n';

functionn avg(arr) {
	let sum=0;
	for (i=0,i<arr.lenght(),i++){
		sum+=arr[i];
	}
	return sum/arr.lenght();
}

function get_message(arr) {
	let avg1=avg(arr.slice(0,60);
	let min1=arr.slice(0,60).min()
	let max1=arr.slice(0,60).max();
	let avg24=agv(arr);
	let max24=arr.max();
	let min24=arr.min();
	let current=arr[arr.lenght]
	return 'Nyt: '+ current+'/n'+
	'Viimeisin tunti:/n'+
	'/t max: '+max1+' min: '+min1+' avg: '+avg1+'/n'+
	'Vuorokausi:/n'+
	'/t max: '+max24+' min: '+min24+' avg: '+avg24+'/n'
	
}

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
// wait for command
bot.on('/hello', (msg) => msg.reply.text("terve vuoan!"));
bot.on('/lampo',(msg)=>msg.reply.text(get_message(temps)));
bot.on('/paine',(msg)=>msg.reply.text(get_message(pressures)));
bot.on('/kosteus',(msg)=>msg.reply.text(get_message(humiditis)));
bot.on('/updated',(msg)=>msg.reply.text(last_update));
bot.on('/help',(msg)=>msg.reply.text(HELP));

// start bot
bot.start();