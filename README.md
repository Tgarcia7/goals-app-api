# Goals-api

Node.js RESTful API to perform the actions of Goals application (https://github.com/Tgarcia7/goals). 

# Initial config 

```
DB_URI=mongodb://mongo:27017/
DB_NAME=goals-test
SECRET_TOKEN=3{5j*%Y*g7&G@qgr
```

# Run

```
$ docker-compose up -d
```

# Lint

```
$ docker-compose --file docker-compose.ci.yml run --rm api bin/lint
```

# Unit tests

```bash
# run all unit test
$ docker-compose -f docker-compose.ci.yml run --rm api bin/unit
# run specific group of tests
$ docker-compose -f docker-compose.ci.yml run --rm api bin/unit __tests__/unit/models/
# run tests matching a pattern
$ docker-compose -f docker-compose.ci.yml run --rm api bin/unit -g "test-description" # e.g.: "transform"
```

# Integration tests

```bash
# start mongo
$ docker-compose -f docker-compose.ci.yml up -d mongo
$ docker-compose -f docker-compose.ci.yml up -d api
# run all tests
$ docker-compose -f docker-compose.ci.yml run --rm api bin/integration
# run specific group of tests
$ docker-compose -f docker-compose.ci.yml run --rm api bin/integration __tests__/integration/general/app.test.js
# run tests matching a pattern
$ docker-compose -f docker-compose.ci.yml run --rm api bin/integration -g "test-description" # e.g.: "/test"
```
