const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('test recipes APP resource', function () {

    // before(function() {
    //     return runServer();
    //   });
    
    //   // although we only have one test module at the moment, we'll
    //   // close our server at the end of these tests. Otherwise,
    //   // if we add another test module that also has a `before` block
    //   // that starts our server, it will cause an error because the
    //   // server would still be running from the previous tests.
    //   after(function() {
    //     return closeServer();
    //   });


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
  });

