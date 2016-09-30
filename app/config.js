var config = function(env) {

  var e = env ? env: process.env.NODE_ENV;

  switch(e) {
    case 'production':
    	return require("./environments/production");
    	break;
    case 'staging':
    	return require("./environments/staging");
    	break;
    default:
    	return require("./environments/config");
    	break;
  }
}

module.exports.init = config;
