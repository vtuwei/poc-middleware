POC MIDDLEWARE
===============

This is node project using express server. It provides a single point of entry for [etl-rest-server](https://github.com/AMPATH/etl-rest-server) and opemrs. It handles authentication using JSON Web Tokens (JWT). Request to [etl-rest-server](https://github.com/AMPATH/etl-rest-server) and openmrs are proxied.

To setup the project run

```$ git clone https://github.com/AMPATH/poc-middleware.git```

```$ cd poc-middleware ```

```$ npm install```

```$ mkdir conf && cd conf```

Create a config.json file

```$ cat config.json```

With the following content

```json
{
  "port": 4000,
  "useCluser": true,
  "auth": {
    "secret": "xxxx",
    "expiresIn": "30m",
    "algorith": "HS512"
  },
  "redis": {
    "port": 6379,
    "host": "127.0.0.1",
    "options": {},
    "use_password": false
  },
  "etl": {
    "url": "ETL-URL-HERE",
    "proxyRange": [9300, 9400]
  },
  "amrs": {
    "url": "AMRS-URL-HERE",
    "proxyRange": [9100, 9200]
  },
  "elastic_search": {
    "host": "localhost:9200",
    "log": "info"
  },
  "logger": {
    "name": "log",
    "streams": [ "stdout", "elasticsearch" ]
  }
}

