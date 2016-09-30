var
  express = require('express');

module.exports.route = function(App) {

  var router = express.Router();
  var config = App.config;
  var proxy = App.etlProxy;

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
