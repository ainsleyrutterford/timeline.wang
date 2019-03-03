#!/usr/bin/env bash

echo "Running validation check online..."
java -Dnu.validator.client.content-type=application/xhtml+xml -Dnu.validator.client.port=80 -Dnu.validator.client.host=html5.validator.nu -cp node_modules/vnu-jar/build/dist/vnu.jar nu.validator.client.HttpClient public/index.html
