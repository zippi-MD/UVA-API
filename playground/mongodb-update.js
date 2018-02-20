const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) =>{
    if(err){
        return console.log('Unable to connect to MongoDB Server');
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5a024d718978ec22cf0d1a1c')
    // },{
    //         $set: { compleated: true }
    //     },{
    //     returnOriginal: false
    // }).then((result) =>{
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate(
        {
        _id: new ObjectID("5a01e06b9302521cab336afd")
        },{
            $set: {name: "Alejandro Mendoza" },
            $inc: {age: 2}
        },{
            returnOriginal:false
        }).then((result) =>{
        console.log(result);
    });



    //db.close();
});