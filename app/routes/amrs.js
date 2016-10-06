var
  express = require('express')
  , authorize = require('../auth/authorize');

module.exports.route = function(App) {

  var router = express.Router();
  var config = App.config;
  var proxy = App.amrsProxy;

  authorize.auth(App, router);

  router.get(/\/amrs(.*)/, function(req, res) {
    proxy.web(req, res, { target: config.amrs.url });
  });

  router.post(/\/amrs(.*)/, function(req, res) {
    proxy.web(req, res, { target: config.amrs.url });
  });

  return router;
}
