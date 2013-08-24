module.exports = function (app, conf) {
    'use strict';

    var fs = require('fs'),
        jade = require('jade'),
        path = require('path'),
        viewsDirPath = path.join(conf.rootDir, 'views')

    ;

    app.all('*', function(req, res) {
        var extension = req.locals.extension;
        // Check extension and allowed url path.
        if (extension === 'html' && typeof req.url === 'string' && req.url.match(/\/html\//)) {
            var uri = path.join.apply(path, req.url.replace('.html', '.jade').split('/'));
            var templatePath = path.join(viewsDirPath, uri);
            // Check if template exists.
            if (conf.templates.indexOf(templatePath) !== -1) {
                var templateSrc = fs.readFileSync(templatePath);
                var template = jade.compile(templateSrc);
                var html = template();
                if (1 || conf.env === 'production') {
                    var cacheDir = templatePath.replace(viewsDirPath, conf.publicDir).replace('.jade', '.html');
                    fs.writeFile(cacheDir, html, function(err) {
                        if (err) {
                            console.error(err.message);
                        }
                    });
                }

                return res.send(html);
            }
        }

        return res.send(404);
    });
}