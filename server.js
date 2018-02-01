const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');


app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));

// app.listen(process.env.PORT || 8080);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });

app.get('/api/select', (req, res) => {
  const term = req.query.term;
  axios.get("https://trackapi.nutritionix.com/v2/search/instant",
  {params: {
      query: term,
    },
    headers: {
      'x-app-id': 'a515ad4e',
      'x-app-key': '72b4d04544a268da7ec4249b07cd1548'
    },

}).then(response => {
    console.log(response.data.common[0].photo);
    res.json({results: response.data.common.map(ingredient =>( {
      id: ingredient.tag_id,
      text: ingredient.food_name
    }))});
} ).catch(
  err => {
    console.log(err);
    res.sendStatus(500);
  }
)
  console.log(req.query);
  
});

api.get('/user/recipes', (req, res) => {

})


app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

app.get('/users/:id/recipes', (req, res) => {
  Users
    .find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});



// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}  

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};