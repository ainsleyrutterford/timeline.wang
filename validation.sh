#!/usr/bin/env bash

echo "Installing jshint..."
npm install jshint --global
echo "Installing csslint..."
npm i -g csslint

echo ""
echo "Running vnu html5 validation check on public/*.html"
java -Dnu.validator.client.content-type=application/xhtml+xml -Dnu.validator.client.port=80   \
    -Dnu.validator.client.host=html5.validator.nu -cp node_modules/vnu-jar/build/dist/vnu.jar \
    -Dnu.validator.client.level=error nu.validator.client.HttpClient public/*.html

echo "Running jshint javascript error detection on *.js"
jshint *.js

echo "Running jshint javascript error detection on public/*.js"
jshint public/*.js

echo "Running csslint css validation check on public/*.css"
csslint --quiet --format=compact --ignore=order-alphabetical,ids,box-model,outline-none,font-sizes,universal-selector,fallback-colors,known-properties public/*.css
