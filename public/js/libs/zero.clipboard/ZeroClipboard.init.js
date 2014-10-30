jQuery(function($){

    var cdnDomain = 'http://cdn.' + module.exports.getHostParts(location.href).domain + module.exports.getHostParts(location.href).topdomain+':'+location.port;
    var currentZeroButton, prevZeroButton, bufferText, clip;

    // No need to do anything with mobile device.
    if ($.browser.mobile) {
        return;
    }

    clip = new ZeroClipboard(null, {
      moviePath: cdnDomain + "/js/libs/zero.clipboard/ZeroClipboard.swf",
      trustedDomains: ['*'],
      activeClass: 'active'
    });

    clip.on('noflash', _.once(function ( client, args ) {
      dispatcher.trigger('eventPanel.add', 'Install latest flash player to use copy button. <strong>Flash player is not installed.</strong>' , 'warning');
    }));

    // Notify user about old flash version.
    clip.on( 'wrongflash', function ( client, args ) {
      dispatcher.trigger('eventPanel.add', 'Install latest flash player to use copy button. Your <strong>flash version is too old.</strong>: ' + args.flashVersion , 'warning');
    });

    clip.on('load', function(client, args) {
      dispatcher.trigger('eventPanel.add', 'In order to copy shortened url to the clipboard, just click the <strong>copy</strong> button.' , 'info', {data:{title:'Tip'}});
    });



    //<button type="button" class="close" data-dismiss="alert">×</button>


    $(document).on('mouseenter', '.short-url', function(){
      // ignore rebinding.
      currentZeroButton = $(this).find('.copy-button');
      if (currentZeroButton.is('#zeroButton')) {
          return;
      }
      // unbind previous button.
      prevZeroButton = $('#zeroButton');
      if (prevZeroButton.length) {
        clip.unglue(prevZeroButton);
        prevZeroButton.removeAttr('id');
      }
      // activate new button.
      currentZeroButton.attr('id', 'zeroButton');
      clip.glue(currentZeroButton);
      // set text to buffer.
      bufferText = $(this).find('.link').eq(0).html();
      clip.setText(bufferText.trim());

      clip.on( 'complete', function(client, args) {
        dispatcher.trigger('eventPanel.add', 'The url <strong><em>'+args.text+'</em></strong> has been copied to clipboard.' ,'warning', {data:{id:'copy-buffer'}});
      });
    });
});