(function(){
  var status = {
    request: {name:'request', id:1, 'class': 'icon-time'},
    created: {name:'created',id:2, 'class': 'icon-file'},
    updated: {name:'updated',id:3, 'class': 'icon-ok-circle'},
    error:   {name:'error', id:4, 'class': 'icon-fire'}
  };

  var isValidUrl = function(url) {
    var result = false;
    try {
        result = !!url.match(/^(:?https?\:\/\/)?(:?[\w\-\.]+\.)+\w{2,4}/i);
    } catch(e) {}
    return result;
  };
  
  var normalizeUrl = function(url) {
    url = new String(url);
    var regexp = new RegExp('^(http|https|ftp)://');
    if (!url.match(regexp)) url = 'http://' + url;
    url = url.toLowerCase();
    return url;
  }

  var getHostParts = function(url) {
      var result = {host:'',subdomain:'',domain:'',topdomain:''}, hostParts = [], host, countOfHostParts;
      host = url.replace(/^\w+\:\/\//,'').replace(/([\:\/]+).*/, '');

      result.host = host;
      countOfHostParts = host.match(/\w\.\w/g).length;

      if (countOfHostParts < 1) {
          // if parts less than 2, then do nothing
      } else if (countOfHostParts < 2) {
          hostParts = host.match(/(\w+)\.(\w+)/);
          result.domain = hostParts[1];
          result.topdomain = '.'+hostParts[2];
      } else {
          hostParts = host.match(/(\w+)\.(\w+)\.(\w+)/);
          result.subdomain = hostParts[1]+'.';
          result.domain = hostParts[2];
          result.topdomain = '.'+hostParts[3];
      }

      return result;
  };

  var isSameDomain = function(url, host) {
      var urlDomainParts = getHostParts(url);
      var hostUrlDomainParts = getHostParts(host);
      return urlDomainParts.domain == hostUrlDomainParts.domain;
  };

  var getSubdomain = function(host) {
      var subdomain = null;
      try {
          var hostParts = host.replace(/^\w+\:\/\//,'').replace(/([\:\/]+).*/, '').match(/(\w+).(\w+).(\w+)/);
          subdomain = (hostParts) ? hostParts[1] : '/';
      } catch (e) {
          console.log('Error in getSubDomain fn. Invalid arg:' + host);
      }
      return subdomain;
  };

  var set = {
      isSameDomain: isSameDomain,
      getHostParts: getHostParts,
      isValidUrl: isValidUrl,
      normalizeUrl: normalizeUrl,
      status: status,
      getSubdomain: getSubdomain
  }

  try {
    module.exports = set;
  } catch(e) {
    window.module = {exports: set}
  }
})();
