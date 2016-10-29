let getMessage = (() => {
  var _ref = _asyncToGenerator(function* () {
    const urls = ['https://raw.githubusercontent.com/una/personal-goals/master/happy-moments/2015_happy-moments.json', 'https://raw.githubusercontent.com/una/personal-goals/master/happy-moments/2016_happy-moments.json'];
    const moment_promises = urls.map((() => {
      var _ref2 = _asyncToGenerator(function* (url) {
        const options = {
          uri: url,
          headers: {
            'User-Agent': 'Request-Promise'
          },
          json: true
        };

        const response = yield request(options);
        //return an array of happy moments
        return Object.keys(response).map(function (date) {
          return response[date];
        });
      });

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    })());
    let moments = [];
    for (promise of moment_promises) {
      moments.push((yield promise));
    }
    const flat_moments = [].concat.apply([], moments);
    return flat_moments[Math.floor(Math.random() * flat_moments.length)];
  });

  return function getMessage() {
    return _ref.apply(this, arguments);
  };
})();

let compose = (() => {
  var _ref3 = _asyncToGenerator(function* (clickType) {
    let moment, url;
    switch (clickType) {
      case "SINGLE":
        moment = yield getMessage();
        break;
      case "DOUBLE":
        url = yield randomPuppy();
        break;
      case "LONG":
        moment = yield getMessage();
        url = yield randomPuppy();
        break;
    }
    sendMessage(url, moment);
  });

  return function compose(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const randomPuppy = require('random-puppy');
const config = require('./private/config.js');
const twilio = require('twilio')(config.twilio_sid, config.twilio_token);
const request = require("request-promise");

function sendMessage(url, message) {
  for (recipient of config.recipients) {
    console.log(url, message);
    let messageObject = {
      to: recipient.number,
      from: config.twilio_number,
      body: message ? message : ''
    };

    if (url) {
      messageObject.mediaUrl = url;
    }

    twilio.messages.create(messageObject, function (err, message) {
      console.log(err);
      console.log(message);
    });
  }
}

exports.handler = (event, context, callback) => {
  console.log("Received click of type:", event.clickType);
  compose(event.clickType);
};
