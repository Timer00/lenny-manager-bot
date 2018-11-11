var request = require("request");

module.exports = {
  servers: function(callback) {
    request("https://mww-reborn-api.herokuapp.com/v1/servers", function(
      error,
      response,
      body
    ) {

      console.log(error, response, body);

      if (error || !response || response.statusCode !== 200) {
        callback([]);
      }

      if (response && response.statusCode === 200) {
        callback(JSON.parse(body));
      }

    });
  }
};
