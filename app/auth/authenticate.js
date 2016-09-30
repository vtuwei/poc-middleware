var
  passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var user = {
  username: 'test3',
  password: 'Ampath123',
  id: 1
}

passport.use(new LocalStrategy(
  function(username, password, done) {
    findUser(username)
      .then(function(user) {

        if (err) {
          return done(err)
        }
        if (!user) {
          return done(null, false)
        }
        if (password !== user.password  ) {
          return done(null, false)
        }
        return done(null, user)
      });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  findUser(username)
    .then(function(user) {
      cb(null, user);
    });
});

function findUser(username) {

  return new Promise(function(resolve, reject) {
    resolve(user);
  });
}
