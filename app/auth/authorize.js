var
  jwt = require('jsonwebtoken');

module.exports = {
  auth: auth
}

function auth (App, route) {

  route.use(function(req, res, next) {

    var params = req.method == 'POST' ? req.body: req.query;

    var token = req.headers['x-access-token'] || params.token;

    if(token && token.length > 0) {

      console.log(App)

      jwt.verify(token, App.config.auth.secret, function(err, decoded) {

        if (err) {

          res.json({ success: false, message: 'Failed to authenticate token' });
        } else {

          var id = decoded.id;

          next();

          // var redis = App.get('redis');
          //
          // redis.get(id, function(err, data) {
          //
          //   if(!err) {
          //     req.user = JSON.parse(data);
          //     next();
          //   } else {
          //     res.json({ success: false, message: 'Failed to authenticate token' });
          //   }
          // });
        }
      });
    } else
      res.json({ success: false, message: 'Failed to authenticate token' });
  });
};
