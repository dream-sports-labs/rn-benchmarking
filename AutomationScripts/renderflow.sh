#!/bin/bash

# Test id's of views and buttons
# Variables names must be prefixed with MAESTRO_ if environament variables are manually defined in flows
# Refernce: https://maestro.mobile.dev/advanced/parameters-and-constants#parameters-and-javascript
# Maestro currently does not support running on physical iOS device (https://github.com/mobile-dev-inc/maestro/issues/1224#issuecomment-1624089679)

export MAESTRO_VIEW_CONTAINER='n_view_container_0'
export MAESTRO_TEXT_CONTAINER='n_text_container_0'
export MAESTRO_IMAGE_CONTAINER='n_image_container_0'
export MAESTRO_EMPTY_VIEW='render_empty_view'
export MAESTRO_RENDER_VIEW_BUTTON='render_n_views'
export MAESTRO_RENDER_TEXT_BUTTON='render_n_text'
export MAESTRO_RENDER_IMAGE_BUTTON='render_n_images'
export MAESTRO_RESET_VIEW_BUTTON='reset_view'
export MAESTRO_RESET_LOGS_BUTTON='reset_logs'
export MAESTRO_GET_REPORT_BUTTON='get_report'

APP_ID=$1
ITERATIONS=$2
DEVICE_ID=$3

if [[ -z "$APP_ID" ]]; then
    echo "App id must be specified to run automation script."
    exit 1
fi

if [[ -z $ITERATIONS ]]; then
    echo "Iterations must be specified to run automation script."
    exit 1
fi

if [[ -z $DEVICE_ID ]]; then
    maestro test -e APP_ID="$APP_ID" -e ITERATIONS=$ITERATIONS renderflow.yaml    
else
    maestro --device "$DEVICE_ID" test -e APP_ID="$APP_ID" -e ITERATIONS=$ITERATIONS renderflow.yaml
fi