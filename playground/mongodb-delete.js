const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) =>{
    if(err){
        return console.log('Unable to connect to MongoDB Server');
    }

    console.log('Connected to MongoDB server');

    // delete many
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result)=>{
    //     console.log(result.result);
    // }, (err) => {
    //     console.log('Error deleting', err);
    // });

    // db.collection('Users').deleteMany({name: 'Alejandro Mendoza'}).then((result) =>{
    //     console.log(result.result);
    // }, (err) => {
    //     console.log(err);
    // });

    //delete one
    // db.collection('Todos').deleteOne({text:'Eat lunch'}).then((result)=>{
    //    console.log(result.result);
    // });

    db.collection('Users').deleteOne({_id: new ObjectID('5a01e154e61acc1cafb7efb4')})
        .then((result) => {
        console.log(result.result);
        }, (err) => {
        console.log(err);
        });

    //find one and delete
    // db.collection('Todos').findOneAndDelete({compleated: false}).then((result)=>{
    //     console.log(result);
    // });

    //db.close();
});