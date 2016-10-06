var
  httpProxy = require('http-proxy')
  , multipart = require('connect-multiparty')
  , cluster = require('cluster')
  , url = require('url');
  
module.exports.init = function(App) {

  var config = App.config;

  var https = require('https');

  var etlParams = {
    target: config.etl.url,
    headers: {
      host: url.parse(config.etl.url).hostname
    }
  };

  if(url.parse(config.etl.url).protocol.indexOf('https') != -1) {
    etlParams.secure = false;
    etlParams.agent = https.globalAgent;
  }

  var amrsParams = {
    target: config.amrs.url,
    cookieDomainRewrite: "",
    headers: {
      host: url.parse(config.amrs.url).hostname
    }
  };

  if(url.parse(config.amrs.url).protocol === 'https') {
    amrsParams.agent = https.globalAgent;
  }

  App.etlProxy = httpProxy.createProxyServer(etlParams);

  App.amrsProxy = httpProxy.createProxyServer(amrsParams);

  if(config.useCluser && !cluster.isMaster) {

    var workerId = cluster.worker.id;

    App.etlProxy.listen(config.etl.proxyRange[0]);
    App.amrsProxy.listen(config.amrs.proxyRange[0]);

    intercept(App, App.etlProxy);
    intercept(App, App.amrsProxy);

  } else if (!config.useCluser) {

    App.etlProxy = httpProxy.createProxyServer(etlParams);
    App.amrsProxy = httpProxy.createProxyServer(amrsParams);

    intercept(App, App.etlProxy);
    intercept(App, App.amrsProxy);
  }
};

function intercept(App, proxy) {

  proxy.on('proxyReq', function(proxyReq, req, res, options) {

    var credentials = req.user.credentials;
    var str = credentials.username + ":" + credentials.password;

    var auth = 'Basic ' + new Buffer(str).toString('base64');

    // proxyReq.setHeader('cookie', 'jsessionid=' + req.user.user_data.sessionId)
    // proxyReq.setHeader('set-cookie', 'jsessionid=' + req.user.user_data.sessionId)
    proxyReq.setHeader('Authorization', auth);

  });

  proxy.on('proxyRes', function (proxyRes, req, res) {
    //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    // proxyRes.on('data', function (chunk) {
    //   console.log(chunk.toString())
    // });
  });

}
