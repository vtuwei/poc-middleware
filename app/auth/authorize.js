var
  jwt = require('jsonwebtoken')
  , utils = require('../utils');

module.exports.auth = function(App, route) {

  route.use(function(req, res, next) {

    var params = req.method == 'POST' ? req.body: req.query;

    var token = req.headers['x-access-token'] || params.token;

    if(token && token.length > 0) {

      jwt.verify(token, App.config.auth.secret, function(err, decoded) {

        if (err) {

          res.status(401).json({ success: false, message: 'Failed to authenticate token' });
        } else {

          var id = decoded.id;

          var redis = App.get('redis');

          redis.get(id, function(err, data) {

            if(!err) {

              var parsed = JSON.parse(
                utils.decrypt(App.config.auth.secret, data)
              );

              req.user = parsed;
              log(App, req);

              var midpoint = new Date((decoded.iat + decoded.exp) * 1000 / 2);

              var now = new Date();

              if(midpoint < now) {

                var new_token = renewToken(App, parsed.user_data, decoded);

                res.set('x-access-token', new_token);
                next();

              } else
                next();

            } else {
              res.status(401).json({ success: false, message: 'Failed to authenticate token' });
            }
          });
        }
      });
    } else
      res.status(401).json({ success: false, message: 'Failed to authenticate token' });
  });
};

function renewToken(App, user_data, decoded) {

  var user = user_data.user;

  var id_encrypted = utils.encrypt(App.config.auth.secret, user.uuid + '__' + user_data.sessionId);

  var token = jwt.sign({ id: id_encrypted }, App.config.auth.secret, {
    expiresIn: App.config.auth.expiresIn,
    algorithm: App.config.auth.algorithm
  });

  return token;
}

function log(App, req) {

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var path = req.originalUrl;

  if(req.user) {

    var username = req.user.user_data.user.username;

    App.log.info({
      username: username,
      key: 'req',
      ip: ip,
      path: path
    }, 'request');
  }
}
