#!/usr/bin/env bash

exec open -na "Google Chrome" --args --enable-iframe-based-signin --disable-web-security --allow-external-pages --allow-cross-origin-auth-prompt "--user-data-dir=$HOME/.freshchrome" http://localhost:3000