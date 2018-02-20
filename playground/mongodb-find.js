//const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) =>{
    if(err){
        return console.log('Unable to connect to MongoDB Server');
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({
    //     _id: new ObjectID("5a01e45d8978ec22cf0d167f")
    // }).toArray().then((docs) =>{
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch results ', err);
    // });

    // db.collection('Todos').find().count().then((count) =>{
    //     console.log('Todos Count:');
    //     console.log(`${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch results ', err);
    // });

    db.collection('Users').find({name: 'Alejandro Mendoza'}).toArray().then((users) =>{
        console.log('Users');
        console.log(JSON.stringify(users, undefined, 2));
    }, (err) => {
        console.log('Unable to fetch users ', err);
    });

    //db.close();
});