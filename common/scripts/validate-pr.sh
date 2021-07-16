#!/bin/bash

APPLINK="tools/applink/dist/index.js"
PKGS=`git diff --name-only master...HEAD | node ${APPLINK} findImpacted`

echo ${PKGS}

for pkg in ${PKGS}; do {
  echo "Starting tests in: ${pkg}"

  { cd ${pkg}; npm run validate-ci; } & pid=$!
  PID_LIST+=" $pid";
} done

trap "kill $PID_LIST" SIGINT

for pid in $PID_LIST; do
    wait $pid
    if [ $? -ne 0 ]; then
        exit 1
    fi
done

