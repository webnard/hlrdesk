#!/bin/bash
set -e

TEST_DB=hlrdesk_test_db
TEMPLATE_DB=hlrdesk_test_template_db
SCHEMA_FILE=core/db/schema.sql
MOCK_DATA_FILE=core/db/mock-data.sql

export $(./.env.sh)

printf "Creating and populating test database $TEST_DB"
psql -c "DROP DATABASE IF EXISTS $TEMPLATE_DB" >/dev/null
printf "."
createdb $TEMPLATE_DB >/dev/null
printf "."
psql $TEMPLATE_DB < $SCHEMA_FILE >/dev/null
printf "."
psql $TEMPLATE_DB < $MOCK_DATA_FILE >/dev/null
printf "."

psql -c "DROP DATABASE IF EXISTS $TEST_DB" >/dev/null
printf "."
createdb $TEST_DB -T $TEMPLATE_DB >/dev/null
printf " Done!\n"
PGPOOLSIZE=0 PGDATABASE=$TEST_DB TEMPLATE_DB=$TEMPLATE_DB $(npm bin)/mocha --require co-mocha --harmony tests/ "$@"
