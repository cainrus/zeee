var $buoop = {
  vs:{i:7,f:12,o:10.6,s:4,n:9},
  reminder: 0,
  onshow: function(infos){
    $(function(){
      var overlay = $('<div>');
      overlay.css({width: '100%', height: '100%', position: 'fixed', top:0, left:0, 'z-index': 5000, 'background-color': '#ccc', opacity: '0.5'});
      $('#buorg').after(overlay);
      $('#buorgclose').remove();
    });
  }
};
$buoop.ol = window.onload; 
window.onload=function(){ 
 try {if ($buoop.ol) $buoop.ol();}catch (e) {} 
 var e = document.createElement("script"); 
 e.setAttribute("type", "text/javascript"); 
 e.setAttribute("src", "http://browser-update.org/update.js"); 
 document.body.appendChild(e); 
} 

