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
PGPASS=password
PGHOST=localhost
PGUSER=postgres
PGDATABASE=hlrdesk
PGPORT=5432
```
