#!/bin/bash
fullStamp=$(date +%Y%m%d%H%M%S)
pkg --target node8 --out-path ./builds/$fullstamp ./source/jtree.js
