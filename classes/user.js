// db.js
var client = require('./redisConnection.js'),
  _ = require('underscore'),
  hex_md5 = require('./md5-min.js');

var nextUserId = null;
var UserFactory = function () {
  var initLoadCommandStack = false;
  var self = this;

  this.checkUser = function (token, callback) {
    client.exists('token:' + hex_md5(token), callback);
  };

  this.getUser = function (token, callback) {
    console.log('nextUserId', nextUserId);
    if (_.isNull(nextUserId)) {
      initLoadCommandStack = initLoadCommandStack || [];
      initLoadCommandStack.push([token, callback]);
      console.log('UserFactory is not ready, pushed command into wait stack');
    } else {
      var user = new User();
      if (token) {
        console.log('loading user');
        user.login(token, function (err, user) {
          callback(err, user);
        });
      } else {
        console.log('creating user');
        user.set('id', incr());
        user.set('created', parseInt((new Date()).getTime() / 1000));
        callback(null, user);
      }
    }
  };

  // incriment user counter
  var incr = function () {
    client.incr('global:nextUserId');
    return ++nextUserId;
  };

  var doStack = function () {
    _.each(initLoadCommandStack, function (command) {
      console.log('UserFactory is doing command from wait stack');
      self.getUser(command[0], command[1]);
    });
  }

  // init counter
  client.get('global:nextUserId', function (err, dbNextUserId) {
    if (_.isNull(dbNextUserId)) {
      nextUserId = 1;
    } else nextUserId = dbNextUserId;

    if (initLoadCommandStack) {
      doStack();
      initLoadCommandStack = false;
    }
  });

};

// User class
var User = function () {

  this.isUserObj = true;

  var data = {id: null};
  var key;
  var self = this;

  // set property
  this.set = function (key, value) {
    data[key] = value;
  };

  // get property
  this.get = function (key) {
    return data[key];
  }

  // save user state
  this.save = function (userKey) {
    if (!userKey && _.isNull(key)) {
      this.lastError = 'Can\'t save user without id';
      return false;
    } else {
      key = userKey;
    }
    var encodedData = encodeData();
    console.log('encodedData', encodedData);
    client.HMSET('token:' + hex_md5(key), encodedData);
    self.id = key;
  };

  // load user state
  this.login = function (token, callback) {
    callback = callback || function () {
      };
    client.hgetall('token:' + hex_md5(token), function (err, result) {
      if (err) {
        console.log('redis error: ' + err);
        callback(err);
      } else if (_.isEmpty(result)) {
        console.log('can\'t login, invalid user or user is not isset');
        console.log('callback', callback);
        callback('invalid user', null);
      } else {
        console.log('login is success', result);
        data = decodeData(result);
        data['lastlogin'] = parseInt((new Date()).getTime() / 1000);
        self.id = token;
        callback(null, this);
      }
    });
  }

  var encodeData = function () {
    var newData = {};
    _.each(data, function (value, key) {
      if (_.isObject(value) || _.isArray(value)) {
        newData[key] = JSON.encode(value);
      } else {
        newData[key] = value + '';
      }
    });
    return newData;
  };

  var decodeData = function (encodedData) {
    if (_.isObject(encodedData)) {
      return _.map(encodedData, function (value) {
        if (value.length >= 2 && ((value[0] == '{' && value[value.length - 1] == '}') || (value[0] == '[' && value[value.length - 1] == ']')))
          return JSON.decode(value);
        else
          return value;
      });
    } else return {};
  };


};


module.exports = new UserFactory();