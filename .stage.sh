#!/bin/bash

test $(git diff --cached --numstat | wc -l) -gt 0 && echo "Files are staged; I refuse to push to staging unless you stash or commit these changes." && exit 1
git branch -D dokku-staging
git checkout -b dokku-staging
npm run compile-sass
git add -f public/css/*
git commit -m 'Staging'
git push dokku@hlrdesk-staging-dokku:hlrdesk-staging dokku-staging:master -f
git checkout -
git branch -D dokku-staging
