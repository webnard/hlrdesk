#!/bin/bash
git branch -D dokku-staging
git checkout -b dokku-staging
npm run compile-sass
git add -f public/css/*
git commit -m 'Staging'
git push dokku@hlrdesk-staging-dokku:hlrdesk-staging dokku-staging:master -f
git checkout $CURRENT_BRANCH

echo "NOTE: Currently on branch dokku-staging"
