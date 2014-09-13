
MOCHA_OPTS=--require should
REPORTER = spec

check: test

test: import all

import:
	@NODE_ENV=test node test/import.js

all:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/app \
		test/appjs \
		test/cli \
		test/db \
		test/editview \
		test/routes

.PHONY: test
