var
  _ = require('underscore')
  , bunyan = require('bunyan')
  , ElasticSearch = require('bunyan-elasticsearch');;

module.exports.init = function(App) {

  var config = App.config;

  var logger_config = config.logger;
  logger_config.streams = create_streams(App, logger_config.streams);
  logger_config.serializers = bunyan.stdSerializers;

   var log = bunyan.createLogger(logger_config);
   return log;
};

function create_streams(App, streams) {

  var str = [];

  _.each(streams, function(stream) {

    switch(stream) {

      case 'stdout':

        str.push({
          stream: process.stdout
        });

        break;
      case 'elasticsearch':

        var esStream = new ElasticSearch({
          indexPattern: '[logstash-]YYYY.MM.DD',
          type: 'logs',
          host: App.config.elastic_search.host
        });

        esStream.on('error', function (err) {
          console.log('Elasticsearch Stream Error:', err.stack);
        });
        
        str.push({
          stream: esStream
        });

        break;
    }
  });

  return str;
}
