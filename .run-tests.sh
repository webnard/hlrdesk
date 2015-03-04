#!/bin/bash
set -e

TEST_DB=hlrdesk_test_db
TEMPLATE_DB=hlrdesk_test_template_db
SCHEMA_FILE=core/db/schema.sql
MOCK_DATA_FILE=core/db/mock-data.sql

export $(./.env.sh)

printf "Creating and populating test database $TEST_DB"
dropdb $TEMPLATE_DB --if-exists > /dev/null
printf "."
createdb $TEMPLATE_DB > /dev/null
printf "."
psql $TEMPLATE_DB < $SCHEMA_FILE > /dev/null
printf "."
psql $TEMPLATE_DB < $MOCK_DATA_FILE > /dev/null
printf "."
dropdb $TEST_DB --if-exists > /dev/null
printf "."
createdb $TEST_DB -T $TEMPLATE_DB > /dev/null
printf " Done!\n"
NODE_TEST=true PGPOOLSIZE=0 PGDATABASE=$TEST_DB TEMPLATE_DB=$TEMPLATE_DB node --harmony $(npm bin)/istanbul cover _mocha -- --require co-mocha --harmony tests/ "$@"
