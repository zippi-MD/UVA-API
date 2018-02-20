const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5a038f79b39ed50420475401';

// if(!ObjectID.isValid(id)){
//     console.log('Id not valid')
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });
//
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo)
// });

// Todo.findById(id).then((todo)=>{
//     if(!todo){
//         return console.log('Id not found');
//     }
//     console.log('Todo by id', todo);
// }).catch( (e) => console.log(e) );


User.findById(id).then((user) => {
   if(!user){
       return console.log('User Id not found');
   }
   console.log(user)
}).catch((e) => console.log(e));
