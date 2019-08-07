const config = require('config');

let mongoUrl = "mongodb://";

mongoUrl = mongoUrl + config.get("mongo.host") + ":" + config.get("mongo.port") + "/" + config.get("mongo.db");

const mongoose = require('mongoose');
//connect mongo
mongoose.connect(mongoUrl, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('Can not connect to mongodb');
    } else {
        const cors = require('cors');
        const bodyParser = require('body-parser');
        const express = require('express');
        const app = express();
        const curveRouter = require('./server/router/curve.router');

        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cors());

        app.use('/curve', curveRouter);

        let port = process.env.PORT || config.get("curveBasePath");
        
        app.listen(port, () => {
            console.log('App start listen', port);
        });
    }
});




