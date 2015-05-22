#/usr/env bash

mysqldump hlrdesk_old -u root --skip-comments --skip-opt --complete-insert --no-create-info --tables users inventory checked_out languages_items media_items > to-psql.sql

# converts MySQL syntax to Postgres for these results
perl -pe 's/`/"/g' -i to-psql.sql
perl -pe 's/("users".*?)0/$1FALSE/g' -i to-psql.sql
perl -pe 's/("users".*?)1/$1TRUE/g' -i to-psql.sql
perl -pe "s/'0000-00-00'/NULL/g" -i to-psql.sql
