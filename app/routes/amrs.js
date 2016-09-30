var
  express = require('express');

module.exports.route = function(App) {

  var router = express.Router();
  var config = App.config;
  var proxy = App.amrsProxy;

  router.get(/\/amrs(.*)/, function(req, res) {
    console.log('amrs')
    proxy.web(req, res, { target: config.amrs.url });
  });

  router.post(/\/amrs(.*)/, function(req, res) {
    console.log('amrs post')
    proxy.web(req, res, { target: config.amrs.url });
  });

  return router;
}
