jQuery(function(){
    var $ = jQuery;
    var authData = {
        login:    '/login',
        register: '/register',
        facebook: 'auth/facebook',
        twitter:  'auth/twitter',
        google:   'auth/google'
    }
    var form = $('#loginForm');
    var loginInput = form.find('[name="login"]');
    var passwordInput = form.find('[name="password"]');
    var loginButton = $('#login-button');
    var registerButton = $('#register-button');
    var authButtons = loginButton.add(registerButton);

    authButtons.addClass('disabled');

    loginInput.add(passwordInput).keyup(function() {
        var isEmptyInputs = !loginInput.val().length || !passwordInput.val().length;
        if (isEmptyInputs) {
            authButtons.addClass('disabled');
        } else {
            authButtons.removeClass('disabled');
        }
    });

    $('#authpanel .btn').on('click', function(){
        var button = $(this);
        var url = authData[button.attr('id')];
        if (url) {
            location.href = /*location.href.replace('www', 'api') +*/ url;
        }
    });

    var bottomBarInner = $('#bottomBar .container');
    var loginForm = $('#loginForm');
    var signinButton = $('#signin');
    signinButton.parents('.container:eq(0)').append(loginForm);
    if (bottomBarInner.css('overflow')=='hidden') {
        signinButton.click(function(){
            signinButton.hide();
            loginForm.show()

        });
    }

    $('label.checkbox span').bind('click', function(){
        $('#remember').trigger('click');
    });

    // LOGIN EVENT
    $('#login-button').bind('click',function(e) {
        if ($(this).is(':not(.disabled)')) {
            var form = $('#loginForm form');
            $.post('/login',
              {
                login:    form.find('[name="login"]').val(),
                password: form.find('[name="password"]').val()
              },
              function(json, state , xhr) {
                  console.log(json);
                  if (json.success) {
                    location.reload();
                  } else {
                    for (var i in json.errors) {
                        window.dispatcher.trigger('eventPanel.add', json.errors[i], 'error');
                    }
                    console.log(json.errors);
                  }
              }
            );
        }
        e.preventDefault();
        return false;
    });

    // REGISTER EVENT
    $('#register-button').bind('click', function(e) {
        if ($(this).is(':not(.disabled)')) {
            var form = $('#loginForm form');
            $.post('/register',
              {
                login:    form.find('[name="login"]').val(),
                password: form.find('[name="password"]').val()
              },
              function(json) {
                  if (json.success) {
                    location.reload();
                  } else {
                    for (var i in json.errors) {
                      window.dispatcher.trigger('eventPanel.add', json.errors[i], 'error');
                    }
                    console.log(json.errors);
                  }
              }
            );
        }
        e.preventDefault();
        return false;
    });
});