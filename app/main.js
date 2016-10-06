var
  cluster = require('cluster')
  , express = require('express')
  , expressValidator = require('express-validator')
  , fs = require('fs')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  , config = require('./config')
  , multipart = require('connect-multiparty');
  
var
  indexRouter = require('./routes/index')
  , authRouter = require('./routes/auth')
  , etlRouter = require('./routes/etl')
  , amrsRouter = require('./routes/amrs')
  , logger = require('./logger')
  , services = require('./services')
  , proxy = require('./proxy')
  , store = require('./store');

var App = {
  config: null,
  express: null,
  server: null,
  log: null,
  init: function () {

    this.config = config.init();

    this.express = express();

    this.express.use(multipart());

    this.express.use(bodyParser.urlencoded({ extended: true }));

    // parse application/json
    this.express.use(bodyParser.json());

    this.express.use(expressValidator());

    this.log = logger.init(App);

    services.init(App)
      .then(function() {

        proxy.init(App);
        App.routes();
      });


    return this;
  },
  routes: function() {

    this.express.use("/", indexRouter.route(App));
    this.express.use("/", authRouter.route(App));

    var amrsRoute = amrsRouter.route(App);
    this.express.use("/", amrsRoute);

    var etlRoute = etlRouter.route(App);
    this.express.use("/", etlRoute);
  },
  set: function(key, value) {
    store.set(key, value);
  },
  get: function(key) {
    return store.get(key);
  }
};

module.exports = App.init();
