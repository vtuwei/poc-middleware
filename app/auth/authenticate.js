var
  jwt = require('jsonwebtoken')
  , rp = require('../helpers/request-promise')
  , utils = require('../utils');

module.exports = {
  auth: auth,
  logout: logout,
  auth_user: auth_user
};

function auth(App, username, password, params) {

  //load user from db
  return auth_user(App, username, password)
    .then(function(user_data) {

      return generate_token(App, user_data)
        .then(function(token) {

          var credentials = {
            username: username,
            password: password
          }

          return store_token(App, user_data, token, credentials);
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

  return rp.request(options)
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

  var id_encrypted = utils.encrypt(App.config.auth.secret, user.uuid + '__' + user_data.sessionId);

  return new Promise(function(resolve, reject) {

    var obj = {
      id: id_encrypted,
      sessionID: user_data.sessionId
    };

    var token = jwt.sign(obj, App.config.auth.secret, {
      expiresIn: App.config.auth.expiresIn,
      algorithm: App.config.auth.algorithm
    });

    resolve({
      token: token,
      id_encrypted: id_encrypted
    });
  });
}

function store_token(App, user_data, token_data, credentials) {

  var token = token_data.token;
  var id_encrypted = token_data.id_encrypted;

  var redis_object = {
    user_data: user_data,
    credentials: credentials
  };

  var encrypted = utils.encrypt(App.config.auth.secret, JSON.stringify(redis_object));

  var redis = App.get('redis');

  return new Promise(function(resolve, reject) {

    redis.set(id_encrypted, encrypted, function(err, resp) {

      if(!err) {

        resolve({
          success: true,
          token: token
        })
      } else {

        reject({
          success: false,
          message: 'Something went wrong. Please try again after some time'
        });
      }
    });
  });
}

function logout(App, token) {

  return new Promise(function(resolve, reject) {

    jwt.verify(token, App.config.auth.secret, function(err, decoded) {

      if (err) {

        reject({ success: false, message: 'Failed to authenticate token' });
      } else {

        var id = decoded.id;

        var redis = App.get('redis');

        redis.get(id, function(err, data) {

          if(!err) {

            if(!data) {
              reject({ success: false, message: 'Failed to authenticate token' });
              return;
            }

            var user_data = JSON.parse(
              utils.decrypt(App.config.auth.secret, data)
            );

            //delete session and remove the object from redis

            var username = user_data.credentials.username;
            var password = user_data.credentials.password;

            var amrsUrl = App.config.amrs.url;

            var url = amrsUrl + '/amrs/ws/rest/v1/session';

            var auth = 'Basic ' + new Buffer(username + ":" + password).toString('base64');

            var options = {
              method: 'DELETE',
              uri: url,
              headers: {
                'Authorization': auth
              },
              json: true // Automatically stringifies the body to JSON
            };

            rp.request(options)
                .then(function (parsedBody) {

                  redis.del(id);
                  resolve({
                    success: true
                  })
                })
                .catch(function (err) {
                  reject({
                    success: false,
                    error: err.message
                  })
                });

          } else {
            reject({ success: false, message: 'Failed to authenticate token' });
          }
        });
      }
    });
  });
}
