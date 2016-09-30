var
  express = require('express');

module.exports.route = function(App) {

  var router = express.Router();

  router.get('/', function(req, res) {
    res.json({
      name: 'vincent'
    })
  });

  return router;
}
