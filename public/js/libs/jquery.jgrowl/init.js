jQuery(function(){
    var $ = jQuery;

    var loadCss = $.ajax({
      url: "/js/libs/jquery.jgrowl/jquery.jgrowl.css"
    }).done(function(css) { 
      var style = $("<style></style>");
      style.html(css).appendTo('head');
    });
    
    var loadJs = $.ajax({
      url: "/js/libs/jquery.jgrowl/jquery.jgrowl.js"
    }).done(function(css) { 
      var style = $("<style></style>");
      style.html(css).appendTo('head');
    });
    
    $.when(loadCss, loadJs)
      .done(function() {
        // default settings
        // http://plugindetector.com/jgrowl
        $.jGrowl.defaults.closer = false;
        $.jGrowl.defaults.speed = 0;
      })
      .fail(function() {
        throw 'jGrowl was not inited!';
      });
});
