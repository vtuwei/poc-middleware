var
  rp = require('request-promise');

module.exports.request = function(options) {

  return rp(options);
};
