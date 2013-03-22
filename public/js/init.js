(function($){
  // define commons
  var statusCode = module.exports.status;
  var normalizeUrl = window.module.exports.normalizeUrl;

  $(function(){
  
    // img preload snippet
    var cache = [];
    $.preLoadImages = function() {
        var args_len = arguments.length;
        for (var i = args_len; i--;) {
            var cacheImage = document.createElement('img');
            cacheImage.src = arguments[i];
            cache.push(cacheImage);
        }
    };
    // preload imgs
    $.preLoadImages("/img/glyphicons-halflings-white.png");

  
    var Settings = function() {
      this.expires = 36500;
      var data = {}; //cache
      this.set = function(key, value, local) {
        if (local) {} else {
        
          if (key == null) {
            delete data[key];
          }

          data[key] = value;
          $.cookie(key, value, { expires: this.expires, path: '/'});
        }
      };

      this.get = function(key, value, local) {
          if (local) {} else {
          data[key] = $.cookie(key);
          var value = data[key];

          return value;
        }
      };
      
      this.remove = function(key) {
        this.set(key, null);
      }
      
      //init
      
      var isReturnee = this.get('returnee');
      this.set('returnee', 1);
      
      
      $('#saveme').trigger('trigger');
      
      $('.settings-option').live('click', function(){$(this).trigger('trigger');});
      $('.settings-option').live('trigger', function() {
        var el = $(this);
        var key = el.attr('name');
        var value = el.attr('checked') ? 1:null;
        settings.set(key, value);
      })
    };
    
    var settings = new Settings();

  
    
    
    var App = function() {
      this.getShortUrl = function(data, callback) {
        $.ajax({
            dataType:'json',
            url: '/create',
            data: data,
            success: function(json) {
              if (json) {
                urlList.update(data.id, json);
              } else {
                data.status = statusCode.error.name;
                urlList.update(data.id, data);
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                data.status = statusCode.error.name;
                urlList.update(data.id, data);
            },
            complete: function(jqXHR, textStatus) {
                callback();
            }
        });
      };
      
      this.getUrl = function() {
        return $('#url-add-input').val();
      };
      
      this.urlStatus = {
        request: 1
      };
      
      
      if (settings.get('returnee')) {
        $('.settings-option').each(function(){
          var el = $(this);
          var key = el.attr('name');
          var value = settings.get(key);
          if (el.is('input[type="checkbox"]')) {
            if (value) {
              $('#savelist').attr('checked', 'checked');
            } else {
              $('#savelist').removeAttr('checked');
            }
          }
          
        });
      }
    }
    
    
    
    var UrlList = function(ui, storage) {
      var id = 1;
      var ui = ui;
      var storage = storage;
      

      
      
      var list = {};
      

      
      this.getData = function(id) {
        return list[id]||null;
      }
      
      var generateId = function() {
        while (list[id]) {
          id++;
        }
        return id++;      
      }
      
      this.getList = function() {
        return list;
      };
      
      this.add = function(data) {
        if (!list[data.id]) {
          list[data.id] = data;
          ui.add(data.id, data);
          this.save();
        } else alert('error, url already isset!');
      };
      
      this.save = function() {
        if (storage && settings.get('savelist')) {
          var jsonList = JSON.stringify(list);
          storage.setItem('list', jsonList);
        }
      }
      
      this.load = function() {
        if (storage) {
          var json = storage.getItem('list');
          if (json) {
            var buffer = JSON.parse(json);
            if (buffer) {
              list = buffer;
              ui.empty();
              ui.renderList(list);
            }
          }
        }
      }
      
      this.create = function(orig) {
        var data = {orig: orig, status: statusCode.request.name, id:  generateId()};
        return data;
      }
      
      this.update = function(id, data){
          list[id] = data;
          ui.update(id, data);
          this.save();
      }
      

      
      this.isset = function(url) {
        for (var id in list) {
          if (list[id].orig == url) return true;
        }
        return false;
      }
      
      this.load();
      $('#jobs-table .error-refresh').live('click', function(){
        var cell = $(this).parents('td');
        var data = cell.find('.url').data('url');
        var url = data.orig;
        shortUrl(url, data, function(){});
      });
    }
    
    var Table = function() {
    
      var table = $('#jobs-table');
      // будет объявлено после появления таблицы
      var cellWidth = null;

      var thead = table.find('thead');
      $('#jobs-table tbody tr').live({
        mouseenter: function(){
          var self = $(this).find('span.url');
          self.html(self.data('url').shrt);
        },
        mouseleave: function(){
          var self = $(this).find('span.url');
          self.html(self.data('url').orig);
        }
      });
      
      

      
      var data = {};
      
      this.renderList = function(list) {
        if (!isHeadingExists()) {
          createHeading();
          setLastRow();
        }
        var tr, data, index;
        for (index in list) {
          data = list[index];
          tr = createRow(index, data.orig, data.status, data.shrt);
          table.prepend(tr);
        }
        if (isEmptyTable()) {
          removeHeading();
        }

      }
      
      this.empty = function(){
        table.find('tbody tr').remove();
      }
      
      this.update = function(id, data) {
        var tr = table.find('tr.url'+id);
        if (tr.length) {
          var new_tr = createRow(data.id, data.orig, data.status, data.shrt);
          tr.replaceWith(new_tr);
          setLastRow();
        }
      }
      
      
      var setLastRow = function() {
        table.find('tbody tr.last').removeClass('last');
        table.find('tbody tr:eq(0)').addClass('last');
        
      }
      
      this.add = function(id, data) {
        if (!isHeadingExists()) { 
          createHeading();
        }
        var tr = createRow(data.id, data.orig, data.status, data.shrt);
        table.prepend(tr);
      }
      
      var animateShowRow = function(tr) {
        var inner = tr.find('div.td-inner');
        
        (inner.length&&inner||tr).hide().slideDown('fast');
      }
      
      var isEmptyTable = function(){
        return !table.find('tbody tr').length;
      }
      
      var createRow = function(id, url, status, shrt) {
        if (shrt) {
          var host = location.host.split('.').slice(-2).join('.');
          shrt = '<a href="'+location.protocol+'//'+shrt+'.'+host+'/'+'">'+shrt+'.'+host+'</a>';
        } else shrt = '';
        if (url.length>40) {
          url = url.substr(0, 20) +"…"+ url.substr(-20);
        }
        
        if (status = statusCode.error.name) {
          shrt = '<a class="error-refresh" href="javascript:true;">Refresh</a>'
        }
        
        var urlWrap = $('<span class="url">'+url+'</span>');

        urlWrap.data('url', {orig:url,shrt:shrt});

        var td = $('<td class="href"><span class="tools"></span></td>');
        td.append(urlWrap);

        var statusTool = $('<i class="icon status '+statusCode[status]['class']+'"></i>');
        var editTool = $('<i class="icon edit icon-pencil">');        
        td.find('.tools').append(statusTool, editTool);
        
        var tr = $('<tr class="url'+id+' status-'+status+'">');
        tr.append(td);

        return tr;
      }
      
      var removeHeading = function() {
        thead.hide();
      }
      

      var isHeadingExists = function() {
        return thead.is(':visible');
      };
      
      var createHeading = function() {
          thead.show();
          cellWidth = thead.find('th:eq(0)').width();
      }
    }
    
    //edit tool
    $('.edit').live('click', function(){
      var button = $(this);
      var cell = button.parent().parent();
      var form = cell.parents('table');
      if (cell.find('input').length) return;
      form.find('input').remove();
      form.find('.url').show();

      var url = cell.find('.url');
      var width = url.width()-2+'px';
      var tools = cell.find('.tools');
      url.hide();
      var input = $('<input type="text" placeholder="Type new synonym…">').css({'margin-bottom': 0, width: width});
      tools.after(input);
      input.focus();
    });
    
    var urlList = new UrlList(new Table(), localStorage);
    var app = new App();
    
    
    var id = 0;
    var getId = function(){return ++id;};
    var button = $('#url-add-button');

    // API: short url
    var shortUrl = function(url, data, callback) {
        url = normalizeUrl(url);
        if (url) {
            if (!data) {
                data = urlList.create(url);
                urlList.add(data);
            }
            app.getShortUrl(data, callback);
            
        } else {
            alert('url error!');
        }
    };
    
    // prevent default submit
    var newPostHandler = function(e) {
      button.button('loading');
      shortUrl(
          normalizeUrl(app.getUrl()),
          null,
          function() {
              button.button('reset');
              urlInput.val('');
          }
      );
      e.preventDefault();
      return false;
    };
    
    var urlInput = $('#url-add-input');
    $('#url-add-form').submit(newPostHandler);
    $('#url-add-button').click(newPostHandler);
    $('#savelist').live('trigger', function(){
      var checkbox = $(this);
      if (checkbox.attr('checked')) {
        urlList.save();
      } else {
        localStorage.removeItem('list');
      }
    });
    
    
  });
})(jQuery)
