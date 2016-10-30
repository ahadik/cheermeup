'use strict';

const randomPuppy = require('random-puppy');
/*
  Config file returns  an object with the following keys:
    twilio_sid
    twilio_token
    twilio_number : a number you've purchased on Twilio
    recipients : an array of objects of the following structure:
      number : phone number of recipient
      name
*/
const config = require('./private/config.js');
const twilio = require('twilio')(config.twilio_sid, config.twilio_token);
const request = require("request-promise");

function sendMessage(url, message){
  for (let recipient of config.recipients){
    let messageObject = {
      to: recipient.number,
      from:config.twilio_number,
      body: message ? message : '',
    }

    if (url){
      messageObject.mediaUrl = url;
    }

    try {
      twilio.messages.create(messageObject, function(err, message) {
        if (err){
          throw err;
        }else{
          console.log(message);
        }
      });
    }
    catch(err) {
      console.error(err);
    }
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
    return Object.keys(response).map(date => {
      return response[date];
    });
  });

  let moments = [];
  for (let promise of moment_promises){
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

compose('SINGLE');