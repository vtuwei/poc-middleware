var
  chai = require('chai')
  , expect = chai.expect
  , utils = require('../app/utils')
  , salt = 'hard to crack'
  , str = 'this is a test string';

describe('util', function() {
    it('should encrypt a string', function() {

      var encrypted = utils.encrypt(salt, str);
      expect(encrypted).to.not.equal(str);
      expect(encrypted).to.have.length.above(str.length);
    });

    it('should decrypt a string', function() {

      var encrypted = utils.encrypt(salt, str);
      var decrypted = utils.decrypt(salt, encrypted);

      expect(decrypted).to.not.equal(encrypted);
      expect(decrypted).to.equal(str);
    });
});
