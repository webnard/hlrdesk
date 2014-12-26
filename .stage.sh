#!/bin/bash

test $(git diff --cached --numstat | wc -l) -gt 0 && echo -e "I'm sorry, $USER; I'm afraid I can't do that.\nFiles are currently staged. I refuse to push to the staging server unless you stash or commit these changes." && exit 1
git branch -D dokku-staging
git checkout -b dokku-staging
npm run compile-sass
git add -f public/css/*
git commit -m 'Staging'
git push dokku@hlrdesk-staging-dokku:hlrdesk-staging dokku-staging:master -f
git checkout -
git branch -D dokku-staging
