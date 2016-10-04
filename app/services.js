var
  elasticsearch = require('elasticsearch')
  , redis = require('redis');

module.exports.init = function(App) {

  return init_redis(App)
    .then(function(redis) {
      App.set('redis', redis);
      return init_elastic_search(App)
        .then(function(elastic_client) {
          App.set('elastic_client', elastic_client);
        });
      });
};

function init_redis(App) {

  var config = App.config;
  var redis_options = config.redis.options;

  return new Promise(function(resolve, reject) {

    var redisClient = redis.createClient(
  		config.redis.port,
  		config.redis.host,
      redis_options
    );

    redisClient.on('connect', function() {

			App.log.info({
				key: 'redis'
			}, "redis connection established");

      resolve(redisClient);
		});

    redisClient.on("error", function (err) {

			App.log.error({
				error: err,
        key: 'redis'
			}, "error connecting to redis on worker ");

      reject(err);
	  });
  });
}

function init_elastic_search(App) {

  var config = App.config;

  var elasticClient = new elasticsearch.Client({
    host: config.elastic_search.host,
    //log: config.elastic_search.log
  });

  return new Promise(function(resolve, reject) {
    elasticClient.ping({
      requestTimeout: Infinity,
      hello: "elasticsearch!"
    }, function(err) {

      if(err)
        reject(err);
      else
        resolve(elasticClient);
    });
  });
}
