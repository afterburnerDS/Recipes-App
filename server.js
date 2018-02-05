const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const {
  Strategy: LocalStrategy
} = require('passport-local');
const app = express();

const {
  router: usersRouter
} = require('./users');
const {
  router: authRouter,
  localStrategy,
  jwtStrategy
} = require('./auth');

mongoose.Promise = global.Promise;

const {
  PORT,
  DATABASE_URL
} = require('./config');
const {
  Recipe
} = require('./models');

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// passport.use(localStrategy);
passport.use(jwtStrategy);

passport.use(localStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

// app.listen(process.env.PORT || 8080);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/select', (req, res) => {
  const term = req.query.term;
  axios.get("https://trackapi.nutritionix.com/v2/search/instant", {
    params: {
      query: term,
    },
    headers: {
      'x-app-id': 'a515ad4e',
      'x-app-key': '72b4d04544a268da7ec4249b07cd1548'
    },

  }).then(response => {
    console.log(response.data.common[0].photo);
    res.json({
      results: response.data.common.map(ingredient => ({
        id: ingredient.tag_id,
        text: ingredient.food_name
      }))
    });
  }).catch(
    err => {
      console.log(err);
      res.sendStatus(500);
    }
  )
  console.log(req.query);

});

//get the last 3 recipes

app.get('/recipes', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  console.log("here");
  Recipe
    .find({
      author: req.user
    })
    .then(recipes => {
      res.json(recipes);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something went terribly wrong'
      });
    });
})

// get one recipe based on id
app.get('/recipes/:id', (req, res) => {
  Recipe
    .findById(req.params.id)
    .then(recipe => res.json(recipe.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'something went horribly awry'
      });
    });
});

//new recipe
app.post('/recipes', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  console.log(req.body);
  const requiredFields = ['title', 'instructions', 'ingredients'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Recipe
    .create({
      title: req.body.title,
      instructions: req.body.instructions,
      ingredients: req.body.ingredients,
      author: req.user

    })
    .then(Recipe => res.status(201).json(Recipe.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went wrong'
      });
    });

});

// delete recipe
app.delete('/recipes/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {


  // Recipe
  //         .findByIdAndRemove(req.params.id)
  //         .then(() => {
  //           res.status(204).json({
  //             message: 'success'
  //           });
  //         })
  //         .catch(err => {
  //           console.error(err);
  //           res.status(500).json({
  //             error: 'something went terribly wrong'
  //           });
  //         });

  Recipe
    .findById(req.params.id)
    .then(recipe => {
      console.log(recipe.author);
      console.log(req.user._id);
      // console.log(Recipe);


      if (recipe.author.toString() === req.user._id.toString()) {

        Recipe
          .findByIdAndRemove(req.params.id)
          .then(() => {
            res.status(204).json({
              message: 'success'
            });
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({
              error: 'something went terribly wrong'
            });
          });
      } else {
        res.status(401).json({
          message: "no authorization"
        })
      }
    })

});

//update recipes
app.put('/recipes/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'instructions', 'ingredients'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Recipe
    .findById(req.params.id)
    .then(recipe => {
      console.log(recipe.author);
      console.log(req.user._id);
      // console.log(Recipe);


      if (recipe.author.toString() === req.user._id.toString()) {

        Recipe
          .findByIdAndUpdate(req.params.id, {
            $set: updated
          }, {
            new: true
          })
          .then(updatedRecipe => res.status(204).end())
          .catch(err => res.status(500).json({
            message: 'Something went wrong'
          }));
      } else {
        console.log("nop");
      }
    })


});
// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {
      useMongoClient: true
    }, err => {
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

module.exports = {
  runServer,
  app,
  closeServer
};