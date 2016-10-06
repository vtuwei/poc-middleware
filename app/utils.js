var
  crypto = require('crypto')
  , algorithm = 'aes-256-ctr';

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}

function encrypt(salt, text) {
  var cipher = crypto.createCipher(algorithm,salt)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(salt, text) {
  var decipher = crypto.createDecipher(algorithm,salt)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
