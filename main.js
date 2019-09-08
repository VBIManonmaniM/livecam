const path = require('path');
const carlo = require('carlo');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cors = require('cors');

server.listen(3000);
app.use(cors());

app.use(express.static(__dirname))
// const fileAPIDir = path.join(__dirname, 'dist');
// app.use(express.static(fileAPIDir));

// app.use(express.static(path.join(__dirname, 'models')));


app.get('/', function (req, res, next) {
	res.sendFile(__dirname + '/index.html');
});
(async () => {
	let app;
	try {
		app = await carlo.launch(
			{
				width: 900,
				height: 700,
			});
	} catch (e) {
		// New window is opened in the running instance.
		console.log('Reusing the running instance');
		return;
	}
	app.on('exit', () => process.exit());
	// New windows are opened when this app is started again from command line.
	app.on('window', window => window.load('index.html'));
	app.serveFolder(path.join(__dirname, '/www'));
	await app.exposeFunction('saveVideo', saveVideo);
	await app.load('index.html');
})();

function saveVideo(base64) {
	io.emit('video', base64);
}



// const puppeteer = require('puppeteer');
// var app = require('http').createServer()
// var io = require('socket.io')(app);

// app.listen(3000);
// debugger

// (async () => {
// 	const browser = await puppeteer.launch({
// 		executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
// 		headless: false,
// 		devtools: true
// 	});
// 	debugger
// 	const page = await browser.newPage();
// 	await page.goto('http://google.com');
// 	debugger
// 	let stream = await page.evaluate(() => {
// 		debugger
// 		return new Promise((resolve, reject) => {
// 			navigator.getUserMedia = navigator.getUserMedia ||
// 				navigator.webkitGetUserMedia ||
// 				navigator.mozGetUserMedia;
// 			if (navigator.getUserMedia) {
// 				navigator.getUserMedia({ audio: true, video: { width: 1280, height: 720 } },
// 					function (stream) {
// 						debugger
// 						resolve(stream);
// 					},
// 					function (err) {
// 						console.log("The following error occurred: " + err.name);
// 					}
// 				);
// 			} else {
// 				console.log("getUserMedia not supported");
// 			}
// 		})
// 	});
// 	debugger
// })();