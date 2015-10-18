var paginated = require('pull-paginated-api-request');
var pull = require('pull-stream');
var debug = require('debug')('pull-liked-on-youtube');
var hyperquest = require('hyperquest');
var li = require('li');

var base_url = "https://api.github.com/orgs/";

// Example API response:
// https://api.github.com/orgs/mozilla/repos?type=public

module.exports = function(github_username, opts) {
    opts = opts || {};
    var makeRequest = opts.request || hyperquest;
    var request = paginated(function(github_organisation, newPageUrl) {
        var url = newPageUrl || base_url + github_organisation +"/repos?type=public";
        var request = makeRequest(url);
        request.setHeader('User-Agent', github_username);
        return request;
    });

    return function(github_organisation) {
        return request(github_organisation, function(response, header, cb) {
            var link = header.Link || header.link;
            var url;
            if (link) {
                var parsedLink = li.parse(link);
                url = parsedLink.next;
            }
            var items;
            try {
                items = JSON.parse(response);
            } catch(err) {
                return cb(err);
            }
            cb(null, items, url);
        });
    };
};
