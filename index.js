const randomPuppy = require('random-puppy');
const config = require('./private/config.js');
const twilio = require('twilio')(config.twilio_sid, config.twilio_token);
const request = require("request-promise");

function sendMessage(url, message){
  for (recipient of config.recipients){
    console.log(url, message);
    let messageObject = {
      to: recipient.number,
      from:config.twilio_number,
      body: message ? message : '',
    }

    if (url){
      messageObject.mediaUrl = url;
    }

    twilio.messages.create(messageObject, function(err, message) {
        console.log(err);
        console.log(message);
    });
  }
}

async function getMessage(){
  const urls = ['https://raw.githubusercontent.com/una/personal-goals/master/happy-moments/2015_happy-moments.json', 'https://raw.githubusercontent.com/una/personal-goals/master/happy-moments/2016_happy-moments.json']
  const moment_promises = urls.map(async url => {
    const options = {
      uri : url,
      headers: {
        'User-Agent' : 'Request-Promise'
      },
      json: true
    };

    const response = await request(options);
    //return an array of happy moments
    return Object.keys(response).map(date => {
      return response[date];
    });
  });
  let moments = [];
  for (promise of moment_promises){
    moments.push(await promise);
  }
  const flat_moments = [].concat.apply([], moments);
  return flat_moments[Math.floor(Math.random()*(flat_moments.length))]
}

async function compose(clickType){
  let moment, url;
  switch(clickType){
    case "SINGLE":
      moment = await getMessage();
      break;
    case "DOUBLE":
      url = await randomPuppy();
      break;
    case "LONG":
      moment = await getMessage();
      url = await randomPuppy();
      break;
  }
  sendMessage(url, moment);
}

exports.handler = (event, context, callback) => {
  console.log("Received click of type:", event.clickType);
  compose(event.clickType);
}