#!/usr/bin/env bash
dname=$( dirname "${BASH_SOURCE[0]}" )

concurrently "cross-env BROWSER=none yarn react-start" "wait-on http://localhost:3000 && electron $dname"
