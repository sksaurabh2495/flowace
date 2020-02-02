const express = require('express');
const database = require('./controllers/database');
const session = require('express-session');


const app = express();

app.set('view engine', 'ejs');		//Setting view engine

app.use('/assets', express.static('static'));		//middleware

//use sessions for tracking logins
app.use(session({
  secret: 'flowace assignment',
  resave: true,
  saveUninitialized: false
}));

//fire controller
database(app);


const port = process.env.PORT || 5000;
const server = app.listen(port);

//real time notification
global.io = require('socket.io').listen(server);

io.on('connection', (socket) =>{

	console.log('A user is connected and opened service.ejs');
	// socket.on('chat message', function(msg){
 //    	console.log('message: ' + msg);
 //  	});

});

console.log(`Yo dawgs, you are listening to port ${port}`);
