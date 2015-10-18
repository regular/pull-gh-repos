var ListRepos  = require('./');

var test = require('tape');
var pull = require('pull-stream');
var debug = require('debug')('test');
var through = require('through');

function requestMock(responses, headers, cb) {
    var i = 0;
    return function (url) {
        debug('requested url: %s', url);
        cb(i, url);
        if (i>responses.length-1) throw new Error('Out of responses!');
        debug('response: %s', responses[i]);
        debug('headers: %s', JSON.stringify(headers[i]));
        responseStream = through(function(data) {
            if (data.headers) this.emit('response', {headers: data.headers});
            this.push(data.body);
            this.push(null);
        });
        (function(body, headers) {
            setTimeout(function() {
                responseStream.write({headers: headers, body: body});
            }, 250);
        })(responses[i], headers[i]);
        i++;
        return responseStream;
    };
}

function testHelper(t, organisation, responses, headers, urls, items) {
    return ListRepos({
        request: requestMock(responses, headers, function(i, url) {
            if (i > urls.length - 1) return t.fail();
            t.equal(url,urls[i]);
        })
    })(organisation);
}

test('should handle parse error gracefully', function(t) {
    pull(
        testHelper(t,
            'mozilla',
            ['glibberish'], [{}],
            ["https://api.github.com/orgs/mozilla/repos?type=public"]
        ),
        pull.onEnd(function(err) {
            debug(err.message);
            t.ok(err);
            t.end();
        })
    );
});

test('should handle empty array in response gracefully', function(t) {
    pull(
        testHelper(t,
            'mozilla',
            ['[]'], [{}],
            ["https://api.github.com/orgs/mozilla/repos?type=public"]
        ),
        pull.collect(function(err, values) {
            t.equal(err, null);
            t.deepEqual(values, []);
            t.end();
        })
    );
});

test.only('should make a 2nd request when Link header with relation "next" is present', function(t) {
    pull(
        testHelper(t,
            'mozilla',
            ['["item1"]', '["item2"]'], // responses
            [{Link: '<foo>; rel="next", <bar>; rel="last"'}, {}], // headers
            ["https://api.github.com/orgs/mozilla/repos?type=public", "foo"] // expected urls
        ),
        pull.collect(function(err, values) {
            t.equal(err, null);
            t.deepEqual(values, ['item1', 'item2']);
            t.end();
        })
    );
});
