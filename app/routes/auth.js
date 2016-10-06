var
  express = require('express')
  , crypto = require('crypto')
  , jsonwebtoken = require('jsonwebtoken')
  , auth = require('../auth/authenticate');

module.exports.route = function(App) {

  var router = express.Router();

  router.post('/api/authenticate', function(req, res) {

    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {

      res.status(400).json({
        success: false,
        errors: errors
      });

      return;
    }

    var username = req.body.username;
    var password = req.body.password;

    auth.auth(App, username, password, {})
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        res.status(401).json(err);
      });
  });

  router.get('/api/logout', function(req, res) {

    var params = req.method == 'POST' ? req.body: req.query;

    var token = req.headers['x-access-token'] || params.token;

    auth.logout(App, token)
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        res.json(err); //
      });
  });

  return router;
}
