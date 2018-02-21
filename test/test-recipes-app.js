'use strict';
global.DATABASE_URL = 'mongodb://127.0.0.1:27017/recipes-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { createAuthToken } = require('../auth/router');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const { Recipe } = require('../models');
const { User} = require('../users/models');
const {app, runServer, closeServer} = require('../server');
const { TEST_DATABASE_URL } = require('../config');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;


// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}


// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedRecipeData(user) {
  console.info('seeding recipes data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      title: faker.lorem.sentence(),
      instructions: faker.lorem.text(),
      ingredients: [
        {
        name: faker.lorem.word(),
        quantity: faker.random.number(),
        unit: faker.lorem.word()
      },
      {
        name: faker.lorem.word(),
        quantity: faker.random.number(),
        unit: faker.lorem.word()
      },
    ],
      author: user
    });
  }
  // this will return a promise
  return Recipe.insertMany(seedData);
}

function seedUserData() {
  console.info('seeding user data');
  return User.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });
}

describe('test recipes APP resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedUserData()
      .then(user => {
        return seedRecipeData(user)
      })
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  })

  let res;

  describe('POST login', function(){
    it('should login', function(){
      const userdata = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      User.hashPassword(userdata.password)
        .then(hash => User.create({...userdata, password: hash}))
        .then(user => chai.request(app)
          .post('/api/auth/login')
          .send({email: userdata.email, password: userdata.password})
        )
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          jwt.verify(res.body.authToken, JWT_SECRET).should.be.an('Object');
        })
    })
  });

  describe('POST Signup', function() {
    it('should signup', function(){

      const userdata = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      let created;

      return chai.request(app)
        .post('/api/users/')
        .send(userdata)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          created = res.body;
          created.should.be.a('object');
          created.should.include.keys('id', 'name', 'email');
          created.name.should.equal(userdata.name);
          created.email.should.equal(userdata.email);
          // cause Mongo should have created id on insertion
          created.id.should.not.be.null;
          return User.findById(created.id);
        })
        .then(function (user) {
          created.id.should.equal(user.id);
          created.name.should.equal(user.name);
          created.email.should.equal(user.email);
        });
    })
  })

  describe('GET recipes from user endpoint', function () {

    it('should return all existing recipes', function () {
      // strategy:
      //    1. get back all posts returned by by GET request to `/posts`
      //    2. prove res has right status, data type
      //    3. prove the number of posts we got back is equal to number
      //       in db.
      let res;
      let token;
      return User.findOne()
      .then(user => {
        token = createAuthToken(user.serialize());
        return chai.request(app)
        .get('/recipes')
        .set('Authorization',`Bearer ${token}`)
      })
      .then(_res => {
        res = _res;
        res.should.have.status(200);
        // otherwise our db seeding didn't work
        res.body.should.have.lengthOf.at.least(1);

        return Recipe.count();
      })
      .then(count => {
        // the number of returned posts should be same
        // as number of posts in DB
        res.body.should.have.lengthOf(count);
      });
    });

    it('should return recipes right fields', function () {
      // Strategy: Get back all posts, and ensure they have expected keys

      let resRecipe;
      let res;
      let token;
      return User.findOne()
      .then(user => {
        token = createAuthToken(user.serialize());
        return chai.request(app)
        .get('/recipes')
        .set('Authorization',`Bearer ${token}`)
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function (recipe) {
            recipe.should.be.a('object');
            recipe.should.include.keys('_id', 'title', 'instructions', 'ingredients', 'author');
          });
          // just check one of the posts that its values match with those in db
          // and we'll assume it's true for rest
          resRecipe = res.body[0];
          return Recipe.findById(resRecipe._id);
        })
        .then(recipe => {
          const data = recipe;
          resRecipe.title.should.equal(data.title);
          resRecipe.instructions.should.equal(data.instructions);
          resRecipe.ingredients.should.deep.equal(
            data.ingredients.map(i => i.toObject()));
          resRecipe.author.should.equal(data.author.toString());
        });
    });
  });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the post we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new blog post', function () {

      const newRecipe = {
        title: faker.lorem.sentence(),
        instructions: faker.lorem.text(),
        ingredients: [
          {
          name: faker.lorem.word(),
          quantity: faker.random.number(),
          unit: faker.lorem.word()
        },
        {
          name: faker.lorem.word(),
          quantity: faker.random.number(),
          unit: faker.lorem.word()
        },
      ],
        author: faker.random.alphaNumeric()
      };

      let token;
      return User.findOne()
      .then(user => {
        token = createAuthToken(user.serialize());
      return chai.request(app)
        .post('/recipes')
        .set('Authorization',`Bearer ${token}`)
        .send(newRecipe)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'instructions');
          res.body.title.should.equal(newRecipe.title);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.instructions.should.equal(newRecipe.instructions);
          return Recipe.findById(res.body.id);
        })
        .then(function (recipe) {
          recipe.title.should.equal(newRecipe.title);
          recipe.instructions.should.equal(newRecipe.instructions);
        });
    });
  });
})

  describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing post from db
    //  2. Make a PUT request to update that post
    //  4. Prove post in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        title: 'chicken nuggets',
        instructions: 'fry the nuggets',
        ingredients: [
          {
          name: 'chicken',
          quantity: 1,
          unit: 'pcs'
        },
        {
          name: 'nugget',
          quantity: 1,
          unit: 'pcs'
        },
      ]
      };

      return Recipe
        .findOne()
        .then(recipe => {
          updateData.id = recipe._id;
          let token;
          return User.findOne()
          .then(user => {
            token = createAuthToken(user.serialize());
          return chai.request(app)
          
            .put(`/recipes/${recipe._id}`)
            .set('Authorization',`Bearer ${token}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return Recipe.findById(updateData.id);
        })
        .then(recipe => {
          recipe.title.should.equal(updateData.title);
          recipe.instructions.should.equal(updateData.instructions);
          // recipe.ingredients.should.equal(updateData.ingredients);
          updateData.ingredients.should.deep.equal(
            recipe.ingredients.map(i => i.toObject())
          );
          // resRecipe.author.should.equal(data.author.toString());
        });
    });
  });
});

describe('DELETE endpoint', function () {
  // strategy:
  //  1. get a post
  //  2. make a DELETE request for that post's id
  //  3. assert that response has right status code
  //  4. prove that post with the id doesn't exist in db anymore
  it('should delete a post by id', function () {

    let recipe;

    return Recipe
      .findOne()
      .then(_recipe => {
        recipe = _recipe;
        let token;
        return User.findOne()
        .then(user => {
        token = createAuthToken(user.serialize());
        return chai.request(app)
        .delete(`/recipes/${recipe._id}`)
        .set('Authorization',`Bearer ${token}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Recipe.findById(recipe.id);
        })
        .then(_recipe => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_post.should.be.null` would raise
          // an error. `should.be.null(_post)` is how we can
          // make assertions about a null value.
          should.not.exist(_recipe);
        });
      })
      
     
  });
});

});

      it('should return 200 and return index.html', function() {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.
        return chai.request(app)
          .get('/')
          .then(function(res) {
            expect(res).to.have.status(200);

          });
      });