const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');


const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');



beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', ()=>{
   it('Should create a new todo', (done)=>{
       var text = 'Test todo text';

       request(app)
           .post('/todos')
           .set('x-auth', users[0].tokens[0].token)
               .send({text})
               .expect(200)
               .expect((res)=>{
                    expect(res.body.text).toBe(text);
               })
           .end((err, res) => {
            if(err){
                return done(err)
            }

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
           });
   });

   it('Should not create todo with invalid body data', (done) =>{
      request(app)
          .post('/todos')
          .set('x-auth', users[0].tokens[0].token)
          .send({text: ''})
          .expect(400)
          .end((err, res) => {
          if (err){
              return done(err)
          }

          Todo.find().then((todos) => {
            expect(todos.length).toBe(2);
            done();
          }).catch((e) => done(e));
          });
   });

});

describe('GET /todos', () => {
    it('Should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
            expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todo/:id', () =>{
   it('Should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
   });

    it('Should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });


   it('Should return 404 if todo not found', (done)=>{
       let id = new ObjectID;
       request(app)
           .get(`/todo/${id.toHexString}`)
           .set('x-auth', users[0].tokens[0].token)
           .expect(404)
           .end(done);
   });

   it('Sould return 404 for non-object ids', (done) => {
      request(app)
          .get('/todo/123')
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end(done);
   });
});


describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not remove a todo created by other user', (done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/123abc')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
   it('Should update the todo', (done) => {
       const id = todos[0]._id.toHexString();
       const text = "This is the new text";

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done)
   });

    it('Should not update the todo created another user', (done) => {
        const id = todos[0]._id.toHexString();
        const text = "This is the new text";

        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                completed: true,
                text
            })
            .expect(404)
            .end(done)
    });

   it('Should clear completedAt when todo is not completed', (done) => {
       const id = todos[1]._id.toHexString();
       const text = "This is the new text";

       request(app)
           .patch(`/todos/${id}`)
           .set('x-auth', users[1].tokens[0].token)
           .send({
               completed: false,
               text
           })
           .expect(200)
           .expect((res) => {
           expect(res.body.todo.text).toBe(text);
           expect(res.body.completed).toNotBe(true);
           expect(res.body.completedAt).toNotExist();
           })
           .end(done)

   });
});

describe('GET /users/me', () => {
   it('Should return user if authenticated', (done) => {
       request(app)
           .get('/users/me')
           .set('x-auth', users[0].tokens[0].token)
           .expect(200)
           .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
           })
           .end(done);
   });

   it('Sholud return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
   });
});

describe('POST /users', () => {
    it('Should create a user', (done) => {
        let email = 'example@example.com';
        let password = '123qbc';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toEqual(email);
            })
            .end((err) => {
            if(err){
                return done(err);
            }

            User.findOne({email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch((e) => done(e));

            });
    });

    it('Should reuturn validation errors if request invalid', (done) => {
        let email = 'algo';
        let password = '12';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.body.errors.password).toExist();
                expect(res.body.errors.email).toExist();
            })
            .end(done);

    });

    it('Should not create user if email in use', (done) => {
        let email = users[0].email;
        let password = 'password';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.body.code).toBe(11000);
            })
            .end(done);

    });
});

describe('POST /users/login', () => {
    it('Should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if(err){
                   return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                       access: 'auth',
                       token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => {
                    done(e);
                });
            });
    });

    it('Should reject invalid login', (done) => {

        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password + 'kiubas'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                User.findById(users[1]._id).then((user)=>{
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('DELETE /users/me/token', () => {
   it('Should remove auth token on log out', (done) => {
       request(app)
           .delete('/users/me/token')
           .set('x-auth', users[0].tokens[0].token)
           .expect(200)
           .end((err, res) => {
               if(err){
                   return done(err);
               }

               User.findById(users[0]._id).then((user) => {
                   expect(user.tokens.length).toBe(0);
                   done();
               }).catch((err) => done(err));
           });
   });
});