require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');


const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { Event } = require('./models/event');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const { getLocation } = require('./events/localization');
const { getEvents } = require('./events/retieve');
const { user_secret_key} = require('./secret-keys/user_create');

const app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) =>{

    const todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });

});

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

app.get('/events', authenticate, (req, res) => {
    const uva_lugar = getLocation(req.query.lat, req.query.lon);
    getEvents(uva_lugar.gloc, uva_lugar.sloc, res, (res, events) => {
        res.status(200).send({events});
    });

});


app.get('/todos',authenticate, (req, res) => {
   Todo.find({_creator: req.user._id}).then((todos) => {
       res.send({todos});
   }, (e) => {
        res.status(400).send(e);
   });
});

app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }


    Todo.findOne({_id: id, _creator: req.user.id}).then((todo) => {

        if(!todo){
            return res.status(404).send();
        }

        return res.send({todo});
    }).catch((e) => res.status(400).send());

});

app.delete('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        return res.send({todo});
    }).catch((err) => res.status(400).send());
});

app.post('/users', (req, res) => {
    let key = _.pick(req.body, 'key');

    if(key.key !== user_secret_key.key){
        res.status(400).send('Ño, puto');
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
   let body = _.pick(req.body, ['email', 'password']);

   User.findByCredentials(body.email, body.password).then((user) => {
        // return user.generateAuthToken().then((token) => {
        //     res.header('x-auth', token).send(user);
        // });
       res.status(200).header('x-auth', user.tokens[0].token).send();
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