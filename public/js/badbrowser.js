(function () {
    'use strict';
    var $ = window.jQuery;

    window.$buoop = {
        //vs: {i: 7, f: 15, o: 11, s: 4, n: 9},

    };
    if ($) {
        $(function () {
            var e = document.createElement("script");
            e.setAttribute("type", "text/javascript");
            e.setAttribute("src", window.location.protocol + "//browser-update.org/update.js");
            document.body.appendChild(e);
        });
    }


}());