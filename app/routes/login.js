var
  express = require('express');

module.exports.route = function(App) {

  var router = express.Router();

  router.post('/login', function(req, res) {
    res.json({
      name: 'loggedin'
    })
  });

  return router;
}
