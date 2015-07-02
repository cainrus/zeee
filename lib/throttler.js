module.exports = (function () {

  'use strict';

  var updateDataInterval,
    ipData = {},// хэш с датами попыток по каждому токену.
    throttleLimit = 10, // макс кол-во попыток.
    attemptLiveTime = 60 * 1000, // время жизни попытки
    daemonTimer = 3 * 1000, // частота проверок данных.
  //console = {log:function(){}}, // disable debug log

    /**
     * Обновить хеш данных, почистив старые попытки.
     */
    updateData = function () {
      var dates, curDate = new Date() - 0;

      for (var token in ipData) {
        if (ipData.hasOwnProperty(token)) {
          dates = ipData[token];
          console.log('check token:' + token);
          if (!dates.length) {
            console.log('no attempts, clear token: ' + token);
            delete ipData[token];
          } else {
            for (var i = 0; i < dates.length; i++) {
              var timeDiff = curDate - dates[0];

              if (timeDiff > attemptLiveTime) {
                dates.shift();
                console.log('delete attempt for token ' + token + ', current:' + dates.length);

              } else {
                console.log('timeleft: ' + ((attemptLiveTime - timeDiff) / 1000) + 's');
              }

              if (!dates.length) {
                console.log('no attempts, clear token: ' + token);
                delete ipData[token];
              }
              break;

            }
          }
        }
      }
      var count = 0;
      for (var key in ipData) {
        if (ipData.hasOwnProperty(key)) {
          count++;
        }
      }
      if (!count) {
        downDataUpdate();
      }
    },

    getAttempstTimelife = function (token) {
      var dates = ipData[token];
      if (!dates) {
        return 0;
      }
      var curTimestamp = new Date() - 0;
      return parseInt((curTimestamp - dates[dates.length - 1]) / 1000, 10);
    },

    /**
     * Получить даты попыток по токену.
     * @param token
     * @returns {*}
     */
    getAttemptsDates = function (token) {
      ipData[token] = ipData[token] || [];
      return ipData[token];
    },

    /**
     * Добавить попытку к списку
     * @param {int,string} token имя списка, где будут храниться данные.
     */
    addAttempt = function (token) {
      var dates = getAttemptsDates(token);
      dates.push(new Date() - 0);
      ipData[token] = dates;
    },

    /**
     * Получить кол-во записей по токену.
     * @param token
     * @returns {int} количество записей.
     */
    attemptsCount = function (token) {
      return ipData[token] ? ipData[token].length : 0;
    },

    /**
     * Включить демон обновления данных.
     */
    setupDataUpdate = function () {
      console.log('check setup dataUpdate');
      if (!updateDataInterval) {
        console.log('dataUpdate daemon inited');
        updateDataInterval = setInterval(function () {
          updateData();
        }, daemonTimer);
      }
    },

    /**
     * Выключить демон обновления данных.
     */
    downDataUpdate = function () {
      console.log('kill dataUpdate daemon');
      clearInterval(updateDataInterval);
      updateDataInterval = null;
    };


  return {
    checkIpThrottled: function (token) {
      // is limit is exceeded?
      var attempts_count = attemptsCount(token);
      console.log('current attempts count for token:' + token + ', is ' + attempts_count + '/' + throttleLimit);
      var exceeded = attempts_count > throttleLimit;
      var exceedTime = exceeded ? getAttempstTimelife(token) : 0;

      console.log('exceeded? ' + (exceeded ? 'yes' : 'no'));
      // log attempt.
      addAttempt(token);

      setupDataUpdate();

      return exceedTime;
    }
  };
}());
