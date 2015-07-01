#!/usr/bin/env bash

if [[ -z $DEVELOPMENT_POSTGRES_URI ]]; then
  echo "DEVELOPMENT_POSTGRES_URI environment variable not set. Not dropping database." 1>&2
  exit 1;
fi

psql $DEVELOPMENT_POSTGRES_URI -tc "select 'drop table ' || tablename || ' cascade;' from pg_tables where schemaname = 'public';" | psql $DEVELOPMENT_POSTGRES_URI
