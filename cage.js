// reading data from ruuvi
const ruuvi = require('node-ruuvitag');
const plotlib = require('nodeplotlib');
let temps = [];
let pressures=[];
let humiditis=[];
var last_update = new Date(0);

ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
	var c=new Date();
   	if (c.getTime()-last_update.getTime()>=59500){
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
'/lampo kertoo nykyisen lämpötilan, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja min lämpötilat \n'+
'/paine kertoo nykyisen ilmanpaineen, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja min ilmanpaineet \n'+
'/kosteus kertoo nykyisen ilmankosteuden, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja min ilmankosteudet \n'+
'/updated kertoo koska sää on viimeksi päivittynyt \n'+
'/ennuste generoi videoennusteen (beta)';

function avg(arr) {
	let sum=0;
	for (i=0;i<arr.length;i++){
		sum+=arr[i];
	}
	return sum/arr.length;
}
function find_min(arr){
	min=arr[0];
	for (i=1;i<arr.length;i++){
		if (min > arr[i]){
			min=arr[i];
		}
	}
	return min;
}

function find_max(arr){
	max=arr[0];
	for (i=1;i<arr.length;i++){
		if (max < arr[i]){
			max=arr[i];
		}
	}
	return max;
}

function get_message(arr) {
	let last_hour;
	if (arr.length>60){
		last_hour=arr.slice(-60);
	}else{
		last_hour=arr;
	}
	let avg1=avg(last_hour);
	let min1=find_min(last_hour);
	let max1=find_max(last_hour);
	let avg24=avg(arr);
	let max24=find_max(arr);
	let min24=find_min(arr);
	let current=arr[arr.length-1];
	return 'Nyt: '+ current+'\n'+
	'Viimeisin tunti:\n'+
	'\t max: '+max1+'\n\t min: '+min1+'\n\t avg: '+avg1.toFixed(1)+'\n'+
	'Vuorokausi:\n'+
	'\t max: '+max24+'\n\t min: '+min24+'\n\t avg: '+avg24.toFixed(1)+'\n'
	
}

function plot_all(){
	for (i=0,t=[];i<temps.length;i++){
		t.push(i);
	}
	const temp: Plot = {x: t, y: temps, type: 'line'};
	return plotlib.plot([temp]);
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
bot.on('/graph',(msg)=>msg.reply.text(plot_all()));

// start bot
bot.start();