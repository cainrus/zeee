module.exports = function(app) {

    var
        // inject common client/server functions
        common = require(process.cwd() + '/public/js/common.js')
        // redis db instance
       ,db  = require(process.cwd() + "/db/redisConnection.js")
        // environment settings
       ,conf   = require(process.cwd() + "/settings/environment.js")
        // url counter.
       ,urlCounter = require(process.cwd() + '/classes/counter.js')('url', db)
    ;

    /**
     * Check, if it's valid subdomain for redirection
     *
     * @param {String} subdomain
     * @return {Boolean}
     */
    var isRedirectSubdomain = function(subdomain){
        return !{'cdn':1, 'www':1, '':1}[subdomain];
    };

    /**
     * Redirection by domain or 404
     */
    app.get('*', function(req, res, next) {
        var subdomain = req.subdomain;
        
        // process only non-system subdomains
        if (isRedirectSubdomain(subdomain)) {
            var urlKey = 'url:'+subdomain;
            db.hget(urlKey, 'url', function(err, url) {
                url = url&&url.toString();
                
                if (url) {
                    res.writeHead(302, {
                        'Location': url
                    });
                    res.end();
                    db.HINCRBY('url:'+subdomain, 'count', 1);
                 } else {
                    next();
                 }
            });
        } else {
            next();
        }
    });

    app.get('/last-urls', function(req, res) {

        req.session.urls = req.session.urls||[];
        // load and return short-url objects
        if (req.session.urls.length) {
            var urlCodes = req.session.urls.slice(0);
            var query = db.multi();
            while (urlCodes.length) {
                query.hgetall('url:'+urlCodes.shift());
            }
            query.exec(function (err, replies) {
                var json = JSON.stringify(replies);
                res.send(json);
            });
        // or return plain array.
        } else {
            res.send('[]');
        }
    });

    /**
     * Short url management
     */
    app.get('/', function(req, res) {
        res.render('short/index.jade', {appname:'short', title: 'Url shortener service'});
    });

    // Create new short url API
    app.post('/create', function(req, res) {

        var count = urlCounter.generate();
        console.log('/create url count: '+count);
        var shrt = count.toString(16);
        console.log('/create url shrt: '+shrt);
        var orig = common.normalizeUrl(req.body.orig);
        console.log('/create url orig: '+req.body.orig);
        if (orig && common.isValidUrl(orig) && !common.isSameDomain(orig, conf.domain)) {
            db.hmset('url:'+shrt, {url:  orig, count: 0, short: shrt, created: new Date().getTime()}, function(err, value) {

                req.session.urls = req.session.urls||[];
                req.session.urls.unshift(shrt);
                req.session.urls = req.session.urls.slice(0, 5);
                if (err) {
                    res.send(JSON.stringify({error: 'Short url hasn\'t been created.'}))
                } else {
                    res.send(JSON.stringify({shrt: shrt, orig: orig, status: 'updated'}));
                }
             });
        } else {
            res.send('{"error":"server error"}');
        }
    });

};


