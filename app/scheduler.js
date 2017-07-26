/*
 * This js file handles tasks done every Minute/Hour/Day
 */
 var schedule = require('node-schedule');
var batoto = require('./batoto.js');
var debug = require('debug')('Muri:Scheduler')  


 var init = function() {
 	schedule.scheduleJob('*/5 * * * *', function() {
 		console.log(">----------------Scheduler.js is Logging");
 		console.log((new Date).toLocaleString());
 	})
 	schedule.scheduleJob('0 */2 * * *', function() {
 		debug('firstLogin')
 		console.log(">----------------Scheduler.js is Attempting to Login to Batoto");
 		console.log((new Date).toLocaleString());
 		batoto.firstLogin();
 	})
 	//Runs at 4AM
 	schedule.scheduleJob('0 4 * * *', function() {
 		debug('updateBatotoFullMangaDatabase')
 		console.log(">----------------Scheduler.js is Attempting to Scan Batoto manga Database");
 		console.log((new Date).toLocaleString());
 		console.log("Running FULL manga database update");
 		batoto.updateBatotoFullMangaDatabase();
 	})
 	//Run every 30 minutes
 	schedule.scheduleJob('30 * * * *', function() {
 		debug('updateBatotoUserMangaDatabase')
 		console.log(">----------------Scheduler.js is Attempting to Update User Manga Database");
 		console.log((new Date).toLocaleString());
 		console.log('Updating User Manga Database')
 		batoto.updateBatotoUserMangaDatabase(function() {
 			console.log("Updating User Manga Database finished @" + new Date);
 		});
 	})
 }

 exports.init = init;