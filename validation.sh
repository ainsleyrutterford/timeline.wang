#!/usr/bin/env bash

echo "Running vnu html5 validation check on public/*.html"
java -Dnu.validator.client.content-type=application/xhtml+xml -Dnu.validator.client.port=80   \
    -Dnu.validator.client.host=html5.validator.nu -cp node_modules/vnu-jar/build/dist/vnu.jar \
    -Dnu.validator.client.level=error nu.validator.client.HttpClient public/*.html

echo "Running jshint error detection on *.js"
jshint *.js

echo "Running jshint error detection on public/*.js"
jshint public/*.js
