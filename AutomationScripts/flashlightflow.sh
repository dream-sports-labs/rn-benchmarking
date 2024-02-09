#!/bin/bash

# Test id's of views and buttons
# Variables names must be prefixed with MAESTRO_ if environament variables are manually defined in flows
# Refernce: https://maestro.mobile.dev/advanced/parameters-and-constants#parameters-and-javascript
export MAESTRO_RENDER_ANIMATION_BUTTON='render_animations'
export MAESTRO_ANIMATION_CONTAINER='animation_continer'

APP_ID=$1

if [[ -z $APP_ID ]]; then
    echo "App id must be specified to run automation script."
    exit 1
fi

flashlight test --bundleId "$APP_ID" \
  --testCommand "maestro test -e APP_ID="$APP_ID" flashlightflow.yaml" \
  --duration 10000 \
  --resultsFilePath results.json \
  --iterationCount 1
