module.exports = (function() {

    var app = require('express').createServer(),
        everyauth = require('everyauth');


    var
        authSettings = require('./conf.js'),
        everyauth = require('everyauth');

    var usersById = {},
        nextUserId = 0,
        usersByTwitId = {},
        usersByFbId = {},
        usersByGhId = {};

    var addUser = function(source, sourceUser) {
      var user;
      if (arguments.length === 1) { // password-based
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
      } else { // non-password-based
        user = usersById[++nextUserId] = {id: nextUserId};
        user[source] = sourceUser;
      }
      return user;
    };

    var usersByLogin = {
      'root': addUser({ login: 'root', password: '123321'})
    };

    everyauth.everymodule
      .findUserById( function (id, callback) {
        callback(null, usersById[id]);
    });


    everyauth.facebook
      .appId(authSettings.fb.appId)
      .appSecret(authSettings.fb.appSecret)
      .findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
        if (!usersByFbId[fbUserMetadata.id]) {
            usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata)
        }
        return usersByFbId[fbUserMetadata.id];
    })
   .redirectPath( '/' );




    everyauth.password
      .loginWith('login')
      .getLoginPath('/login')
      .postLoginPath('/login')
      .loginView('login.jade')
      .loginLayout(false)
        //    .loginLocals({
        //      title: 'Login'
        //    })
        //    .loginLocals(function (req, res) {
        //      return {
        //        title: 'Login'
        //      }
        //    })
      .loginLocals(function (req, res, done) {
        setTimeout(function () {
            done(null, {
              title: 'Async login'
            });
        }, 200);
      })
      .authenticate( function (login, password) {
        var errors = [];
        if (!login) errors.push('Missing login');
        if (!password) errors.push('Missing password');
        if (errors.length) return errors;
        var user = usersByLogin[login];
        if (!user) return ['Login failed'];
        if (user.password !== password) return ['Login failed'];
          return user;
        })
      .getRegisterPath('/register')
      .postRegisterPath('/register')
        //    .registerLocals({
        //      title: 'Register'
        //    })
        //    .registerLocals(function (req, res) {
        //      return {
        //        title: 'Sync Register'
        //      }
        //    })
      .registerLocals( function (req, res, done) {
        setTimeout( function () {
          done(null, {
            title: 'Async Register'
          });
        }, 200);
      })
      .registerUser( function (newUserAttrs) {

        var login = newUserAttrs[this.loginKey()];
        return usersByLogin[login] = addUser(newUserAttrs);
      })
      .loginSuccessRedirect('/')
      .registerSuccessRedirect('/')
      .respondToLoginSucceed( function (res, user) {
        if (user) { /* Then the login was successful */
          res.json({ success: true }, 200);
        }
      })
      .validateRegistration( function (newUserAttrs, errors) {
        var login = newUserAttrs.login;
        if (usersByLogin[login]) errors.push('Login already taken');
        return errors;
      })
      .respondToRegistrationSucceed( function (res, user) {
        if (user) { /* Then the login was successful */
          res.json({ success: true }, 200);
        }
      })
      .respondToLoginFail( function (req, res, errors, login) {
        if (!errors || !errors.length) return;
          return res.json({ success: false, errors: errors });
      })
      .respondToRegistrationFail( function (req, res, errors, login) {
        if (!errors || !errors.length) return;
          return res.json({ success: false, errors: errors });
      });
    /*
            .handleAuthCallbackError( function (req, res) {
                // If a user denies your app, Facebook will redirect the user to
                // /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
                // This configurable route handler defines how you want to respond to
                // that.
                // If you do not configure this, everyauth renders a default fallback
                // view notifying the user that their authentication failed and why.
            })*/;


    require('./environment.js')(app)
    //    require('./routes.js')(app)

    return app;

})();