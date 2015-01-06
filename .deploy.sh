#!/bin/bash

case "$1" in
  dev)
    BRANCH=dokku-devel
    REMOTE=hlrdev.byu.edu
    APP=hlrdesk
    DB=hlrdesk

    ssh dokku@$REMOTE postgresql:delete $DB
    ssh dokku@$REMOTE postgresql:create $DB
    ssh dokku@$REMOTE postgresql:restore $DB < core/db/schema.sql
    ssh dokku@$REMOTE postgresql:link $APP $DB
    ;;
  staging)
    BRANCH=dokku-staging
    REMOTE=hlrdesk-staging.byu.edu
    APP=hlrdesk-staging
    DB=hlrdesk
    ;;
  production)
    echo "Production server not set up yet."
    exit 2
    ;;
  *)
    echo "Usage: npm run deploy {dev|staging|production}"
    exit 3
esac

test $(git diff --cached --numstat | wc -l) -gt 0 && echo -e "I'm sorry, $USER; I'm afraid I can't do that.\nFiles are currently staged. I refuse to push to the server unless you stash or commit these changes." && exit 1

git branch -D $BRANCH
git checkout -b $BRANCH
npm run compile-sass
echo "Sleeping for 8 seconds to ensure that the sass is compiled."
sleep 8
git add -f public/css/*
git commit -m "$1"
git push dokku@$REMOTE:$APP $BRANCH:master -f
git checkout -
git branch -D $BRANCH
