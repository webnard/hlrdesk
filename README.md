hlrdesk
=======

## Setup

### Configuration

You will need to set the following environment variables. The following
example is for a `~/.pam_environment` file on an Ubuntu machine. `npm start`
will attempt to evaluate this file (see `package.json` for details) if it
exists.

```bash
HLRDESK_DEV=true

# for false, uncomment the following line
#HLRDESK_DEV=

PORT=80 # this is unprefixed for Dokku's sake
HLRDESK_HOST=hlrdesk.byu.edu

# Postgres database values

PGPASSWORD=password
PGHOST=localhost
PGUSER=postgres
PGDATABASE=hlrdesk
PGPORT=5432
PGPOOLSIZE=10

# for Postgres versions < 9.4
PGPASS=password

#Google Analytics ID
GAID=UA-57856521-1

# Email G00dness

EMAIL=hlr.dev.useyouremailN00Bulous@gmail.com
EMAILSERVICE=Gmail (note the cap)
EMAILPASS=my.password.here
```

### Deployment

Deployment to our servers can be done using one of the following commands and
should typically only take place through Travis (see the `.travis.yml` file for
specification).

```bash
npm run deploy dev # to update ianh.hlrdev.byu.edu
npm run deploy staging # to update hlrdesk-staging.byu.edu
npm run deploy production # to update hlrdesk.byu.edu
```

All versions must needs be from the list of My Little Pony characters
http://mlp.wikia.com/wiki/Characters
