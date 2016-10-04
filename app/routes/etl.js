var
  express = require('express')
  , authorize = require('../auth/authorize');

module.exports.route = function(App) {

  var router = express.Router();
  var config = App.config;
  var proxy = App.etlProxy;

  authorize.auth(App, router);

  router.get(/\/etl(.*)/, function(req, res) {
    console.log('etl')
    proxy.web(req, res, { target: config.etl.url });
  });

  router.post(/\/etl(.*)/, function(req, res) {
    console.log('etl post')
    proxy.web(req, res, { target: config.etl.url });
  });

  return router;
}
