module.exports = function (app) {
    app.all('*', function(req, res) {
        res.send(404);
    });
}