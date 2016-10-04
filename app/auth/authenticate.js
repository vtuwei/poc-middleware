var
  jwt = require('jsonwebtoken')
  , rp = require('request-promise')
  , utils = require('../utils');

module.exports = {
  auth: auth
}

function auth(App, username, password, params) {

  //load user from db
  return auth_user(App, username, password)
    .then(function(user_data) {

      return generate_token(App, user_data)
        .then(function(token) {

          return store_token(App, user_data, token);
        });
    });
};

function auth_user(App,username, password) {

  var amrsUrl = App.config.amrs.url;

  var url = amrsUrl + '/amrs/ws/rest/v1/session';

  var auth = 'Basic ' + new Buffer(username + ":" + password).toString('base64');

  var options = {
    uri: url,
    headers: {
      'Authorization': auth
    },
    json: true // Automatically parses the JSON string in the response
  };

  return rp(options)
    .then(function (data) {

      return new Promise(function(resolve, reject) {

        if(data && data.authenticated)
          resolve(data);
        else {

          //TODO - handle login retries
          reject({
            success: false,
            data: data
          });
        }
      });
    })
    .catch(function (err) {
        return new Promise(function(resolve, reject) {
          reject({
            success: false,
            data: {
              authenticated: false,
              error: err.message
            }
          });
        });
    });
};

function generate_token(App, user_data) {

  var user = user_data.user;

  var id_encrypted = utils.encrypy(App.config.auth.secret, user.uuid + '');

  return new Promise(function(resolve, reject) {

    var token = jwt.sign({ id: id_encrypted }, App.config.auth.secret, {
      expiresIn: App.config.auth.expiresIn, // expires in 48 hours
      algorithm: App.config.auth.algorithm
    });

    resolve({
      token: token,
      id_encrypted: id_encrypted
    });
  });
}

function store_token(App, user_data, token_data) {

  return new Promise(function(resolve, reject) {

    resolve({
      success: true,
      token: token_data.token,
      data: user_data
    })
  });

  var token = token_data.token;
  var id_encrypted = token_data.id_encrypted;

  var redis_object = {
    user_data: user_data
  }

  // var redis = App.get('redis');
  //
  // return new Promise(function(resolve, reject) {
  //
  //   redis.set(id_encrypted, JSON.stringify(redis_object), function(err, resp) {
  //
  //     if(!err) {
  //       resolve({
  //         success: true,
  //         token: token
  //       })
  //     } else {
  //
  //       reject({
  //         success: false,
  //         message: 'Something went wrong. Please try again after some time'
  //       });
  //     }
  //   });
  // });
}
