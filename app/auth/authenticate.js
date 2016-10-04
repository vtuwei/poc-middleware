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
          reject(data);
        }
      });
    })
    .catch(function (err) {
        return new Promise(function(resolve, reject) {
          reject({
            authenticated: false,
            error: err.message
          })
        });
    });
};

function generate_token(App, user) {

  var id_encrypted = utils.encrypy(App.config.auth.secret, user.id + '');

  return new Promise(function(resolve, reject) {

    var token = jwt.sign({ id: id_encrypted }, App.config.auth.secret, {
      expiresIn: '2 days', // expires in 48 hours
      algorithm: 'HS512'
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
      user_data: user_data
    })
  });

  // var token = token_data.token;
  // var id_encrypted = token_data.id_encrypted;
  //
  // var redis_object = {
  //   user: {
  //     id: user.id,
  //     username: user.username,
  //     email: user.email,
  //     image_path: user.image_path,
  //     status: user.status,
  //     createdAt: user.createdAt
  //   }
  // }
  //
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
