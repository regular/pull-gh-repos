#!/bin/sh
':' //; exec "$(command -v node || command -v nodejs)" "$0" "$@"

var pull = require('pull-stream');
var pullJSON = require('pull-json-doubleline');
var repoStream = require('.')('YOUR-GITHUB-USERNAME');

if (process.argv.length<3) {
    console.error("Missing argument: organisation's name");
    process.exit(1);
}

pull(
    repoStream(process.argv[2]),
    pullJSON.stringify(),
    pull.log()
);
