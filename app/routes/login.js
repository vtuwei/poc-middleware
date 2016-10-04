var
  express = require('express')
  , crypto = require('crypto')
  , jsonwebtoken = require('jsonwebtoken')
  , auth = require('../auth/authenticate');

  var user = {
    hashedPassword: "f5f590b9fd0ab1a1e3d5ed6187e9ae95b23f6cf6988f9dcfe1b52b6ce7ecefe9348bde21a0e8c555ba5e68ed88dd18afc1cfe1df02e0aeeba8e49d4cd6f9786f78e1f24294a1b628b2a09d16e6e1c6f223ae42842eec81cb11eab37327471bb427c41712817db1eb34dd583a1b211b5323fbe0fb3d222910b56aead2407fd088",
    salt: "mRkhoMs54+NG/l/7v+4rGakLoenH7TCAD8cmx6IEXUtg4c/d0yscMn/I06w/jzGQgDBpu+AttuErRpU0/PocYxUUE+i0DeLumVjLmwzMZ103fxuwAGRRx17Wv+zo57JXTDjxRssYRS1VvUGUq0q03SR8/x931f5+2/NkbZfqqDo=",
    username: "vincent"
};

module.exports.route = function(App) {

  var router = express.Router();

  var length = 128;
  var secret = '234dfdn'

  router.post('/api/authenticate', function(req, res) {

    //TODO add validation



    var username = req.body.username;
    var password = req.body.password;

    auth.auth(App, username, password, {})
      .then(function(data) {
        res.json(data);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  return router;
}
