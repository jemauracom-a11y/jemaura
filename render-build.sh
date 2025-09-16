#!/usr/bin/env bash
# Exit on error
set -o errexit

npm install
npm rebuild sqlite3 --build-from-source
