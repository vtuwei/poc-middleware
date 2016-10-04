/*
 * Simple memory store
 */

var store = {};

module.exports = {

  set: function(key, value) {
    store[key] = value;
  },

  get: function(key) {
    return store[key];
  }
}
