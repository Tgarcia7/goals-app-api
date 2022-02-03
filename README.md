# Goals-api

Node.js RESTful API to perform the actions of Goals application (https://github.com/Tgarcia7/goals). 

# Initial config 

```
DB_URI=mongodb://mongo:27017/
DB_NAME=goals-test
SECRET_TOKEN=3{5j*%Y*g7&G@qgr
```

# Tests

```
$ bin/test_setup
$ docker-compose --file docker-compose.ci.yml run --rm api bin/test
```
