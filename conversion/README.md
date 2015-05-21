This directory has scripts for the conversion of
HLRDesk v3.3 SQL files to HLRDesk v5.0 SQL files.

First, run the conversion.sql file on the old database.

Then, run mysqldump on the old database and only include these
tables:

* users
* checked_out
* inventory
* media_items
* languages_items

Import these into the new Postgres database.
