/* global dispatcher, window, _, $, jQuery, Backbone, Handlebars */
(function () {
    'use strict';


    var common = module.exports;
    var Url = Backbone.Model.extend({
        // torage: new Store("urls-backbone"),
        url: '/create',
        defaults: {
            status: 'created'
        },
        initialize: function (options) {

        },
        validate: function (attributes) {
            var error = null;

            if (attributes) {
                var orig = attributes.orig;

                if (attributes.error) {
                    error = attributes.error;
                }
                else if (!orig || orig.length < 2) {
                    error = 'Fill in url field!';
                }
                else if (!common.isValidUrl(orig) || common.isSameDomain(orig, location.host)) {
                    error = 'Invalid url!';
                }
            }

            if (error) {
                return error;
            }
        }
    });

    _.extend(Url, Backbone.Events);

    var UrlList = Backbone.Collection.extend({
        model: Url
    });


    var UrlFabric = Backbone.View.extend({

        el: 'form#url-add-form',

        events: {
            'click #url-add-button': 'create'
        },


        initialize: function () {

            _.bindAll(this, 'clientUpdate', 'clientError', '_errorMsg');


            this.input = $('#url-add-input');
            this.input.on('click', function () {
                $(this).select();
            });

            this.button = $('#url-add-button');
            this._switchOffSubmit();
            this.model.on('error', this._errorMsg);
            //this.messagebox = $('#messages');
        },

        _switchOffSubmit: function () {
            var form = $(this.el);
            if (!form.length) alert('can\'t switch off form!');
            var button = this.button;
            form.submit(function (e) {
                e.preventDefault();
                button.trigger('click');
                return false;
            });
        },

        _errorMsg: function (model, text) {
            this.options.dispatcher.trigger('eventPanel.add', text, 'error', {data: {id: escape(text).replace(/\W+/g, '-')}});
        },

        create: _.debounce(function () {

            var inputUrl = this.input.val().trim();
            window._gaq && _gaq.push(['_trackEvent', 'process url', 'begin', inputUrl]);



            if (this.lastUrl === inputUrl) {
                this.options.dispatcher.trigger('eventPanel.add', 'try to add another url', 'error', {data: {id: 'try-another-url'}});
                window._gaq && _gaq.push(['_trackEvent', 'process url', 'client error', inputUrl]);

                return;
            } else if (inputUrl) {
                this.lastUrl = this.input.val();
            }

            var model = new this.model(),
                self = this;
            model.save(
                {
                    'orig': this.input.val()
                },
                {
                    error: function() {
                        self.lastUrl = null;
                        self.clientError.apply(self, arguments);
                    },
                    success: this.clientUpdate
                }, 300, true);
        }, 300, true),

        clientUpdate: function (model, data) {
            var shortUrl = location.host.replace('www.', model.escape('shrt') + '.');

            this.input
                .val(shortUrl)
                .select()
                .tooltip({title: "press CTRL+C to copy", trigger: 'manual', placement: 'left'})
                .on('focus', function () {
                    $(this).tooltip('show');
                })
                .trigger('focus')
                .on('blur', function () {
                    $(this).tooltip('hide');
                });

            dispatcher.trigger('updateLastUrls', model);
            window._gaq && _gaq.push(['_trackEvent', 'process url', 'success', model.orig]);

        },

        clientError: function (model, message) {
            if (message.state) {
                message = message.statusText;
            }
            message = message || 'Unknown error';
            this.options.dispatcher.trigger('eventPanel.add', message, 'error', {data: {id: escape(message).replace(/\W+/g, '-')}});
            window._gaq && _gaq.push(['_trackEvent', 'process url', 'error:' + message, model.orig]);
        }


    });


    var EventPanel = Backbone.View.extend({
        el: '.message',
        eventStack: [],
        initialize: function (options) {
            _.bindAll(this, 'add');
            options.dispatcher.on('eventPanel.add', this.add);
        },

        add: function (text, status, options) {

            if (options && options.data && options.data.id) {
                var wrapper = $('.message-wrapper:visible:has(.' + options.data.id + ')');
                if (wrapper.length) {
                    var message = wrapper.find('.' + options.data.id + ':eq(0)');
                    if (message.length) {
                        if (message.is(':not(.highlight-message)')) {
                            message.addClass('highlight-message');
                            setTimeout(function () {
                                message.removeClass('highlight-message');
                            }, 200);
                        }
                        return;
                    }
                }
            }

            var title, classes;
            switch ((options&&options.status)||status) {
                case 'error':
                    classes = 'alert-error';
                    title = 'Error';
                    break;
                case 'info':
                case 'success':
                    classes = 'alert-success';
                    title = 'Success';
                    break;
                default:
                    classes = 'alert-warning';
                    title = 'Info';
            }
            title = (options && options.title) || title;

            // Default data.
            var data = {title: title, body: text, classes: classes, time: false};
            // Extend defaults.
            if (options && options.data) {
                _.extend(data, options.data);
            }

            messageManager.addInfoMsg(data);
        }
    });

    var LastUrlsPanel = Backbone.View.extend({
        el: '.user-urls',
        initialize: function (options) {

            var self = this;
            options.dispatcher.on('reset url state', function () {
                self.update();
            });


            _.bindAll(this, 'clientUpdate');
            dispatcher.on('updateLastUrls', this.clientUpdate);
        },


        clientUpdate: function (model) {
            var shrt = model.escape('shrt');
            var orig = model.attributes.orig;
            var shortUrl = location.host.replace('www.', shrt + '.');
            messageManager.addUrlMsg({short: shortUrl, count: '0', title: orig, time: true, mascott1: true});
        },


        render: function () {

            _.each(this.collection.models.reverse(), function (model) {
                messageManager.addUrlMsg({short: model.get('synonm'), count: model.get('count'), title: model.get('source'), time: parseInt(model.get('created'))});
            }, this);

        },

        update: _.debounce(function () {
            var self = this;
            this.collection.fetch({success: function () {
                self.render();
            }});
        }, 1000, true)
    });


    var MyUrlList = Backbone.Collection.extend({
        url: 'user-urls',
        initialize: function (options) {
            this.fetch();
            this.localStorage = new Store("short:user:" + options.username + ':urls');
        },
        model: Url
    });

    var Link = Backbone.Model.extend({
    });


    var LastUrlList = Backbone.Collection.extend({
        url: '/last-urls',
        model: Link,
        initialize: function (options) {

        },

        parse: function (elements) {
            var self = this;
            return _.map(elements, function (el) {
                return {
                    synonm: el.short + '.' + self.getDomain(),
                    source: el.url,
                    count: el.count,
                    created: el.created
                };
            });
        },

        getDomain: _.memoize(function () {
            var wl = window.location;
            // domain parts
            var dp = common.getHostParts(wl.host);
            var domain = dp.domain + dp.topdomain;
            if (wl.port) {
                domain += ':' + wl.port;
            }
            return domain;
        })
    });
    var messageManager = null;
    var messageManagerClass = function () {

        var maxMessagesPerColon = 5;

        var templates = {
            message: Handlebars.compile($('#message-template').html().trim()),
            shortBody: Handlebars.compile($('#message-short-url-body').html().trim())
        };

        var wrappers = {
            urls: $('.user-urls'),
            other: $('.messages'),
            mobile: $('.mobile-common-msgs')
        };

        var timePartial = function (d) {
            if (!d) {
                d = new Date();
            }
            var time = ['0' + d.getHours() , '0' + d.getMinutes() , '0' + d.getSeconds()];
            var i, token;
            for (i in time) {
                if (time.hasOwnProperty(i)) {
                    token = time[i];
                    time[i] = token.substr(token.length - 2);
                }
            }
            time = time.join(':');
            return time;
        };

        var add = function (type, data) {
            if (data.time) {
                var d = (data.time === true) ? new Date() : new Date(data.time);
                data.time = timePartial(d);
            }

            var newMsg = templates.message({type: type, data: data});
            newMsg = $(newMsg);
            newMsg.css({position: 'relative', top: '-100px', 'z-index': 5, opacity: 0});
            var wrapper = wrappers[type];

            removeExcess(type, function () {
                var pinned = wrapper.children('.pinned:last');
                if (!!pinned.length) {
                    newMsg.insertAfter(pinned);
                } else {
                    wrapper.prepend(newMsg);
                }

                var druration = 500;
                if (data.mascott1) {
                    druration = 800;
                    animateMascott1();
                }
                newMsg.animate({top: 0, opacity: 1}, {easing: 'easeInOutExpo', duration: druration, queue: false});
            });
        };

        var animateMascott1 = function () {
            var mascott = $('#mascott');
            if (!mascott.data('right')) {
                mascott.data('right', $('#mascott').css('right'));
            }
            var right = parseInt($('#mascott').data('right'));
            mascott.show().css({top: 0, opacity: 0, right: right});
            mascott.animate({top: '110px', opacity: 0.9, right: right - 20}, { easing: 'easeInOutExpo', queue: false, duration: 800, complete: function () {
                $(this).fadeOut();
            }});

        };

        var removeExcess = function (type, callback) {
            var wrapper = wrappers[type];
            var totalMessages = wrapper.children('.message');

            if (totalMessages.length >= maxMessagesPerColon) {
                var excessMessages = totalMessages.slice(maxMessagesPerColon - 1);
                excessMessages.fadeOut(function () {
                    excessMessages.remove();
                    callback();
                });
            } else {
                callback();
            }
        };

        var prepareData = function (data) {
            data.classes = data.classes || '';
            if (data.id) {
                data.classes += ' ' + data.id;
            }
            return data;
        };

        this.addUrlMsg = function (data) {
            data = prepareData(data);
            data.classes += "alert-info short-url";
            data.body = templates.shortBody({short: data.short, count: data.count});

            add('urls', _.clone(data));
            add('mobile', _.clone(data));
        };

        this.addInfoMsg = function (data) {
            data = prepareData(data);
            add('other', _.clone(data));
            add('mobile', _.clone(data));
        };
    };


    $(function () {


        if ($.browser.mobile) {
            $('body').addClass('mobile');
        }

        messageManager = new messageManagerClass();
        jQuery(document)
            .ajaxStart(function () {
                $('#overlay').show();
            })
            .ajaxStop(function () {
                $('#overlay').hide();
            });

        var dispatcher = window.dispatcher = {};
        _.extend(dispatcher, Backbone.Events);

        var app = new UrlFabric({
            model: Url,
            collection: new UrlList(),
            dispatcher: dispatcher
        });

        var lastUrlsPanel = new LastUrlsPanel({
            collection: new LastUrlList(),
            dispatcher: dispatcher
        });

        var eventPanel = new EventPanel({
            dispatcher: dispatcher
        });

        function initMyUrlPanel() {
            var username = $('#username').text();
            var myUrlPanel = new MyUrlsPanel({
                collection: new MyUrlList({username: username}),
                dispatcher: dispatcher
            });
            myUrlPanel.update();
        }

        if ($('span#username').length) {
            initMyUrlPanel();
        }

        lastUrlsPanel.update();


        if (!$.browser.mobile && window.chrome && !chrome.app.isInstalled) {

            dispatcher.trigger('eventPanel.add', 'Simply click the icon to install extension: <span id="installChromeExt" style="cursor:pointer;position: absolute;" class="chrome-ext-icon"></span>', 'success', {data:{classes: 'pinned alert alert-success chrome-extension'}, status:'success', title: 'Google Chrome Extension availible.'});
            $('.chrome-extension .chrome-ext-icon').on('click', function() {
                var extensionUrl = $('link[rel="chrome-webstore-item"]').attr('href');
                chrome.webstore.install(
                    extensionUrl,
                    function() {
                        window._gaq && _gaq.push(['_trackEvent', 'extension', 'success']);
                        $('.message.chrome-extension').animate({opacity:0, height: 0});
                    },
                    function() {
                        window._gaq && _gaq.push(['_trackEvent', 'extension', 'failed']);
                        window.open(extensionUrl, '_tab') ||
                        (window.location.href = extensionUrl);
                    }
               );
            });
        }

        window.cookieFlags = (function () {
            var data, dict = ['returnedUser', 'mascott3hidden'];
            var handler = {
                get: function (key) {
                    if (typeof key === 'undefined') {
                        data = Number($.cookie('flags'));
                        return (Number(!!data) ? data : 0).toString(2).split('').reverse().join('');
                    } else {
                        var num = dict.indexOf(key);
                        // invalid key
                        if (num === -1) {
                            return false;
                        }
                        data = handler.get();
                        // Out of range, setting is not defined yet.
                        if (num < 0) {
                            return false;
                        }

                        return Boolean(parseInt(data[num], 10));
                    }
                },
                set: function (key, val) {
                    var num = dict.indexOf(key);
                    // invalid key
                    if (num === -1) {
                        throw('cookieFlags: key `' + key + '` is not defined in dict');
                    }
                    val = Number(Boolean(val));
                    data = String(handler.get()).split('');

                    data[num] = val;
                    data = data.map(function (a) {
                        return Number(parseInt(a, 10));
                    });
                    data = data.reverse().join('');
                    var orig = data;
                    data = Number(data);
                    data = parseInt(data, 2);
                    $.cookie('flags', data);
                    return orig;
                }
            };

            return handler;
        }());

        var isReturnedUser = window.cookieFlags.get('returnedUser');
        if (!isReturnedUser) {
            window.cookieFlags.set('returnedUser', 1);
            window.cookieFlags.set('mascott3hidden', 1);
        }

        var mascott3 = $('#mascott3');
        mascott3.click(function(){
            mascott3.toggleClass('hiddenMascott');
            var isHidden = mascott3.hasClass('hiddenMascott');
            window.cookieFlags.set('mascott3hidden', isHidden ? 1 : 0 );

        });
        var isMascott3IsHidden = window.cookieFlags.get('mascott3hidden');
        if (isMascott3IsHidden) {
            mascott3.addClass('hiddenMascott');
        }
        mascott3.removeAttr('style');


        var swapPanels = function () {

            if ($(window).width() < 767) {
                $('.user-urls').hide();
                $('.messages').hide();
                $('.mobile-common-msgs').show();
            } else {
                $('.mobile-common-msgs').hide();
                $('.user-urls').show();
                $('.messages').show();
            }
        };

        $(window).resize(swapPanels);
        swapPanels();
    });

}());
