// reading data from ruuvi
const ruuvi = require('node-ruuvitag');
let temps = [];
let pressures=[];
let humiditis=[];
var last_update = new Date();

ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
	var c=new Date();
   	if (c.getTime()-last_update.getTime()>60000){
		temps.push(data.temperature);
		pressures.push(data.pressure);
		humiditis.push(data.humidity);
		last_update = new Date();
		console.log(last_update);
	
		// only saving the last 24 hours
		if (temps.lenght > 24*60){
			temps.shift();
			pressures.shift();
			humiditis.shift();
		}
	}
  });
});

// telebot commands
const HELP = 'Sää Ratinassa \n'+
'/lampo kertoo nykyisen lämpötilan, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi lämpötilat \n'+
'/paine kertoo nykyisen ilmanpaineen, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi ilmanpaineet \n'+
'/kosteus kertoo nykyisen ilmankosteuden, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi ilmankosteudet \n'+
'/updated kertoo koska sää on viimeksi päivittynyt \n'+
'/ennuste generoi videoennusteen (beta)';

function avg(arr) {
	let sum=0;
	for (i=0;i<arr.lenght;i++){
		sum+=arr[i];
	}
	console.log(arr.lenght);
	return sum/arr.lenght;
}
function minimi(arr){
	min=arr[0];
	for (i=1;i<arr.lenght;i++){
		if (min > arr[i]){
			min=arr[i];
		}
	}
	return min;
}

function maximi(arr){
	max=arr[0];
	for (i=1;i<arr.lenght;i++){
		if (max < arr[i]){
			max=arr[i];
		}
	}
	return max;
}


function get_message(arr) {
	let last_hour;
	if (arr.lenght>60){
		last_hour=arr.slice(-60,end);
	}else{
		last_hour=arr;
	}
	let avg1=avg(last_hour);
	let min1=minimi(last_hour);
	let max1=maximi(last_hour);
	let avg24=avg(arr);
	let max24=maximi(arr);
	let min24=minimi(arr);
	let current=arr[-1];
	return 'Nyt: '+ current+'\n'+
	'Viimeisin tunti:\n'+
	'\t max: '+max1+'\n\t min: '+min1+'\n\t avg: '+avg1+'\n'+
	'Vuorokausi:\n'+
	'\t max: '+max24+'\n\t min: '+min24+'\n\t avg: '+avg24+'\n'
	
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
bot.on('/lampo',(msg)=>msg.reply.text('Lämpötila (astetta Celsiusta): \n'+get_message(temps)));
bot.on('/paine',(msg)=>msg.reply.text('Ilmanpaine (hehtoPascalia): \n'+get_message(pressures)));
bot.on('/kosteus',(msg)=>msg.reply.text('Ilmankosteus (%):\n'+get_message(humiditis)));
bot.on('/updated',(msg)=>msg.reply.text('Viimeisin päivitys: '+last_update));
bot.on('/help',(msg)=>msg.reply.text(HELP));
bot.on('/ennuste',(msg)=>msg.reply.text('https://www.youtube.com/watch?v=bnI9K_05BzA'));

// start bot
bot.start();