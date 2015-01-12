#!/bin/bash

function show_usage {
  echo "Usage: npm run deploy {dev|staging|production|custom-dev --db POSTGRES_NAME --app DOKKU_APP_NAME}"
  exit 3
}

if [[ -z "$1" ]]; then show_usage; fi

test $(git diff --cached --numstat | wc -l) -gt 0 && echo -e "I'm sorry, $USER; I'm afraid I can't do that.\nFiles are currently staged. I refuse to push to the server unless you stash or commit these changes." && exit 1

# generates a random branch name, e.g., deploy-production-7f42c9
BRANCH=deploy-$1-$(echo $RANDOM | md5sum | cut -c 1-5)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

function deploy {
  REMOTE=$1
  APP=$2
  DB=$3

  if [[ -z "$APP" || -z "$REMOTE" ]]; then show_usage; fi

  git checkout --orphan $BRANCH

  function restore {
    git checkout $CURRENT_BRANCH
    git branch -D $BRANCH
  }

  trap restore EXIT

  if [[ "$DB" ]]; then
    ssh dokku@$REMOTE postgresql:delete $DB
    ssh dokku@$REMOTE postgresql:create $DB
    ssh dokku@$REMOTE postgresql:restore $DB < core/db/schema.sql
    ssh dokku@$REMOTE postgresql:link $APP $DB
  fi

  npm run compile-sass
  git add -f public/css/*
  git commit -m "$1"
  git push dokku@$REMOTE:$APP $BRANCH:master -f
}


case "$1" in
  dev)
    deploy hlrdev.byu.edu hlrdesk hlrdesk
    ;;
  staging)
    deploy hlrdesk-staging.byu.edu hlrdesk-staging
    ;;
  production)
    deploy hlrdesk-prod.byu.edu hlrdesk
    # TODO: move data to staging
    ;;
  custom-dev)
    if [[ !"$2" ]]; then show_usage; fi;
    while (( "$2" )); do
      case "$2" in
        --db)
          DB=$3
          ;;
        --app)
          APP=$3
          ;;
        *)
          show_usage
      esac
      shift
    done
    deploy hlrdev.byu.edu $APP $DB
    ;;
  *)
    show_usage
esac
