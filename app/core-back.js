var
  express = require('express')
  , cluster = require('cluster')
  , bunyan = require('bunyan')
  , fs = require('fs')
  , numCPUs = require('os').cpus().length
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  , config = require('./config')
  , passport = require('passport')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , proxy = require('express-http-proxy')
  , LocalStrategy = require('passport-local').Strategy;

var App = {
  config: null,
  express: null,
  server: null,
  log: null,
  start: function () {
    App.config = config.init();

    if(!App.config)
      throw "config file is required";

      var cores = isNaN(App.config.cores) ? numCPUs : App.config.cores > numCPUs ? numCPUs : App.config.cores;

      if (cluster.isMaster) {

  			for (var i = 0; i < cores; i++) {
  				cluster.fork();
  			}

  			cluster.on('exit', function(worker, code, signal) {
          if(App.config.refork_on_crush)
            cluster.fork();
  			});

  		} else {
  			//App.log = bunyan.createLogger(App.config.bunyan(App, cluster.worker.id));
  			this.init();
  		}
  },
  init: function() {

    App.express = express();

    App.express.use(require('cookie-parser')());
    App.express.use(require('body-parser').urlencoded({ extended: true }));

    App.express.use(session({
      store: new RedisStore({
        url: App.config.redis.url
      }),
      secret: App.config.session.secret,
      resave: false,
      saveUninitialized: false
    }));

  //  App.attach_auth();
    App.express.use(passport.initialize())
    App.express.use(passport.session())


    App.express.use(function(req, res, next){

      console.log(req.isAuthenticated());
      next();
    });

    App.init_routes();

    App.server = App.express.listen(App.config.port, function() {
      console.log('ussd server started on port: ' + App.server.address().port);
    });
  },
  init_routes: function() {
    var router = express.Router();

    fs.readdirSync(__dirname + '/routes/').forEach(function (file) {
			if(file.substr(-3) == '.js') {
				route = require(__dirname + '/routes/' + file);
				route.route(App, router);
			}
		});
    App.express.use('/', router);
  }
};

module.exports = App;
