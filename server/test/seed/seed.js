const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoID = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'zippi@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
},{
    _id: userTwoID,
    email: 'badzippi@example.com',
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoID, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]

}];

let todos=[{
    _id: new ObjectID,
    text: 'First test todo',
    _creator: userOneId
},{
    _id: new ObjectID,
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoID
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then( () => done() );
};

const populateUsers = (done) =>{
  User.remove({}).then(()=>{
     let userOne = new User(users[0]).save();
     let userTwo = new User(users[1]).save();

     return Promise.all([userOne, userTwo])
  }).then(()=>done());
};

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
};