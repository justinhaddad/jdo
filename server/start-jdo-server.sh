#!/usr/bin/env bash
dname=$( dirname "${BASH_SOURCE[0]}" )

kubectl apply -f "$dname/jdo-k8s.yaml"
