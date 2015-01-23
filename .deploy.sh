#!/bin/bash

# generates a random branch name, e.g., deploy-production-7f42c9
BRANCH=deploy-$1-$(echo $RANDOM | md5sum | cut -c 1-5)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

case "$1" in
  dev)
    REMOTE=hlrdev.byu.edu
    APP=hlrdesk
    DB=hlrdesk

    echo "DROP SCHEMA IF EXISTS public cascade; CREATE SCHEMA public;" | ssh dokku@$REMOTE postgresql:restore $DB
    ssh dokku@$REMOTE postgresql:restore $DB < core/db/schema.sql
    ;;
  staging)
    REMOTE=hlrdesk-staging.byu.edu
    APP=hlrdesk-staging
    ;;
  production)
    REMOTE=hlrdesk-prod.byu.edu
    APP=hlrdesk

    # TODO: move data to staging
    ;;
  *)
    echo "Usage: npm run deploy {dev|staging|production}"
    exit 3
esac

test $(git diff --cached --numstat | wc -l) -gt 0 && echo -e "I'm sorry, $USER; I'm afraid I can't do that.\nFiles are currently staged. I refuse to push to the server unless you stash or commit these changes." && exit 1

git checkout --orphan $BRANCH

function restore {
  git checkout $CURRENT_BRANCH
  git branch -D $BRANCH
}

trap restore EXIT

npm run compile-sass
git add -f public/css/*
git commit -m "$1"
git push dokku@$REMOTE:$APP $BRANCH:master -f

