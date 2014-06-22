module.exports = function(name, db) {
    var RedisCounter = function(options) {

      var counter = (options&&options.count)||0;
      var name = (options&&options.name)||null;

      if (!options.client) {
          throw('set redis client as @client');
      }
      else {
          var client = options.client;
      }
      if (!name) {
          throw('set @name param');
      }
      else {
          name = 'counters:'+name;
      }

      // set/refresh counter if is not set
      this.refresh = function(callback) {
        client.get(name, function (err, reply) {
          counter = reply&&reply.toString();
          var validCounter = parseInt(counter) >= 0;
          if (!validCounter) {
            counter = 0;
          }
          console.log('counter: ',counter);
        });
        return this;
      };

      this.generate = function() {
        counter++;
        client.incr(name);
        return counter;
      };

      if (!options.wait) {
        this.refresh();
      }

      this.get = function() {
          return counter;
      };

    };

    return new RedisCounter({name: name, client: db});
}


