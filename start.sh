#!/bin/sh
# Ensure we run the app, not the build
exec node services/planning-engine/dist/index.js
