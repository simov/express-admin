
MOCHA_OPTS=--require should
REPORTER = spec

check: test

test: import test-utils test-core

import:
	@NODE_ENV=test node test/import.js

test-utils:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/utils/index.js

test-core:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/core/index.js

.PHONY: test import test-utils test-core
