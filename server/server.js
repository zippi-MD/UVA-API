require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');


const { mongoose } = require('./db/mongoose');
const { Event } = require('./models/event');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const { getLocation } = require('./events/localization');
const { getEvents } = require('./events/retieve');

const app = express();

const port = process.env.PORT;
const user_key = process.env.USER_SECRET_KEY;

app.use(bodyParser.json());

app.post('/event', authenticate, (req, res) =>{

    const event = new Event({
        title: req.body.title,
        type: req.body.type,
        phrase: req.body.phrase,
        info: req.body.info,
        img: req.body.imageURL,
        dateUp: req.body.dateUp,
        dateDown: req.body.dateDown,
        loc: req.body.loc,
        _creator: req.user._id
    });

    event.save().then((doc)=>{
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });

});

app.get('/events', (req, res) => {
    const uva_lugar = getLocation(req.query.lat, req.query.lon);
    getEvents(uva_lugar.gloc, uva_lugar.sloc, res, (res, events) => {
        res.status(200).send({events});
    });

});

app.get('/events/user', authenticate, (req, res) => {

    Event.find({_creator: req.user.id}).then((events) => {

        if(!events){
            return res.status(404).send();
        }

        return res.send({events});
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
        let body = _.pick(req.body, ['user_name', 'password', 'locations']);
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

app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
});


app.post('/users/login', (req, res) => {
   let body = _.pick(req.body, ['user', 'password']);

   User.findByCredentials(body.user, body.password).then((user) => {
        // return user.generateAuthToken().then((token) => {
        //     res.header('x-auth', token).send(user);
        // });
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