const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middleware - verificar se usuário já existe
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: "User not found!"});
  }

  request.user = user;

  return next();
}

//Middleware - verificar se o todo existe
function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  request.todo = user.todos[todoIndex];

  return next();
}


app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userExists = users.some (
    user => user.username === username
  );

  if (userExists) {
    return response.status(400).json({ error: "User already exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const todosAdd = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  }

  user.todos.push(todosAdd);

  return response.status(201).json(todosAdd);
});


app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);  
});


app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(200).json(todo);
});


app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo, user} = request;

  const todoDelete = user.todos.findIndex((todoDeleteIndex) => todoDeleteIndex === todo);  
   
  user.todos.splice(todoDelete, 1);

  return response.status(204).json();  
});

module.exports = app;