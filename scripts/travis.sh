#!/usr/bin/env bash

set -e

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    docker-compose -f docker-compose.test.yml run -e CODECLIMATE_REPO_TOKEN=$CODECLIMATE_REPO_TOKEN sut
else
    docker-compose -f docker-compose.test.yml run sut
fi
