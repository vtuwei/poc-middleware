require('ssl-root-cas').inject();

var
  cluster = require('cluster')
  , numCPUs = require('os').cpus().length
  , App = require(__dirname + '/app/main')
  , express = App.express
  , config = App.config;

if(!config)
  throw "config file is required";

if(config.useCluser) {

  if (cluster.isMaster) {
    
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
      if(config.refork_on_crush)
        cluster.fork();
    });

  } else {

    var server = express.listen(config.port);
    server.on("error", onError);
    server.on("listening", onListening);
  }

} else {

  var server = express.listen(config.port);
  server.on("error", onError);
  server.on("listening", onListening);
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  console.log("Listening on " + bind);
}
