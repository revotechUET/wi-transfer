const config = require('config');
let crypto = require('crypto');
let serverId = getRandomHash();

function getRandomHash() {
	const current_date = (new Date()).valueOf().toString();
	const random = Math.random().toString();
	return (crypto.createHash('sha1').update(current_date + random).digest('hex'));
}

// let mongoUrl = "mongodb://";

// mongoUrl = mongoUrl + config.get("mongo.host") + ":" + config.get("mongo.port") + "/" + config.get("mongo.db");

// const mongoose = require('mongoose');
//connect mongo
// mongoose.connect(mongoUrl, { useNewUrlParser: true }, (err) => {
//     if (err) {
//         console.log('Can not connect to mongodb');
//     } else {
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const curveRouter = require('./server/router/curve.router');
app.get('/', (req, res) => {
	res.json({name: "wi-curve-transfer", serverId: serverId, version: "1.0"});
});
// app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
// app.use(bodyParser.json());

app.use('/curve', curveRouter);

let port = process.env.PORT || config.get("port");

app.listen(port, () => {
	console.log('App start listen', port);
});
//     }
// });




