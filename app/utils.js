module.exports = {
  is_email: is_email,
  encrypy: encrypy
}

function is_email(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function encrypy(salt, password) {

  var sha1 = require('sha1');
  var sha256 = require('sha256');

  return sha1(sha256(password + salt) + salt);
};
