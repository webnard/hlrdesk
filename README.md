hlrdesk
=======

# Requirements
* Node 0.11.12+

# Setup
Make an ignored copy copy of config.js with your personal developer info filled out. Name it config1 and ignore it in the ".gitignore" file. Very important that you name it 

For the Postgres database to work correctly, you will need to install Postgres,
create the database you wish to use, and set up certain environment variables.
Environment variables can be set up a number of ways, but for development, if
using bash in your terminal (the default on Mac and Ubuntu), the following
commands should work. The following assumes your database is running on port
5432 and your postgres user's password is set to "password"

```bash
psql -U postgres -p 5432 -c "create database hlrdesk" -W
echo "export PGHOST=localhost" >> ~/.bash_profile
echo "export PGPASS=password" >> ~/.bash_profile
echo "export PGUSER=postgres" >> ~/.bash_profile
echo "export PGDATABASE=hlrdesk" >> ~/.bash_profile
echo "export PGPORT=5432" >> ~/.bash_profile
source ~/.bash_profile
```

Now run `npm install` in the `hlrdesk` directory to install the Node
dependencies and set up the database schema.
