# list-github-repos
Get meta-data of all repositories by a specific organisation as a pull-stream

## Usage

``` js
var pull = require('pull-stream');
var repoStream = require('list-github-repos')('YOUR-GITHUB-USERNAME');

pull(
    repoStream('mozilla'),
    pull.map(function(r) {return r.name;})
    pull.log()
);
// => outputs the names of all github repos by the mozilla organisation
```

Your github username is used as the User-Agent (as per github spec).
See [Dominic Tarr's pull-stream](https://github.com/dominictarr/pull-stream) for more details about pull-streams.

## License
MIT

