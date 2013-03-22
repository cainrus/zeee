jQuery(function($){
  var gcss = {
    position: 'absolute',
    bottom  : 0,
    right   : 0,
    background: 'url(/img/g/0.png) top left no-repeat',
    height: '610px',
    width: '387px',
    'z-index': -100
  };
  var bcss = {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '97px',
    width: '120px',
    background: 'url(/img/zeee.png) top left no-repeat'
  }
  var balloon = $('<div id="balloon">').css(bcss);
  var girl = $('<div id="splash">').css(gcss);
  $('body').append(girl.append(balloon));
});
