var
  cluster = require('cluster')
  , express = require('express')
  , bunyan = require('bunyan')
  , fs = require('fs')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  , config = require('./config')
  , url = require('url')
  , httpProxy = require('http-proxy');

var
  indexRouter = require('./routes/index')
  , loginRouter = require('./routes/login')
  , etlRouter = require('./routes/etl')
  , amrsRouter = require('./routes/amrs');

var App = {
  config: null,
  express: null,
  server: null,
  log: null,
  init: function () {

    this.config = config.init();

    this.express = express();

    this.express.use(require('cookie-parser')());
    this.express.use(require('body-parser').urlencoded({ extended: true }));

    this.proxies();
    this.routes();

    return this;
  },
  proxies: function() {

    var https = require('https');

    var etlParams = {
      target: this.config.etl.url,
      headers: {
        host: url.parse(this.config.etl.url).hostname
      }
    };

    if(url.parse(this.config.etl.url).protocol.indexOf('https') != -1) {
      etlParams.secure = false;
      etlParams.agent = https.globalAgent;
    }

    var amrsParams = {
      target: this.config.amrs.url,
      headers: {
        host: url.parse(this.config.amrs.url).hostname
      }
    };

    if(url.parse(this.config.amrs.url).protocol === 'https') {
      amrsParams.agent = https.globalAgent;
    }

    if(this.config.useCluser && !cluster.isMaster) {

      var workerId = cluster.worker.id;

      App.etlProxy = httpProxy.createProxyServer(etlParams)
        .listen(this.config.etl.proxyRange[0] + (workerId -1));

      App.amrsProxy = httpProxy.createProxyServer(amrsParams)
        .listen(this.config.amrs.proxyRange[0]+ (workerId -1));

    } else if (!this.config.useCluser) {

      App.etlProxy = httpProxy.createProxyServer(etlParams)
        .listen(this.config.etl.proxyRange[0]);

      App.amrsProxy = httpProxy.createProxyServer(amrsParams)
        .listen(this.config.amrs.proxyRange[0]);

    }
  },
  routes: function() {

    this.express.use("/", indexRouter.route(App));
    this.express.use("/", loginRouter.route(App));
    this.express.use("/", amrsRouter.route(App));
    this.express.use("/", etlRouter.route(App));
  }
};

module.exports = App.init();
