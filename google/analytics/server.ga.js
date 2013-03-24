var ua = "UA-33562697-1";
var host = 'ze.ee';
var GoogleAnalytics = require('ga');
var ga = new GoogleAnalytics(ua, host);
/** Examples:
ga.trackPage('testing/1');
ga.trackEvent({
    category: 'Videos',
    action: 'Video Loading',
    label: 'Gone With the Wind',
    value: 42
});
*/
module.exports = ga;