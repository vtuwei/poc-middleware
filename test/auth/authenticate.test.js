var
  chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , rp = require('../../app/helpers/request-promise')
  , redis = require("fakeredis")
  , App = require('../../app/main')
  , config = require('../../app/config')
  , auth = require('../../app/auth/authenticate');

  describe('Authenticate', function() {

    var sandbox;
    var rpStub;
    var redisClient;
    var username = 'test3';
    var password = 'test1234';

    beforeEach(function() {

      redisClient = redis.createClient(6379, 'localhost', { fast: true });
      App.set("redis", redisClient);

      sandbox = sinon.sandbox.create();

      sandbox.stub(App, 'init');
      rpStub = sandbox.stub(rp, 'request');

    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should return a token when the right credentials are provided', function(done) {

      rpStub.returns(Promise.resolve({
        authenticated: true,
        sessionId: 'sessionId',
        user: {
          username: username
        }
      }));

      auth.auth(App, username, password, {})
        .then(function(data) {

          expect(data.success).to.be.true;
          expect(data.token).to.be.a('string');
          expect(data.token).to.have.length.above(20);

          done();
        });
    });

    it('should return success when logout function is called', function(done) {

      rpStub.returns(Promise.resolve({
        authenticated: true,
        sessionId: 'sessionId',
        user: {
          username: username
        }
      }));

      auth.auth(App, username, password, {})
        .then(function(data) {

          rpStub.returns(Promise.resolve({
            success: true
          }));

          var token = data.token;

          auth.logout(App, token)
            .then(function(resp) {

              expect(data.success).to.be.true;
              done();
            })
        });
    });
});
