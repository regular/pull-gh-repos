var pull = require('pull-stream');
var repoStream = require('./')('regular');

pull(
    repoStream('mozilla'),
    pull.map(function(r) {return r.name;}),
    pull.log()
);

