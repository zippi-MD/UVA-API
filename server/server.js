require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
var cors = require('cors');


const { mongoose } = require('./db/mongoose');
const { Event } = require('./models/event');
const { Location } = require('./models/locations');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const { getNearestLocation } = require('./events/localization');
const { getEvents } = require('./events/retieve');

const path = require('path');
const publicPath = path.join(__dirname, '../public/Plataforma');

const app = express();

const port = process.env.PORT;
const user_key = process.env.USER_SECRET_KEY;
const actual_app_version = process.env.ACTUAL_APP_VERSION;

app.use(cors({origin: '*'}));
app.use(express.static(publicPath));
app.use(bodyParser.json());

app.post('/event', authenticate, (req, res) =>{

    const event = new Event({
        title: req.body.title,
        type: req.body.type,
        phrase: req.body.phrase,
        info: req.body.info,
        img: req.body.img,
        dateUp: req.body.dateUp,
        dateDown: req.body.dateDown,
        loc: req.body.loc,
        loc_name: req.body.loc_name,
        _creator: req.user._id
    });

    event.save().then((doc)=>{
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });

});

app.get('/events', (req, res) => {
    Location.getLocations().then((locations) => {
        app_version = parseFloat(req.query.app);
        let update = app_version < actual_app_version;
        const uva_lugar = getNearestLocation(req.query.lat, req.query.lon, locations);
        getEvents(uva_lugar.location, uva_lugar.default_events, res, (res, events, location) => {
            res.status(200).send({
                events,
                'update': update,
                'location':{
                    'name': location.name,
                    'phrase': location.phrase,
                    'img': location.img,
                    'markers': location.markers
                }
            });
        });
    }).catch((e) => {
        console.log(e);
        res.status(400).send();
    });

});

app.get('/events/user', authenticate, (req, res) => {

    Event.find({_creator: req.user.id}).then((events) => {

        if(!events){
            return res.status(404).send();
        }

        return res.status(200).send({events});
    }).catch((e) => res.status(400).send());

});

app.delete('/events/:id', authenticate, (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Event.findOneAndRemove({_id: id, _creator: req.user._id}).then((event) => {
        if(!event){
            return res.status(404).send();
        }
        return res.send({event});
    }).catch((err) => res.status(400).send());
});

app.post('/users', (req, res) => {
    let key = _.pick(req.body, 'key');

    if(key.key !== user_key){
        res.status(400).send();
    }
    else{
        let body = req.body;
        let user = new User(body);
        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(user);
        }).catch((e) => {
            res.status(400).send(e);
        })
    }

});

app.post('/location', (req, res) => {
    let key = _.pick(req.body, 'key');

    if(key.key !== user_key){
        res.status(400).send();
    }
    else{
        let body = _.pick(req.body, ['gloc', 'sloc', 'name', 'phrase', 'img', 'lat', 'lon', 'loc_size', 'markers']);
        let location = new Location(body);
        location.save().then(() => {
            res.status(200).send(location);
        }).catch((e) => {
            res.status(400).send(e);
        })
    }

});

app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
});


app.post('/users/login', (req, res) => {
   let body = _.pick(req.body, ['user', 'password']);

   User.findByCredentials(body.user, body.password).then((user) => {
        // return user.generateAuthToken().then((token) => {
        //     res.header('x-auth', token).send(user);
        // });
       res.setHeader('Access-Control-Expose-Headers', 'x-auth');
       res.status(200).header('x-auth', user.tokens[0].token).send({"locations": user.locations});
   }).catch((e) => {
        res.status(400).send();
   });


});

app.delete('/users/me/token', authenticate, (req, res) => {
   req.user.removeToken(req.token).then(() => {
     res.status(200).send();
   }, () => {
       res.status(400).send();
   });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
    console.log('Date: ' + new Date);
});

module.exports = {
    app
};