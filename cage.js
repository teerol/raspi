// reading data from ruuvi
const ruuvi = require('node-ruuvitag');
const {execFile} = require('child_process');
let temps = [];
let pressures=[];
let humiditis=[];
var last_update = new Date(0);
const started = new Date();
let logs = new Map();

ruuvi.on('found', tag => {
  console.log('Found RuuviTag, id: ' + tag.id);
  tag.on('updated', data => {
	var c=new Date();
   	if (c.getTime()-last_update.getTime()>=59500){
		temps.push(data.temperature);
		pressures.push(data.pressure/100); //pascal to hPa
		humiditis.push(data.humidity);
		last_update = new Date();
		console.log(last_update);
	
		// only saving the last 24 hours
		if (temps.length > 24*60){
			temps.shift();
			pressures.shift();
			humiditis.shift();
		}
	}
  });
});

// telebot commands
const HELP = 'Sää Ratinassa \n'+
'Mittalaite RuuviTag, mittaustaajuus 1/min\n'+
'/lampo kertoo nykyisen lämpötilan, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi lämpötilat. Mittauksen resoluutio 0.01 \n'+
'/paine kertoo nykyisen ilmanpaineen, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi ilmanpaineet. Mittauksen resoluutio 0.01 \n'+
'/kosteus kertoo nykyisen ilmankosteuden, sekä viimeisen tunnin ja vuorokauden keski- maksimi- ja minimi ilmankosteudet. Mittauksen resoluutio 0.0001 \n'+
'/updated kertoo koska sää on viimeksi päivittynyt sekä mittausten aloitusajankohdan\n'+
'/ennuste kertoo huomisen sään sekä generoi videoennusteen (beta)\n'+
'/graph piirtää kuvaajan viimeisen vuorokauden mittaustuloksista.';

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
	'\t max: '+max1+'\n\t min: '+min1+'\n\t avg: '+avg1.toFixed(3)+'\n'+
	'Vuorokausi:\n'+
	'\t max: '+max24+'\n\t min: '+min24+'\n\t avg: '+avg24.toFixed(3)+'\n'
}
	
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function log(user) {
	if(logs.has(user)){
		// Map is immutable...
		value=logs.get(user);
		logs.delete(user);
		logs.set(user,value+1)
	}else{
		logs.set(user,1);	
	}
}

function sarvet() {
	str="Huomenna ";
	randint=Math.floor(Math.random()*10)+1;
	if(randint%2==0){
		str+="sataa...";
	}else{
		str+="on pouta...";
	}
	return str;
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
bot.on('/hello', (msg) => msg.reply.text("Terve vuoan " + msg.chat.first_name+"!",log(msg.chat.username)));
bot.on('/lampo',(msg)=>msg.reply.text('Lämpötila (astetta Celsiusta): \n'+get_message(temps),log(msg.chat.username)));
bot.on('/paine',(msg)=>msg.reply.text('Ilmanpaine (hehtoPascalia): \n'+get_message(pressures),log(msg.chat.username)));
bot.on('/kosteus',(msg)=>msg.reply.text('Ilmankosteus (%):\n'+get_message(humiditis),log(msg.chat.username)));
bot.on('/updated',(msg)=>msg.reply.text('Viimeisin päivitys: '+last_update+'\nMittaus aloitettu: '+started,log(msg.chat.username)));
bot.on('/help',(msg)=>msg.reply.text(HELP,log(msg.chat.username)));
bot.on('/ennuste',(msg)=>msg.reply.text(sarvet()+'\nTarkempi ennuste: https://www.youtube.com/watch?v=bnI9K_05BzA',log(msg.chat.username)));
bot.on('/logs',function onLogs(msg) {
	for (let [key,value] of logs){
		console.log(key+" : "+value+"\n");
		}
	});	
bot.on('/graph',function onPhoto(msg) {
	log(msg.chat.username);
	execFile('python3',['plot.py',temps,pressures,humiditis]);
	sleep(2500); // so the python can be finised
	const photo = 'figuuri.png';
	bot.sendPhoto(msg.chat.id, photo, {
		caption: "Mittausdata viimeisen vuorokauden ajalta, ole hyvä."
	});
});
// start bot
bot.start();