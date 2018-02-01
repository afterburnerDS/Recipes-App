
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

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Recipe } = require('./models');

app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

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

app.get('/recipes', (req, res) => {
  console.log("here");
  Recipe
    .find()
    .then(recipes => {
      res.json(recipes);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
})


// app.get('/posts/:id', (req, res) => {
//   BlogPost
//     .findById(req.params.id)
//     .then(post => res.json(post.serialize()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ error: 'something went horribly awry' });
//     });
// });

// app.get('/users/:id/recipes', (req, res) => {
//   Users
//     .find()
//     .then(posts => {
//       res.json(posts.map(post => post.serialize()));
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ error: 'something went terribly wrong' });
//     });
// });



// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
