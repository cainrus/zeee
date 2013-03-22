module.exports = function(app, db, conf) {
    var
        authSettings = require('./conf.js'),
        everyauth = require('everyauth');


    var usersById = {},
        nextUserId = 0,
        usersByTwitId = {},
        usersByFbId = {},
        usersByGhId = {};
    global.usersCommon = {};


    var addUser = function(source, sourceUser) {
      var user;
      nextUserId++;
      if (arguments.length === 1) { // password-based
        user = source;
        user.id = nextUserId;
        usersById[nextUserId] = user;
        //usersByLogin
        //db.set('usersByLogin', usersByLogin, function() {
        //  res.send(JSON.stringify({shrt: shrt, orig: orig, status: 'updated'}));
        //});
      } else { // non-password-based
        user = usersById[nextUserId] = {id: nextUserId};
        user[source] = sourceUser;
      }

      return user;
    };

    var usersByLogin = {
      'root': addUser({ login: 'root', password: '123321', name: 'root'})
    };

var userFactory = require(process.cwd() + '/classes/user.js');









require('everyauth').everymodule
  .findUserById( function (id, callback) {
    console.log('find user', usersCommon[id]);
    callback(null, usersCommon[id]);
  });



require('everyauth').facebook
  .appId(authSettings.fb.appId)
  .appSecret(authSettings.fb.appSecret)
  .findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
    var promise = this.Promise();
    var token = 'facebook' + fbUserMetadata.id;
    userFactory.getUser(token, function(err, user) {
           console.log('error', err);
           console.log('try to authenticate with facebook', user);
           // user exists
           if (user && user.isUserObj) {
               console.log('====user====');
               console.log(user);
               user.set('name', fbUserMetadata.first_name);
               usersCommon[token] = user;
               promise.fulfill(user);
           // user is not exists, we must create him
           } else {
                userFactory.getUser(null, function(err, user) {
                    // error handle
                    if (err)
                        promise.fulfill([err]);
                    // register
                    else {
                        user.set('name', fbUserMetadata.first_name);
                        user.save(token);
                        usersCommon[token] = user;
                        promise.fulfill(user);
                    }
               });
           }
        });
        return promise;
  })
  .redirectPath( '/' );
/*
        .handleAuthCallbackError( function (req, res) {
            console.log('facebook denied login request');
            // If a user denies your app, Facebook will redirect the user to
            // /auth/facebook/callba>ck?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
            // This configurable route handler defines how you want to respond to
            // that.
            // If you do not configure this, everyauth renders a default fallback
            // view notifying the user that t>heir authentication failed and why.
        })*/;



everyauth.password
  .loginWith('login')
  .getLoginPath('/login')
  .postLoginPath('/login')
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

    var promise = this.Promise();
    var token = 'password' + login + password;
    userFactory.getUser(token, function(err, user) {
       console.log('authenticate', user);
       if (user) {
           usersCommon[token] = user;
           promise.fulfill(user);
       } else
           promise.fulfill([err]);
    });
    return promise;
    })
  .getRegisterPath('/register')
  .postRegisterPath('/register')
  .registerLocals( function (req, res, done) {
    setTimeout( function () {
      done(null, {
        title: 'Async Register'
      });
    }, 200);
  })
  .validateRegistration( function (newUserAttrs, errors) {
    var promise = this.Promise();
    var login = newUserAttrs.login;
    if (usersByLogin[login]) {
        errors.push('Login already taken');
    }
    var password = newUserAttrs.password;
    if (password.length < 6) {
        errors.push('Password must be at least 6 letters');
    }

    if (errors.length) {
        return errors;
    } else {
        console.log('async registration validation');
        var token = 'password' + newUserAttrs.login + newUserAttrs.password;
        userFactory.checkUser(token, function(err, status) {
           console.log('status', status);
           if (status == 0)
               promise.fulfill([]);
           else
               promise.fulfill(['User already exists']);
        });
        return promise;
    }
  })
  .registerUser( function (newUserAttrs) {
    console.log('registerUser', newUserAttrs);
    var promise = this.Promise();
    var token = 'password' + newUserAttrs.login + newUserAttrs.password;
    usersCommon[token] = {};
    userFactory.getUser(null, function(err, user){
        // creating user error
        if (err) return promise.fulfill([err]);
        // creating user success
        else {
            user.set('name',newUserAttrs.login);
            usersCommon[token] = user;
            user.save(token);
            promise.fulfill(user);
        }
    });

    return promise;
  })
  .loginSuccessRedirect('/')
  .registerSuccessRedirect('/')
  .respondToLoginSucceed( function (res, user) {
    if (user) { /* Then the login was successful */
      res.json({ success: true }, 200);
    }
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




}

